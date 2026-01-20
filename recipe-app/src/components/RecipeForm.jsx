import { useState } from 'react'
import { supabase } from '../services/supabase'

export default function RecipeForm({ refresh }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return alert('Login to create recipes!')

    const { error } = await supabase.from('recipes').insert([
      { title, description, user_id: user.id, likes: 0 }
    ])
    if (error) return alert(error.message)

    setTitle('')
    setDescription('')
    refresh()
  }

  // return (
  //   <form onSubmit={handleSubmit}>
  //     <input
  //       placeholder="Title"
  //       value={title}
  //       onChange={(e) => setTitle(e.target.value)}
  //     />
  //     <input
  //       placeholder="Description"
  //       value={description}
  //       onChange={(e) => setDescription(e.target.value)}
  //     />
  //     <button>Add Recipe</button>
  //   </form>
  // )
}
