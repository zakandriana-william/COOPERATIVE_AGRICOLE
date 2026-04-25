import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email requis'
    if (!form.password) e.password = 'Mot de passe requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Bienvenue, ${user.prenom} !`)
      // Redirection selon le rôle
      if (user.role === 'membre') navigate('/profil')
      else navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">🌾</div>
          <div className="auth-logo-name">AgriCoop</div>
          <div className="auth-logo-sub">Coopérative Agricole</div>
        </div>

        <div className="auth-title">Connexion à votre espace</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Adresse email</label>
            <input
              className="form-input"
              type="email"
              placeholder="exemple@agricoop.ci"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: 6 }}>
            <label className="form-label">Mot de passe</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div style={{ textAlign: 'right', marginBottom: 18 }}>
            <Link to="/reset-password" className="auth-link" style={{ fontSize: '0.75rem' }}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            {loading ? '⏳ Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-divider" />
        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text2)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" className="auth-link">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}
