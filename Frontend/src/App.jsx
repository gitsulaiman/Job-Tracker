import { useEffect, useState } from 'react';
import { SignIn } from '@/components/SignIn';
import { Tracker } from '@/components/Tracker';

const AUTH_API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`;

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('jt_token'));
  const [user, setUser] = useState(null);

  // On reload we have a token but not the user's name yet — fetch it,
  // and if the token is no longer valid, sign out cleanly.
  useEffect(() => {
    if (!token || user) return;
    fetch(`${AUTH_API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => logout());
  }, [token]);

  const handleAuthed = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('jt_token');
    setToken(null);
    setUser(null);
  };

  if (!token) return <SignIn onAuthed={handleAuthed} />;
  return <Tracker token={token} user={user} onLogout={logout} onAuthError={logout} />;
}