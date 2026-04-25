import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nom:'', prenom:'', email:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!form.nom)     e.nom     = 'Nom requis'
    if (!form.prenom)  e.prenom  = 'Prénom requis'
    if (!form.email)   e.email   = 'Email requis'
    if (form.password.length < 8) e.password = 'Minimum 8 caractères'
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.nom, form.prenom, form.email, form.password)
      toast.success('Compte créé ! Vous pouvez vous connecter.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ width: 460 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">🌾</div>
          <div className="auth-logo-name">AgriCoop</div>
          <div className="auth-logo-sub">Créer un compte</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: 12 }}>
            <div className="form-group">
              <label className="form-label">Nom *</label>
              <input className="form-input" placeholder="Koné" value={form.nom} onChange={set('nom')} />
              {errors.nom && <span className="form-error">{errors.nom}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Prénom *</label>
              <input className="form-input" placeholder="Ibrahim" value={form.prenom} onChange={set('prenom')} />
              {errors.prenom && <span className="form-error">{errors.prenom}</span>}
            </div>
            <div className="form-group full">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="exemple@agricoop.ci" value={form.email} onChange={set('email')} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe *</label>
              <input className="form-input" type="password" placeholder="Min. 8 caractères" value={form.password} onChange={set('password')} />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirmer *</label>
              <input className="form-input" type="password" placeholder="Répétez le MDP" value={form.confirm} onChange={set('confirm')} />
              {errors.confirm && <span className="form-error">{errors.confirm}</span>}
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            {loading ? '⏳ Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="auth-divider" />
        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text2)' }}>
          Déjà inscrit ?{' '}
          <Link to="/login" className="auth-link">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
