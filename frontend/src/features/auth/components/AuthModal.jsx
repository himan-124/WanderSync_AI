import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function AuthModal({ onSuccess, onClose, reason }) {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const containerRef = useFocusTrap(true);

  const submit = async () => {
    if (!username.trim() || !password.trim()) {
      setErr('Username and password are required');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      if (tab === 'login') {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
      onSuccess?.(username.trim());
      onClose?.();
    } catch (e) {
      setErr(typeof e === 'string' ? e : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/80"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div 
        ref={containerRef}
        className="w-full max-w-md solid-panel p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="auth-modal-title" className="text-xl font-semibold text-surface-900 dark:text-white">
            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button 
            onClick={onClose}
            className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        {reason && <p className="mb-4 text-sm text-surface-600 dark:text-surface-400">{reason}</p>}
        
        <div className="flex gap-4 mb-6 border-b border-surface-200 dark:border-surface-700" role="tablist">
          <button 
            role="tab"
            aria-selected={tab === 'login'}
            className={`pb-2 text-sm font-medium transition-colors ${tab === 'login' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
            onClick={() => { setTab('login'); setErr(''); }}
          >
            Login
          </button>
          <button 
            role="tab"
            aria-selected={tab === 'register'}
            className={`pb-2 text-sm font-medium transition-colors ${tab === 'register' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
            onClick={() => { setTab('register'); setErr(''); }}
          >
            Register
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Username</label>
            <input 
              id="username"
              type="text"
              className="w-full rounded-lg border border-surface-300 px-4 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>
          <div>
            <label htmlFor="password" name="password" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Password</label>
            <input 
              id="password"
              type="password"
              className="w-full rounded-lg border border-surface-300 px-4 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>
          
          {err && <div className="text-sm text-red-500 font-medium" role="alert">{err}</div>}
          
          <button 
            className="w-full btn-primary py-2.5"
            disabled={loading}
            onClick={submit}
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
