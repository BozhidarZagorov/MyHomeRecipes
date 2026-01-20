import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export default function RecipeCard({ recipe, refresh }) {
  const [likes, setLikes] = useState(recipe.likes)
  const [userLiked, setUserLiked] = useState(false)
  const [user, setUser] = useState(null)
  const [loadingLike, setLoadingLike] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(recipe.title)
  const [description, setDescription] = useState(recipe.description)

  const isAdmin = user?.app_metadata?.role === 'admin'
  const isOwner = recipe.user_id === user?.id
  const canEdit = isAdmin || isOwner

  // Fetch logged-in user once
  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  // Check if current user already liked this recipe
  const fetchUserLike = async (currentUser) => {
    if (!currentUser) return

    const { data, error } = await supabase
      .from('recipe_likes')
      .select('id')
      .eq('recipe_id', recipe.id)
      .eq('user_id', currentUser.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching like:', error)
      return
    }

    setUserLiked(!!data)
  }

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (user) fetchUserLike(user)
  }, [user])

  const handleSave = async () => {
    const { error } = await supabase
      .from('recipes')
      .update({
        title,
        description
      })
      .eq('id', recipe.id)

    if (error) {
      console.error(error)
      alert('Failed to update recipe')
      return
    }

    setIsEditing(false)
    refresh()
  }


  const handleLike = async () => {
  if (loadingLike) return
  if (!user) {
    alert('Login to like!')
    return
  }

  setLoadingLike(true)

  if (!userLiked) {
    // ===== LIKE =====
    const { error } = await supabase.from('recipe_likes').insert({
      recipe_id: recipe.id,
      user_id: user.id
    })

    if (error) {
      if (error.code !== '23505') {
        console.error(error)
        alert('Failed to like recipe')
        setLoadingLike(false)
        return
      }
    }

    const { error: rpcError } = await supabase.rpc(
      'increment_recipe_likes_int',
      { p_recipe_id: recipe.id }
    )

    if (rpcError) {
      console.error(rpcError)
      alert('Failed to increment likes')
    } else {
      setLikes((prev) => prev + 1)
      setUserLiked(true)
    }
  } else {
    // ===== UNLIKE =====
    const { error } = await supabase
      .from('recipe_likes')
      .delete()
      .eq('recipe_id', recipe.id)
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      alert('Failed to unlike recipe')
      setLoadingLike(false)
      return
    }

    const { error: rpcError } = await supabase.rpc(
      'decrement_recipe_likes_int',
      { p_recipe_id: recipe.id }
    )

    if (rpcError) {
      console.error(rpcError)
      alert('Failed to decrement likes')
    } else {
      setLikes((prev) => Math.max(prev - 1, 0))
      setUserLiked(false)
    }
  }

  setLoadingLike(false)
  refresh()
}

  // Handle delete (owner OR admin)
  const handleDelete = async () => {
    if (!user) {
      alert('You must be logged in')
      return
    }

    const confirmed = window.confirm('Delete this recipe?')
    if (!confirmed) return

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipe.id)

    if (error) {
      console.error(error)
      alert('Failed to delete recipe')
      return
    }

    refresh()
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
      <h3>{recipe.title}</h3>
      <p>{recipe.description}</p>

      <p>Likes: {likes}</p>

      <button onClick={handleLike} disabled={loadingLike}>
        {userLiked ? 'Unlike 💔' : 'Like ❤️'}
      </button>

      {(isAdmin || isOwner) && (
        <>
        <button onClick={() => setIsEditing(true)}>Edit ✏️</button>
        <button
          onClick={handleDelete}
          style={{ color: 'red', marginLeft: '1rem' }}
        >
          Delete
        </button>
        </>
      )}

      {isEditing ? (
        <>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </>
      ) : ( "" )}
    </div>
  )
}
