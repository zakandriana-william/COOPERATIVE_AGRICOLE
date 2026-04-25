import { useState } from 'react'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

const demoProduits = [
  { id:1, nom_produit:'Engrais NPK',         categorie:'engrais',     unite:'kg',    quantite_stock:12,  seuil_alerte:50,  prix_unitaire:850 },
  { id:2, nom_produit:'Semences Maïs',        categorie:'semence',     unite:'kg',    quantite_stock:45,  seuil_alerte:100, prix_unitaire:1200 },
  { id:3, nom_produit:'Pesticide Biopestol',  categorie:'pesticide',   unite:'L',     quantite_stock:156, seuil_alerte:50,  prix_unitaire:2500 },
  { id:4, nom_produit:'Semences Manioc',      categorie:'semence',     unite:'kg',    quantite_stock:920, seuil_alerte:200, prix_unitaire:600 },
  { id:5, nom_produit:'Motopompe Irrigation', categorie:'équipement',  unite:'unité', quantite_stock:3,   seuil_alerte:2,   prix_unitaire:85000 },
]

const demoMouvements = [
  { id:1, produit:'Engrais NPK',   type:'entrée', quantite:100, date:'2024-03-15', motif:'Approvisionnement Agrofourni', membre:null },
  { id:2, produit:'Semences Maïs', type:'sortie', quantite:55,  date:'2024-03-20', motif:'Distribution semailles',      membre:'Koné Ibrahim' },
  { id:3, produit:'Engrais NPK',   type:'sortie', quantite:88,  date:'2024-04-01', motif:'Distribution membres',        membre:'Diallo Mamadou' },
]

const niveauPct = (p) => Math.min(100, Math.round((p.quantite_stock / (p.seuil_alerte * 4)) * 100))
const niveauColor = (pct) => pct < 30 ? 'var(--red)' : pct < 50 ? 'var(--orange)' : 'var(--green)'
const niveauLabel = (pct) => pct < 30 ? ['badge-red','🔴 Critique'] : pct < 50 ? ['badge-orange','🟠 Bas'] : ['badge-green','✅ Normal']

export default function StocksPage() {
  const [produits, setProduits] = useState(demoProduits)
  const [tab, setTab]     = useState('inventaire')
  const [search, setSearch] = useState('')
  const [modalType, setModalType] = useState(null) // 'entree' | 'sortie' | 'produit'
  const [form, setForm]   = useState({})

  const filtered = produits.filter(p => !search || p.nom_produit.toLowerCase().includes(search.toLowerCase()))

  const handleMouvement = () => {
    if (!form.id_produit || !form.quantite) return toast.error('Produit et quantité requis')
    const produit = produits.find(p => p.id === +form.id_produit)
    if (!produit) return
    const delta = modalType === 'entree' ? +form.quantite : -form.quantite
    const nouveau = produit.quantite_stock + delta
    if (nouveau < 0) return toast.error('Stock insuffisant !')
    setProduits(prev => prev.map(p => p.id === produit.id ? { ...p, quantite_stock: nouveau } : p))
    toast.success(`${modalType === 'entree' ? 'Entrée' : 'Sortie'} enregistrée !`)
    setModalType(null); setForm({})
  }

  return (
    <div className="slide-up">
      {/* KPIs */}
      <div className="kpi-row">
        {[
          { label:'Produits',    value: produits.length,                                              color:'var(--text)' },
          { label:'Normal',      value: produits.filter(p=>niveauPct(p)>=50).length,                  color:'var(--green)' },
          { label:'Niveau bas',  value: produits.filter(p=>niveauPct(p)>=30&&niveauPct(p)<50).length, color:'var(--orange)' },
          { label:'Critique',    value: produits.filter(p=>niveauPct(p)<30).length,                   color:'var(--red)' },
        ].map((k,i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-value" style={{color:k.color}}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Inner tabs */}
      <div className="inner-tabs">
        {['inventaire','mouvements'].map(t => (
          <div key={t} className={`inner-tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>
            {t==='inventaire' ? '📋 Inventaire' : '🔄 Mouvements'}
          </div>
        ))}
      </div>

      {tab === 'inventaire' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📦 Inventaire des Stocks</div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModalType('sortie');setForm({})}}>📤 Sortie stock</button>
              <button className="btn btn-primary btn-sm" onClick={()=>{setModalType('entree');setForm({})}}>📥 Entrée stock</button>
            </div>
          </div>
          <div className="card-body">
            <div className="filters-bar">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input className="search-input" placeholder="Rechercher un produit..." value={search} onChange={e=>setSearch(e.target.value)} />
              </div>
            </div>
            <table className="data-table">
              <thead><tr><th>Produit</th><th>Catégorie</th><th>Niveau</th><th>Quantité</th><th>Seuil</th><th>Prix unit.</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(p => {
                  const pct = niveauPct(p)
                  const [bc, bl] = niveauLabel(pct)
                  return (
                    <tr key={p.id}>
                      <td className="bold">{p.nom_produit}</td>
                      <td><span className="badge badge-blue">{p.categorie}</span></td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:7}}>
                          <div className="progress-bar" style={{width:90}}>
                            <div className="progress-fill" style={{width:`${pct}%`,background:niveauColor(pct)}} />
                          </div>
                          <span style={{fontSize:'0.68rem',fontWeight:700,color:niveauColor(pct)}}>{pct}%</span>
                        </div>
                      </td>
                      <td>{p.quantite_stock} {p.unite}</td>
                      <td>{p.seuil_alerte} {p.unite}</td>
                      <td>{p.prix_unitaire?.toLocaleString()} F/{p.unite}</td>
                      <td><span className={`badge ${bc}`}>{bl}</span></td>
                      <td>
                        <div className="action-btns">
                          <div className="action-btn" title="Entrée" onClick={()=>{setModalType('entree');setForm({id_produit:p.id})}}>📥</div>
                          <div className="action-btn" title="Sortie" onClick={()=>{setModalType('sortie');setForm({id_produit:p.id})}}>📤</div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'mouvements' && (
        <div className="card">
          <div className="card-header"><div className="card-title">🔄 Historique des Mouvements</div></div>
          <div className="card-body">
            <table className="data-table">
              <thead><tr><th>Produit</th><th>Type</th><th>Quantité</th><th>Date</th><th>Motif</th><th>Membre</th></tr></thead>
              <tbody>
                {demoMouvements.map(mv => (
                  <tr key={mv.id}>
                    <td className="bold">{mv.produit}</td>
                    <td><span className={`badge ${mv.type==='entrée'?'badge-green':'badge-orange'}`}>{mv.type==='entrée'?'📥':'📤'} {mv.type}</span></td>
                    <td>{mv.quantite}</td>
                    <td>{new Date(mv.date).toLocaleDateString('fr-FR')}</td>
                    <td>{mv.motif}</td>
                    <td>{mv.membre || <span style={{color:'var(--text3)'}}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Entrée/Sortie */}
      <Modal
        isOpen={!!modalType}
        onClose={()=>{setModalType(null);setForm({})}}
        title={modalType==='entree' ? '📥 Entrée de Stock' : '📤 Sortie de Stock'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={()=>setModalType(null)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleMouvement}>Enregistrer</button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group full">
            <label className="form-label">Produit *</label>
            <select className="form-select" value={form.id_produit||''} onChange={e=>setForm({...form,id_produit:e.target.value})}>
              <option value="">-- Sélectionner --</option>
              {produits.map(p=><option key={p.id} value={p.id}>{p.nom_produit}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantité *</label>
            <input className="form-input" type="number" min="1" value={form.quantite||''} onChange={e=>setForm({...form,quantite:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date||''} onChange={e=>setForm({...form,date:e.target.value})} />
          </div>
          {modalType==='sortie' && (
            <div className="form-group full">
              <label className="form-label">Membre bénéficiaire</label>
              <select className="form-select" value={form.id_membre||''} onChange={e=>setForm({...form,id_membre:e.target.value})}>
                <option value="">-- Aucun --</option>
                <option value="1">Koné Ibrahim</option>
                <option value="2">Diallo Mamadou</option>
              </select>
            </div>
          )}
          {modalType==='entree' && (
            <div className="form-group full">
              <label className="form-label">Fournisseur</label>
              <select className="form-select"><option>-- Aucun --</option><option>AgroFourni SARL</option></select>
            </div>
          )}
          <div className="form-group full">
            <label className="form-label">Motif</label>
            <input className="form-input" value={form.motif||''} onChange={e=>setForm({...form,motif:e.target.value})} placeholder="Ex: Distribution semailles saison 2024" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
