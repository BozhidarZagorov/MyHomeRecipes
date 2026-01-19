import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export default function RecipeCard({ recipe, refresh }) {
  const [likes, setLikes] = useState(recipe.likes)
  const [userLiked, setUserLiked] = useState(false)

  const fetchUserLike = async () => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return
    const { data } = await supabase
      .from('recipe_likes')
      .select('*')
      .eq('recipe_id', recipe.id)
      .eq('user_id', user.id)
      .maybeSingle()
    setUserLiked(!!data)
  }
  

  useEffect(() => {
    fetchUserLike()
  }, [])

  const handleLike = async () => {
    if (userLiked) return // prevent double-like

    const user = (await supabase.auth.getUser()).data.user
    if (!user) return alert('Login to like!')

    const { error } = await supabase.from('recipe_likes').insert({
      recipe_id: recipe.id,
      user_id: user.id
    })
    if (error) {
      if (error.code === '23505') {
        // unique constraint violation
        setUserLiked(true)
        return
      }
      return alert(error.message)
    }

    // Update recipe likes count
    await supabase
      .from('recipes')
      .update({ likes: likes + 1 })
      .eq('id', recipe.id)

    setLikes(likes + 1)
    setUserLiked(true)
    refresh()
    
  }

  const handleDelete = async () => {
  const { data: { user } } = await supabase.auth.getUser()
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

  // refresh recipe list
  refresh()
}

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
      <h3>{recipe.title}</h3>
      <p>{recipe.description}</p>
      <p>Likes: {likes}</p>
      <button onClick={handleLike} disabled={userLiked}>
        {userLiked ? 'Liked ❤️' : 'Like ❤️'}
      </button>
      <button onClick={handleDelete} style={{ color: 'red' }}>
        Delete
      </button>
    </div>
  )
}

