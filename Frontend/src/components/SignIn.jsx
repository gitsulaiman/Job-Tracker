import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BeamsBackground } from '@/components/BeamsBackground';
import { SegmentedTabs } from '@/components/SegmentedTabs';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`;

export function SignIn({ onAuthed }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`${API}/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
      localStorage.setItem('jt_token', data.token);
      onAuthed(data.token, data.user);
    } catch {
      setError('Could not reach the server. Check that the backend is running.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <BeamsBackground className="min-h-screen">
      <div className="w-full max-w-sm px-6">
        <p className="text-center text-xs tracking-[0.3em] uppercase text-white/50 mb-3">Job Search</p>
        <h1 className="text-center text-3xl font-semibold tracking-tighter text-white mb-8">Application Tracker</h1>

        <div className="flex justify-center mb-6">
          <SegmentedTabs
            options={[{ key: 'login', label: 'Sign in' }, { key: 'register', label: 'Create account' }]}
            value={mode}
            onChange={(v) => { setMode(v); setError(''); }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            onSubmit={submit}
            className="flex flex-col gap-4"
          >
            {mode === 'register' && (
              <input name="name" placeholder="Name" value={form.name} onChange={change} required
                className="bg-transparent border-b border-white/25 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white" />
            )}
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required
              className="bg-transparent border-b border-white/25 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={change} required minLength={6}
              className="bg-transparent border-b border-white/25 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white" />

            {error && <p className="text-sm text-red-300">{error}</p>}

            <button type="submit" disabled={busy}
              className="mt-2 rounded-full bg-white text-neutral-950 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-60">
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </motion.form>
        </AnimatePresence>
      </div>
    </BeamsBackground>
  );
}