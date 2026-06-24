import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  role: string | null;
  expiresAt: string | null;
  isLoggedIn: boolean;
  login: (accessToken: string, refreshToken: string, email: string, role: string, expiresAt: string) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken: string, expiresAt: string) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load initial state from localStorage safely
  let initialState = {
    accessToken: null as string | null,
    refreshToken: null as string | null,
    email: null as string | null,
    role: null as string | null,
    expiresAt: null as string | null,
    isLoggedIn: false,
  };

  try {
    const savedToken = localStorage.getItem('tc_access_token');
    const savedRefresh = localStorage.getItem('tc_refresh_token');
    const savedEmail = localStorage.getItem('tc_email');
    const savedRole = localStorage.getItem('tc_role');
    const savedExpires = localStorage.getItem('tc_expires_at');

    if (savedToken && savedRefresh) {
      initialState = {
        accessToken: savedToken,
        refreshToken: savedRefresh,
        email: savedEmail,
        role: savedRole,
        expiresAt: savedExpires,
        isLoggedIn: true,
      };
    }
  } catch (e) {
    console.error('Failed to load auth from localStorage', e);
  }

  return {
    ...initialState,
    login: (accessToken, refreshToken, email, role, expiresAt) => {
      try {
        localStorage.setItem('tc_access_token', accessToken);
        localStorage.setItem('tc_refresh_token', refreshToken);
        localStorage.setItem('tc_email', email);
        localStorage.setItem('tc_role', role);
        localStorage.setItem('tc_expires_at', expiresAt);
      } catch (e) {
        console.error('Failed to save auth to localStorage', e);
      }
      set({
        accessToken,
        refreshToken,
        email,
        role,
        expiresAt,
        isLoggedIn: true,
      });
    },
    logout: () => {
      try {
        localStorage.removeItem('tc_access_token');
        localStorage.removeItem('tc_refresh_token');
        localStorage.removeItem('tc_email');
        localStorage.removeItem('tc_role');
        localStorage.removeItem('tc_expires_at');
      } catch (e) {
        console.error('Failed to clear auth from localStorage', e);
      }
      set({
        accessToken: null,
        refreshToken: null,
        email: null,
        role: null,
        expiresAt: null,
        isLoggedIn: false,
      });
    },
    updateTokens: (accessToken, refreshToken, expiresAt) => {
      try {
        localStorage.setItem('tc_access_token', accessToken);
        localStorage.setItem('tc_refresh_token', refreshToken);
        localStorage.setItem('tc_expires_at', expiresAt);
      } catch (e) {
        console.error('Failed to update tokens in localStorage', e);
      }
      set({
        accessToken,
        refreshToken,
        expiresAt,
      });
    },
  };
});
