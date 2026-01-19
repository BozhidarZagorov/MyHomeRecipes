import { useEffect } from 'react'
import { supabase } from '../services/supabase'

export default function Home() {
  useEffect(() => {
    // console.log('Supabase client:', supabase)
  }, [])

  return (
    <div>
      <h1>🍲 Recipe App</h1>
      <p>Welcome to my recipe website</p>
    </div>
  )
}
