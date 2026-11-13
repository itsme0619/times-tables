import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      const code = err?.code || '';
      setError(
        code.includes('invalid') || code.includes('wrong-password') || code.includes('user-not-found')
          ? 'That email or password didn’t match. Try again!'
          : code.includes('network')
          ? 'Can’t reach the internet right now.'
          : 'Something went wrong signing in.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card center-card login" onSubmit={submit}>
      <div className="big-emoji">🍦</div>
      <h2>Family sign-in</h2>
      <p className="muted">Ask a grown-up to sign in once on this device. It’ll remember you after that.</p>
      <input className="text-input" type="email" autoComplete="username" placeholder="Family email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="text-input" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="warn-text">{error}</p>}
      <button className="btn primary big" type="submit" disabled={busy || !email || !password}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
