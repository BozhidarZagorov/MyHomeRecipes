import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

export function useAuthGuard(redirectIfNoUser = true) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user && redirectIfNoUser) {
        navigate("/")
      } else {
        setUser(data.user)
      }

      setLoading(false)
    }

    checkUser()
  }, [navigate, redirectIfNoUser])

  return { user, loading }
}
