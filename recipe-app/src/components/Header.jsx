import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export default function Header() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="mb-10 sticky top-0 z-50 w-full bg-black/30 backdrop-blur-md shadow">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">

        {/* Left — Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Home
          </Link>
        </nav>

        {/* Center */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Link
          to="/recipes"
          className="rounded-md border px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Recipes
        </Link>
      </div>

        {/* Right — Auth buttons */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white
           hover:outline hover:outline-1 hover:outline-amber-500 hover:outline-offset-1"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="rounded-md px-4 py-2 text-sm font-medium text-white"
            >
              Logout
            </button>
          )}
        </div>

      </div>
    </header>
  )
}
