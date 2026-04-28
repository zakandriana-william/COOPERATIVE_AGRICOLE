import { useState, useEffect } from 'react'
import { membresAPI } from '../../api/services'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

const emptyForm = {
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
  localisation: '',
  culture: 'Maïs',
  date_adhesion: new Date().toISOString().split('T')[0]
}

export default function MembresPage() {
  const [membres, setMembres] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterCulture, setFilterCulture] = useState('')
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  const chargerMembres = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)        params.search  = search
      if (filterStatut)  params.statut  = filterStatut
      if (filterCulture) params.culture = filterCulture
      const response = await membresAPI.getAll(params)
      setMembres(response.data.membres || [])
    } catch (error) {
      console.error(error)
      toast.error('Erreur chargement des membres')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { chargerMembres() }, [])
  useEffect(() => { chargerMembres() }, [search, filterStatut, filterCulture])

  const openAdd = () => {
    setEditId(null)
    setForm({ ...emptyForm, date_adhesion: new Date().toISOString().split('T')[0] })
    setModal(true)
  }

  const openEdit = (m) => {
    setEditId(m.id) // ✅ DB misy "id"
    setForm({
      nom:          m.nom          || '',
      prenom:       m.prenom       || '',
      telephone:    m.telephone    || '',
      email:        m.email        || '',
      localisation: m.localisation || '',
      culture:      m.culture      || 'Maïs', // ✅ DB misy "culture"
      date_adhesion: m.date_adhesion || new Date().toISOString().split('T')[0]
    })
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.nom || !form.prenom) return toast.error('Nom et prénom requis')
    if (!form.email) return toast.error('Email requis')
    setLoading(true)
    try {
      if (editId) {
        await membresAPI.update(editId, {
          telephone:    form.telephone,
          localisation: form.localisation,
          culture:      form.culture, // ✅ DB misy "culture"
          statut:       'actif'       // ✅ DB misy "statut"
        })
        toast.success('Membre mis à jour !')
      } else {
        await membresAPI.create({
          nom:          form.nom,
          prenom:       form.prenom,
          email:        form.email,
          telephone:    form.telephone,
          localisation: form.localisation,
          culture:      form.culture,
          date_adhesion: form.date_adhesion
        })
        toast.success('Membre ajouté !')
      }
      setModal(false)
      await chargerMembres()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSuspendre = async (id, statutActuel) => {
    setLoading(true)
    try {
      if (statutActuel === 'suspendu') {
        await membresAPI.reactiver(id)
        toast.success('Membre réactivé')
      } else {
        await membresAPI.suspendre(id)
        toast.success('Membre suspendu')
      }
      await chargerMembres()
    } catch (error) {
      toast.error('Erreur lors du changement de statut')
    } finally {
      setLoading(false)
    }
  }

  const cotisationBadge = (c) => {
    if (c === 'payé') return <span className="badge badge-green">✓ À jour</span>
    if (c === 'en_retard') return <span className="badge badge-red">⚠ En retard</span>
    return <span className="badge badge-orange">⏳ En attente</span>
  }

  const statutBadge = (s) => {
    if (s === 'actif')    return <span className="badge badge-green">Actif</span>
    if (s === 'suspendu') return <span className="badge badge-red">Suspendu</span>
    return <span className="badge badge-gray">Retraité</span>
  }

  // ✅ DB misy "statut" fa tsy "statut_membre"
  const kpis = [
    { label: 'Total',           value: membres.length,                                          color: 'var(--text)' },
    { label: 'Actifs',          value: membres.filter(m => m.statut === 'actif').length,        color: '#4A8C3F' },
    { label: 'Suspendus',       value: membres.filter(m => m.statut === 'suspendu').length,     color: '#C0392B' },
    { label: 'Cotisations jour',value: `${membres.filter(m => m.cotisation_annee === 'payé').length}/${membres.length}`, color: '#E8A020' },
  ]

  if (loading && membres.length === 0) {
    return <div style={{ textAlign: 'center', padding: 60 }}>⏳ Chargement des membres...</div>
  }

  return (
    <div className="slide-up">
      <div className="kpi-row">
        {kpis.map((k, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">👥 Liste des Membres</div>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Nouveau membre</button>
        </div>
        <div className="card-body">
          <div className="filters-bar">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
              <option value="">Tous statuts</option>
              <option value="actif">Actif</option>
              <option value="suspendu">Suspendu</option>
            </select>
            <select className="form-select" value={filterCulture} onChange={e => setFilterCulture(e.target.value)}>
              <option value="">Toutes cultures</option>
              <option value="Maïs">Maïs</option>
              <option value="Manioc">Manioc</option>
              <option value="Mil">Mil</option>
            </select>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Nom complet</th><th>Email</th><th>Localisation</th>
                <th>Culture</th><th>Cotisation</th><th>Statut</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {membres.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 24 }}>Aucun membre trouvé</td></tr>
              ) : (
                membres.map(m => (
                  <tr key={m.id}> {/* ✅ DB misy "id" */}
                    <td className="bold">{m.prenom} {m.nom}</td>
                    <td>{m.email || '-'}</td>
                    <td>{m.localisation || '-'}</td>
                    <td>{m.culture || '-'}</td> {/* ✅ DB misy "culture" */}
                    <td>{cotisationBadge(m.cotisation_annee)}</td>
                    <td>{statutBadge(m.statut)}</td> {/* ✅ DB misy "statut" */}
                    <td>
                      <div className="action-btns">
                        <div className="action-btn" onClick={() => openEdit(m)}>✏️</div>
                        <div
                          className={`action-btn ${m.statut === 'suspendu' ? '' : 'danger'}`}
                          onClick={() => handleToggleSuspendre(m.id, m.statut)} {/* ✅ m.id sy m.statut */}
                        >
                          {m.statut === 'suspendu' ? '↩️' : '🚫'}
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

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editId ? '✏️ Modifier' : '➕ Nouveau Membre'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? '⏳...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group"><label>Nom *</label><input className="form-input" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
          <div className="form-group"><label>Prénom *</label><input className="form-input" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} /></div>
          <div className="form-group"><label>Email *</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label>Téléphone</label><input className="form-input" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} /></div>
          <div className="form-group">
            <label>Culture</label>
            <select className="form-select" value={form.culture} onChange={e => setForm({ ...form, culture: e.target.value })}>
              <option>Maïs</option>
              <option>Manioc</option>
              <option>Mil</option>
              <option>Autre</option>
            </select>
          </div>
          <div className="form-group full"><label>Localisation</label><input className="form-input" value={form.localisation} onChange={e => setForm({ ...form, localisation: e.target.value })} /></div>
          <div className="form-group"><label>Date adhésion</label><input className="form-input" type="date" value={form.date_adhesion} onChange={e => setForm({ ...form, date_adhesion: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  )
}
