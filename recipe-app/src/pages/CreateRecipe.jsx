import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { uploadToCloudinary } from '../utils/uploadToCloudinary'
import { useNavigate } from 'react-router-dom'
import { useAuthGuard } from '../hooks/RoteGuard'

export default function CreateRecipe({ refresh = () => {} }) {
  const [title, setTitle] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuthGuard(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { state: { message: 'You must be logged in to create a recipe' } })
    }
  }, [user, authLoading, navigate])

  if (authLoading || !user) return <div>Loading...</div>

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) {
      setImageFile(file)
    }
  }

  const handleCreate = async () => {
    // validation
    if (
      !title.trim() ||
      !description.trim() ||
      !ingredients.trim() ||
      !steps.trim()
    ) {
      alert('All fields are required')
      return
    }

    if (!imageFile) {
      alert('Please upload an image for the recipe')
      return
    }

    if (loading) return
    setLoading(true)

    try {
      // Upload image required
      const imageUrl = await uploadToCloudinary(imageFile)

      const { data: { user: currentUser } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('recipes')
        .insert({
          title: title.trim(),
          description: description.trim(),
          ingredients: ingredients.trim(),
          steps: steps.trim(),
          image_url: imageUrl,
          user_id: currentUser.id,
          likes: 0,
        })
        .select()
        .single()

      if (error) throw error

      // Reset form
      setTitle('')
      setDescription('')
      setIngredients('')
      setSteps('')
      setImageFile(null)

      refresh()
      navigate(`/recipes/${data.id}`)
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to create recipe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-md p-6 rounded-lg max-w-5xl mx-auto mt-10 shadow-md">
      <h1 className="text-center text-3xl font-bold text-gray-900 mb-6">
        Create a Recipe
      </h1>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Image Upload */}
        <div className="lg:col-span-1">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg h-64 flex items-center justify-center mb-4
              ${imageFile ? 'border-green-400' : 'border-red-400 text-red-500'}
            `}
          >
            {imageFile ? (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="object-cover h-full w-full rounded-lg"
              />
            ) : (
              'Image required – drag & drop here'
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full text-sm text-gray-700"
          />
        </div>

        {/* Form */}
        <div className="mt-6 lg:mt-0 lg:col-span-2 flex flex-col gap-4">
          <input
            className="border rounded-md p-3"
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="border rounded-md p-3"
            placeholder="Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            className="border rounded-md p-3"
            placeholder="Ingredients *"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />

          <textarea
            className="border rounded-md p-3 h-40"
            placeholder="Steps *"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
          />

          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md disabled:opacity-50 w-max"
          >
            {loading ? 'Creating...' : 'Create Recipe'}
          </button>
        </div>
      </div>
    </div>
  )
}
