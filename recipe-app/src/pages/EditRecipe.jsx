import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { uploadToCloudinary } from '../utils/uploadToCloudinary'
import { useAuthGuard } from '../hooks/RoteGuard'

export default function EditRecipe() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { user, loading: authLoading } = useAuthGuard()


  const [recipe, setRecipe] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchRecipe = async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error(error)
        return
      }

      setRecipe(data)
      setTitle(data.title)
      setDescription(data.description)
      setSteps(data.steps || '')
    }

    fetchRecipe()
  }, [user, id])

  useEffect(() => {
    if (user && recipe) {
      const isAdmin = user.app_metadata?.role === 'admin'
      const isOwner = recipe.user_id === user.id
      const canEdit = isAdmin || isOwner

      if (!canEdit) {
        navigate("/", { state: { message: "You are not the creator of this recipe!" } })
      }
    }
  }, [user, recipe, navigate])
  
  if (authLoading || !user || !recipe) return <div>Loading...</div>

  const handleSave = async () => {
    if (!title || !description) {
      alert('Title and description are required')
      return
    }

    setSaving(true)
    try {
      let imageUrl = recipe.image_url
      if (imageFile) imageUrl = await uploadToCloudinary(imageFile)

      const { error } = await supabase
        .from('recipes')
        .update({ title, description, steps, image_url: imageUrl })
        .eq('id', id)

      if (error) throw error

      navigate(`/recipes/${id}`)
    } catch (err) {
      console.error(err)
      alert('Failed to update recipe')
    }
    setSaving(false)
  }

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg max-w-5xl w-full space-y-10 mx-auto mt-10">
      {/* Image preview */}
      <div className="bg-white/90 rounded-lg p-6 shadow">
        <img
          src={imageFile ? URL.createObjectURL(imageFile) : recipe.image_url}
          alt={title}
          className="rounded-lg object-cover w-full h-[400px]"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="block w-full text-sm text-black mt-4"
        />
      </div>

      {/* Form */}
      <div className="bg-white/90 rounded-lg p-6 shadow space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Recipe</h1>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Steps</label>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            rows={6}
            className="w-full rounded-md border px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-md bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            onClick={() => navigate(`/recipes/${id}`)}
            className="flex-1 rounded-md bg-gray-300 px-6 py-3 font-semibold hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
