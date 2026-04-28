import { useState, useEffect } from 'react'
import { utilisateursAPI } from '../../api/services'
import toast from 'react-hot-toast'

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading]           = useState(false)
  // Garde une copie locale du rôle sélectionné avant confirmation
  const [rolesLocaux, setRolesLocaux]   = useState({})

  const charger = async () => {
    setLoading(true)
    try {
      const res = await utilisateursAPI.getAll()
      const data = res.data || []
      setUtilisateurs(data)
      // Initialise rolesLocaux avec les rôles actuels
      const init = {}
      data.forEach(u => { init[u.id] = u.role })
      setRolesLocaux(init)
    } catch (err) {
      toast.error('Erreur chargement utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { charger() }, [])

  // Appelé quand on clique sur ✏️ (confirme le changement)
  const confirmerRole = async (id) => {
    const nouveauRole = rolesLocaux[id]
    try {
      // ✅ PATCH /api/utilisateurs/:id/role
      await utilisateursAPI.changerRole(id, nouveauRole)
      toast.success('Rôle mis à jour !')
      charger()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Erreur changement rôle')
    }
  }

  const toggleActif = async (id, actifActuel) => {
    try {
      await utilisateursAPI.toggleActif(id, !actifActuel)
      toast.success(actifActuel ? 'Compte désactivé' : 'Compte activé')
      charger()
    } catch (err) {
      toast.error('Erreur changement statut')
    }
  }

  if (loading && utilisateurs.length === 0)
    return <div style={{ textAlign: 'center', padding: 60 }}>⏳ Chargement...</div>

  return (
    <div className="slide-up">
      <div className="card">
        <div className="card-header">
          <div className="card-title">🛡 Gestion des Utilisateurs</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
            {utilisateurs.length} utilisateur{utilisateurs.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-scroll">
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
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 24 }}>
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  utilisateurs.map(u => (
                    <tr key={u.id}>
                      <td className="bold">{u.prenom} {u.nom}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{u.email}</td>
                      <td>
                        {/* Select local — ne fait PAS l'appel API immédiatement */}
                        <select
                          className="form-select"
                          value={rolesLocaux[u.id] || u.role}
                          onChange={e => setRolesLocaux(prev => ({ ...prev, [u.id]: e.target.value }))}
                          style={{ padding: '4px 8px', fontSize: '0.78rem', minWidth: 120 }}
                        >
                          <option value="admin">Admin</option>
                          <option value="gestionnaire">Gestionnaire</option>
                          <option value="membre">Membre</option>
                        </select>
                      </td>
                      <td>
                        {u.actif
                          ? <span className="badge badge-green">Actif</span>
                          : <span className="badge badge-red">Suspendu</span>
                        }
                      </td>
                      <td>
                        <div className="action-btns">
                          {/* ✅ Confirme le changement de rôle */}
                          <div
                            className="action-btn"
                            title="Confirmer le rôle"
                            onClick={() => confirmerRole(u.id)}
                            style={{
                              background: rolesLocaux[u.id] !== u.role ? 'var(--green-light)' : undefined,
                              borderColor: rolesLocaux[u.id] !== u.role ? 'var(--green)' : undefined,
                            }}
                          >
                            {rolesLocaux[u.id] !== u.role ? '💾' : '✏️'}
                          </div>
                          {/* Toggle actif/suspendu */}
                          <div
                            className={`action-btn ${u.actif ? 'danger' : ''}`}
                            title={u.actif ? 'Désactiver' : 'Activer'}
                            onClick={() => toggleActif(u.id, u.actif)}
                          >
                            {u.actif ? '🚫' : '↩️'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
