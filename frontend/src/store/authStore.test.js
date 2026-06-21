import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should initialize with default values', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should update state on login', () => {
    const { setAuth } = useAuthStore.getState();
    setAuth('testuser', 'access-token', 'refresh-token');
    
    const state = useAuthStore.getState();
    expect(state.user).toBe('testuser');
    expect(state.accessToken).toBe('access-token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear state on logout', () => {
    const { setAuth, logout } = useAuthStore.getState();
    setAuth('testuser', 'access-token', 'refresh-token');
    logout();
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
