import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { StarIcon } from '@heroicons/react/20/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function RecipeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState(null)
  const [user, setUser] = useState(null)
  const [userLiked, setUserLiked] = useState(false)
  const [loadingLike, setLoadingLike] = useState(false)

  const isAdmin = user?.app_metadata?.role === 'admin'
  const isOwner = recipe?.user_id === user?.id
  const canEdit = isAdmin || isOwner

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchRecipe()
  }, [])

  useEffect(() => {
    if (!user || !recipe) return

    supabase
      .from('recipe_likes')
      .select('id')
      .eq('recipe_id', recipe.id)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setUserLiked(!!data))
  }, [user, recipe])

  const fetchRecipe = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (!error) setRecipe(data)
  }

  const handleLike = async () => {
    if (!user) return alert('Login to like')
    if (loadingLike) return

    setLoadingLike(true)

    if (!userLiked) {
      await supabase.from('recipe_likes').insert({
        recipe_id: recipe.id,
        user_id: user.id
      })

      await supabase.rpc('increment_recipe_likes_int', {
        p_recipe_id: recipe.id
      })

      setRecipe({ ...recipe, likes: recipe.likes + 1 })
      setUserLiked(true)
    } else {
      await supabase
        .from('recipe_likes')
        .delete()
        .eq('recipe_id', recipe.id)
        .eq('user_id', user.id)

      await supabase.rpc('decrement_recipe_likes_int', {
        p_recipe_id: recipe.id
      })

      setRecipe({ ...recipe, likes: Math.max(recipe.likes - 1, 0) })
      setUserLiked(false)
    }

    setLoadingLike(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this recipe?')) return

    await supabase.from('recipes').delete().eq('id', recipe.id)
    navigate('/recipes')
  }

  if (!recipe) return null

  return (
  <div className="">

     {/* Glassy wrapper*/}
    <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg max-w-5xl w-full">

    <div className="pt-6 pb-12">

      {/* Image */}
      <div className="pt-6 max-w-4xl px-4">
        <div className="bg-white rounded-lg p-6 shadow">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="rounded-lg object-cover w-full h-[400px]"
          />
        </div>
      </div>

      <div className="pt-6 max-w-4xl px-4">
        <div className="bg-white rounded-lg p-6 shadow">
            <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>

            {/* Likes */}
            <div className="mt-4 flex items-center">
          {[0, 2, 5, 10, 15].map((i) => (
            <StarIcon
              key={i}
              className={classNames(
                recipe.likes > i ? 'text-yellow-400' : 'text-gray-200',
                'h-5 w-5'
              )}
            />
          ))}
          <span className="ml-3 text-sm text-gray-600">
            {recipe.likes} likes
          </span>
        </div>

            <button
              onClick={handleLike}
              disabled={loadingLike}
              className="mt-6 w-full rounded-md bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700"
            >
              {userLiked ? '💔 Unlike' : '❤️ Like Recipe'}
            </button>

            {canEdit && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/edit/${recipe.id}`)}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="pt-6 max-w-4xl px-4">
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Description
            </h2>

            <p className="text-gray-700 leading-relaxed">
              {recipe.description}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow mt-6">

            {recipe.steps && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Steps
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {recipe.steps}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
