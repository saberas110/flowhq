import { create } from 'zustand';
import { IUserProfile } from '@repo/shared';
import { apiClient } from '@/lib/api';
import { getCookie, deleteCookie, hasCookie } from '@/lib/cookies';

interface AuthState {
  user: IUserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: IUserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  loadUser: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),

  loadUser: async () => {
    try {
      const accessToken = getCookie('accessToken');
      
      if (!accessToken) {
        set({ user: null, isAuthenticated: false });
        return;
      }

      const profile = await apiClient.getProfile(accessToken);
      set({ user: profile, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to load user:', error);
      // Clear invalid cookies
      deleteCookie('accessToken');
      deleteCookie('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  initAuth: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    // Check if access token exists in cookies
    if (hasCookie('accessToken')) {
      await get().loadUser();
    }
    
    set({ isLoading: false });
  },

  login: async (email: string, password: string) => {
    // API will set cookies automatically
    await apiClient.login({ email, password });
    
    // Load user profile
    await get().loadUser();
  },

  register: async (data) => {
    // API will set cookies automatically
    await apiClient.register(data);
    
    // Load user profile
    await get().loadUser();
  },

  logout: async () => {
    try {
      // API will clear cookies automatically
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear cookies on client side as backup
      deleteCookie('accessToken');
      deleteCookie('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  refreshAuth: async () => {
    if (typeof window === 'undefined') {
      throw new Error('Cannot refresh auth on server');
    }

    try {
      // API will set new cookies automatically
      await apiClient.refreshTokens();
      
      // Load user profile with new token
      await get().loadUser();
    } catch (error) {
      // If refresh fails, logout
      await get().logout();
      throw error;
    }
  },
}));

