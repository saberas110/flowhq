import { useAuthStore } from '@/stores/auth-store'

export function useAuth() {
  const { auth } = useAuthStore()

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated(),
    logout: auth.reset,
  }
}

