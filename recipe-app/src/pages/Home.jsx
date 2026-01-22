import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { Link } from 'react-router-dom'

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-base font-semibold text-amber-500">
          Welcome To My Home Recipes 
        </h1>

        <p className="mt-6 text-lg font-medium text-gray-300 sm:text-xl">
          Find delicious recipes, share your own creations, and get inspired in the kitchen.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/recipes"
            className="rounded-md bg-stone-600 px-4 py-2.5 text-sm font-semibold text-stone-100 shadow hover:bg-stone-700 focus-visible:outline 
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900 hover:outline hover:outline-1 hover:outline-amber-500 hover:outline-offset-1"
          >
            Browse Recipes
          </Link>

          <Link
            to="/create"
            className="text-sm font-semibold text-white hover:text-amber-400"
          >
            Add a Recipe <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
