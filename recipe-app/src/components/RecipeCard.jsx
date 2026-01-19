import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export default function RecipeCard({ recipe, refresh }) {
  const [likes, setLikes] = useState(recipe.likes)
  const [userLiked, setUserLiked] = useState(false)
  const [user, setUser] = useState(null)
  const [loadingLike, setLoadingLike] = useState(false)

  const isAdmin = user?.app_metadata?.role === 'admin'
  const isOwner = recipe.user_id === user?.id

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

  // Handle like
  const handleLike = async () => {
  if (userLiked || loadingLike) return
  if (!user) {
    alert('Login to like!')
    return
  }

  setLoadingLike(true)

  // 1️⃣ Insert like row first
  const { error } = await supabase.from('recipe_likes').insert({
    recipe_id: recipe.id,
    user_id: user.id
  })

  if (error) {
    if (error.code === '23505') {
      // Already liked
      setUserLiked(true)
    } else {
      console.error(error)
      alert('Failed to like recipe')
    }
    setLoadingLike(false)
    return
  }

  // 2️⃣ Increment likes count atomically via RPC
  const { error: rpcError } = await supabase.rpc('increment_recipe_likes_int', { p_recipe_id: recipe.id })

  if (rpcError) {
    console.error(rpcError)
    alert('Failed to increment likes')
  } else {
    // Update local state
    setLikes((prev) => prev + 1)
    setUserLiked(true)
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

      <button onClick={handleLike} disabled={userLiked || loadingLike}>
        {userLiked ? 'Liked ❤️' : 'Like ❤️'}
      </button>

      {(isAdmin || isOwner) && (
        <button
          onClick={handleDelete}
          style={{ color: 'red', marginLeft: '1rem' }}
        >
          Delete
        </button>
      )}
    </div>
  )
}
