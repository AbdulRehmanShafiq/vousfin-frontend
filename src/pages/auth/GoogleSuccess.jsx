import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/useAuthStore'
import authService from '@/services/auth.service'
import { getErrorMessage } from '@/utils/errorHandler'
import { getPostAuthPath } from '@/utils/authRedirect'

export default function GoogleSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      toast.error('Google sign-in failed. Please try again.')
      navigate('/login', { replace: true })
      return
    }

    const hydrate = async () => {
      try {
        // Store the token first so the API interceptor sends it
        useAuthStore.setState({ token, isAuthenticated: true })

        // Fetch the user profile
        const { data } = await authService.me()
        const user = data.data
        setUser(user)

        navigate(getPostAuthPath(user), { replace: true })
      } catch (err) {
        toast.error(getErrorMessage(err))
        // Clear any partial state
        useAuthStore.getState().logout()
        navigate('/login', { replace: true })
      }
    }

    hydrate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      {/* Spinner */}
      <svg
        className="h-10 w-10 animate-spin text-cyan"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p className="text-text-secondary text-sm">Signing you in&hellip;</p>
    </div>
  )
}
