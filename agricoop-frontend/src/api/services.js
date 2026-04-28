import api from './axios'

// ══ AUTH ══════════════════════════════════════════════
export const authAPI = {
  login:         (data)  => api.post('/auth/login', data),
  register:      (data)  => api.post('/auth/register', data),
  me:            ()      => api.get('/auth/me'),
  resetPassword: (email) => api.post('/auth/reset-password', { email }),
}

// ══ MEMBRES ═══════════════════════════════════════════
export const membresAPI = {
  getAll:    (params)     => api.get('/membres', { params }),
  getById:   (id)         => api.get(`/membres/${id}`),
  create:    (data)       => api.post('/membres', data),
  update:    (id, data)   => api.put(`/membres/${id}`, data),
  suspendre: (id)         => api.patch(`/membres/${id}/suspendre`),
  reactiver: (id)         => api.patch(`/membres/${id}/reactiver`),
  cotisations: (id)       => api.get(`/membres/${id}/cotisations`),
}

// ══ COTISATIONS ═══════════════════════════════════════
export const cotisationsAPI = {
  getAll:  (params)     => api.get('/cotisations', { params }),
  create:  (data)       => api.post('/cotisations', data),
  update:  (id, data)   => api.put(`/cotisations/${id}`, data),
}

// ══ STOCKS ════════════════════════════════════════════
export const stocksAPI = {
  getProduits:     (params)   => api.get('/produits', { params }),
  getProduitById:  (id)       => api.get(`/produits/${id}`),
  createProduit:   (data)     => api.post('/produits', data),
  updateProduit:   (id, data) => api.put(`/produits/${id}`, data),
  getMouvements:   (params)   => api.get('/mouvements', { params }),
  createMouvement: (data)     => api.post('/mouvements', data),
  getAlertes:      ()         => api.get('/alertes'),
}

// ══ FOURNISSEURS ══════════════════════════════════════
export const fournisseursAPI = {
  getAll: () => api.get('/fournisseurs'),
}

// ══ RÉCOLTES ══════════════════════════════════════════
export const recoltesAPI = {
  getAll:         (params)   => api.get('/recoltes', { params }),
  create:         (data)     => api.post('/recoltes', data),
  update:         (id, data) => api.put(`/recoltes/${id}`, data),
  delete:         (id)       => api.delete(`/recoltes/${id}`),
  getComparaison: ()         => api.get('/recoltes/comparaison'),
}

// ══ SAISONS ═══════════════════════════════════════════
export const saisonsAPI = {
  getAll:    () => api.get('/saisons'),
  getActive: () => api.get('/saisons/active'),
  create:    (data) => api.post('/saisons', data),
}

// ══ FINANCES ══════════════════════════════════════════
export const financesAPI = {
  getTransactions: (params) => api.get('/transactions', { params }),
  create:          (data)   => api.post('/transactions', data),
  getBilan:        ()       => api.get('/transactions/bilan'),
  genererRecu:     (id)     => api.post(`/transactions/${id}/recu`),
}

// ══ DASHBOARD ═════════════════════════════════════════
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
}

// ══ UTILISATEURS ══════════════════════════════════════
export const utilisateursAPI = {
  getAll: () => api.get('/utilisateurs'),

  // ✅ PATCH /utilisateurs/:id/role  (et non PUT /utilisateurs/:id)
  changerRole: (id, role) => api.patch(`/utilisateurs/${id}/role`, { role }),

  // ✅ PATCH /utilisateurs/:id/actif
  toggleActif: (id, actif) => api.patch(`/utilisateurs/${id}/actif`, { actif }),
}
