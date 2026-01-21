import { useNavigate } from 'react-router-dom'

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="cursor-pointer bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden"
    >
      {recipe.image_url && (
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="h-56 w-full object-cover"
        />
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {recipe.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
          {recipe.description}
        </p>
      </div>
    </div>
  )
}
