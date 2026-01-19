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

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div>
      <h1>🍲 Recipe App</h1>

      {user ? (
        <>
          <p>Logged in as: {user.email}</p>
          <button onClick={handleLogout}>Logout</button>
          <Link to="/recipes">Recipes</Link>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <br />
          <Link to="/register">Register</Link>

        </>
      )}
    </div>
  )
}
