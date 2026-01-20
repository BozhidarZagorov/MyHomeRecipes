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

  // Fetch logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  // Check if user liked recipe
  useEffect(() => {
    if (!user) return

    supabase
      .from('recipe_likes')
      .select('id')
      .eq('recipe_id', recipe.id)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setUserLiked(!!data))
  }, [user, recipe.id])

  const handleSave = async () => {
    const { error } = await supabase
      .from('recipes')
      .update({ title, description })
      .eq('id', recipe.id)

    if (error) {
      alert('Failed to update recipe')
      return
    }

    setIsEditing(false)
    refresh()
  }

  const handleLike = async () => {
    if (loadingLike) return
    if (!user) return alert('Login to like!')

    setLoadingLike(true)

    if (!userLiked) {
      const { error } = await supabase.from('recipe_likes').insert({
        recipe_id: recipe.id,
        user_id: user.id
      })

      if (!error) {
        await supabase.rpc('increment_recipe_likes_int', {
          p_recipe_id: recipe.id
        })
        setLikes((prev) => prev + 1)
        setUserLiked(true)
      }
    } else {
      const { error } = await supabase
        .from('recipe_likes')
        .delete()
        .eq('recipe_id', recipe.id)
        .eq('user_id', user.id)

      if (!error) {
        await supabase.rpc('decrement_recipe_likes_int', {
          p_recipe_id: recipe.id
        })
        setLikes((prev) => Math.max(prev - 1, 0))
        setUserLiked(false)
      }
    }

    setLoadingLike(false)
    refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this recipe?')) return

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipe.id)

    if (error) {
      alert('Delete failed')
      return
    }

    refresh()
  }

  return (
    <div className="group">
      {/* Image */}
      {recipe.image_url && (
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="h-full w-full object-cover object-center group-hover:opacity-75"
          />
        </div>
      )}

      {/* Content */}
      <div className="mt-4">
        {isEditing ? (
          <>
            <input
              className="w-full rounded border p-2 mb-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full rounded border p-2 mb-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="rounded bg-green-600 px-3 py-1 text-white"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded bg-gray-300 px-3 py-1"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm text-gray-700 font-medium">
              {recipe.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {recipe.description}
            </p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              ❤️ {likes}
            </p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={handleLike}
          disabled={loadingLike}
          className={`rounded px-3 py-1 text-sm ${
            userLiked
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {userLiked ? 'Unlike 💔' : 'Like ❤️'}
        </button>

        {canEdit && !isEditing && (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700"
            >
              Edit ✏️
            </button>
            <button
              onClick={handleDelete}
              className="rounded bg-red-100 px-3 py-1 text-sm text-red-700"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}
