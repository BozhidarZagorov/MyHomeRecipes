import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import RecipeCard from '../components/RecipeCard'
import RecipeForm from '../components/RecipeForm'

export default function Recipes() {
  const [recipes, setRecipes] = useState([])

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
      <h1>🍲 Recipes</h1>
      <RecipeForm refresh={fetchRecipes} />
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} refresh={fetchRecipes} />
      ))}
    </div>
  )
}
