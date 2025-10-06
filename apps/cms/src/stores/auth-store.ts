import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

interface AuthState {
  auth: {
    user: AuthUser | null
    accessToken: string | null
    refreshToken: string | null
    setUser: (user: AuthUser | null) => void
    setTokens: (accessToken: string, refreshToken: string) => void
    setAccessToken: (accessToken: string) => void
    reset: () => void
    isAuthenticated: () => boolean
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      auth: {
        user: null,
        accessToken: null,
        refreshToken: null,
        setUser: (user) =>
          set((state) => ({ ...state, auth: { ...state.auth, user } })),
        setTokens: (accessToken, refreshToken) =>
          set((state) => ({
            ...state,
            auth: { ...state.auth, accessToken, refreshToken },
          })),
        setAccessToken: (accessToken) =>
          set((state) => ({
            ...state,
            auth: { ...state.auth, accessToken },
          })),
        reset: () =>
          set((state) => ({
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: null,
              refreshToken: null,
            },
          })),
        isAuthenticated: () => {
          const state = get()
          return !!state.auth.accessToken && !!state.auth.user
        },
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        auth: {
          user: state.auth.user,
          accessToken: state.auth.accessToken,
          refreshToken: state.auth.refreshToken,
        },
      }),
    }
  )
)
