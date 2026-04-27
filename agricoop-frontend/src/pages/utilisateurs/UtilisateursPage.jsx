import { useState, useEffect } from 'react'
import { utilisateursAPI } from '../../api/services'
import toast from 'react-hot-toast'

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(false)

  const charger = async () => {
    setLoading(true)
    try {
      const res = await utilisateursAPI.getAll()
      setUtilisateurs(res.data || [])
    } catch (err) {
      toast.error('Erreur chargement utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { charger() }, [])

  const changerRole = async (id, role) => {
    try {
      await utilisateursAPI.update(id, { role })
      toast.success('Rôle mis à jour !')
      charger()
    } catch (err) {
      toast.error('Erreur changement rôle')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}>⏳ Chargement...</div>

  return (
    <div className="slide-up">
      <div className="card">
        <div className="card-header">
          <div className="card-title">🛡 Gestion des Utilisateurs</div>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 24 }}>Aucun utilisateur trouvé</td></tr>
              ) : (
                utilisateurs.map(u => (
                  <tr key={u.id}>
                    <td className="bold">{u.prenom} {u.nom}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="form-select"
                        value={u.role}
                        onChange={e => changerRole(u.id, e.target.value)}
                        style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                      >
                        <option value="admin">Admin</option>
                        <option value="gestionnaire">Gestionnaire</option>
                        <option value="membre">Membre</option>
                      </select>
                    </td>
                    <td>
                      {u.statut === 'actif'
                        ? <span className="badge badge-green">Actif</span>
                        : <span className="badge badge-red">Suspendu</span>
                      }
                    </td>
                    <td>
                      <div className="action-btn" onClick={() => changerRole(u.id, u.role)}>✏️</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
