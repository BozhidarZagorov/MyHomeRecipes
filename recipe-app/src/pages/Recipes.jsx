import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import RecipeCard from '../components/RecipeCard'
import { useNavigate } from 'react-router-dom'

export default function Recipes() {
  const [recipes, setRecipes] = useState([])
  const navigate = useNavigate()

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setRecipes(data)
  }

  useEffect(() => {
    fetchRecipes()
  }, [])

  return (
    
    <div>
       <div className="w-screen flex flex-col items-center mb-8 px-4">
      {/* Big header */}
      <div className="text-5xl sm:text-6xl font-bold text-white mb-6">
        🍲 Recipes
      </div>
          <div className="w-screen bg-white/60 backdrop-blur-md p-6 rounded-lg flex flex-col items-center">
            {/* Header + Button */}
            <div className="mb-6 text-center">
              <button
                onClick={() => navigate('/create')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-lg text-lg transition"
              >
                Add a Recipe
              </button>
            </div>

            {/* Recipe Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} refresh={fetchRecipes} />
              ))}
            </div>
          </div>
      </div>
    </div>
  )
}
