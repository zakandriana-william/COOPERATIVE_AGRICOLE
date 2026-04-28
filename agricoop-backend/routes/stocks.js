const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/stocksController')
const { protect, adminOrGest, adminOnly } = require('../middleware/auth')

router.use(protect)
router.get('/alertes',       adminOrGest, ctrl.getAlertes)
router.get('/produits',      adminOrGest, ctrl.getProduits)
router.get('/produits/:id',  adminOrGest, ctrl.getProduitById)
router.post('/produits',     adminOnly,   ctrl.createProduit)
router.put('/produits/:id',  adminOnly,   ctrl.updateProduit)
router.get('/mouvements',    adminOrGest, ctrl.getMouvements)
router.post('/mouvements',   adminOrGest, ctrl.createMouvement)

module.exports = router
