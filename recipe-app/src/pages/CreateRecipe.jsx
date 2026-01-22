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

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/", { state: { message: "You must be logged in to create a recipe" } })
    }
  }, [user, authLoading, navigate])

  // Show loading while auth is checked or redirecting
  if (authLoading || !user) return <div>Loading...</div>

  const handleDrop = (e) => {
    e.preventDefault()
    setImageFile(e.dataTransfer.files[0])
  }

  const handleCreate = async () => {
    if (!title || !description) {
      alert('Fill all required fields')
      return
    }

    setLoading(true)
    let imageUrl = null

    try {
      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile)
      }

      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      // Insert recipe and get the inserted row
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          title,
          ingredients,
          steps,
          description,
          image_url: imageUrl,
          user_id: currentUser.id,
          likes: 0
        })
        .select()
        .single() // get the inserted recipe

      if (error) throw error

      // Reset form
      setTitle('')
      setIngredients('')
      setSteps('')
      setDescription('')
      setImageFile(null)
      refresh() // optional: refresh parent list

      // Navigate to the new recipe page
      navigate(`/recipes/${data.id}`)

    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-md p-6 rounded-lg max-w-5xl mx-auto mt-10 shadow-md">
      <h1 className="text-center text-3xl font-bold text-gray-900 mb-6">Create a Recipe</h1>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Left: Image Upload */}
        <div className="lg:col-span-1">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center mb-4 text-gray-500"
          >
            {imageFile ? imageFile.name : 'Drag & drop image here'}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full text-sm text-gray-700"
          />
        </div>

        {/* Right: Form */}
        <div className="mt-6 lg:mt-0 lg:col-span-2 flex flex-col gap-4">
          <input
            className="border border-gray-300 rounded-md p-3 text-gray-900 w-full"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="border border-gray-300 rounded-md p-3 text-gray-900 w-full"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            className="border border-gray-300 rounded-md p-3 text-gray-900 w-full"
            placeholder="Ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
          <textarea
            className="border border-gray-300 rounded-md p-3 text-gray-900 w-full h-40"
            placeholder="Steps"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
          />

          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md transition w-max"
          >
            {loading ? 'Uploading...' : 'Create Recipe'}
          </button>
        </div>
      </div>
    </div>
  )
}
