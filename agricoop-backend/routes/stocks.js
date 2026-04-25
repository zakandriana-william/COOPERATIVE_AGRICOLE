// ═══════════════ routes/stocks.js ═══════════════
const express  = require('express')
const router   = express.Router()
const ctrl     = require('../controllers/stocksController')
const { protect, adminOrGest, adminOnly } = require('../middleware/auth')

router.use(protect)
router.get ('/produits/alertes',  adminOrGest, ctrl.getAlertes)
router.get ('/produits',          adminOrGest, ctrl.getProduits)
router.get ('/produits/:id',      adminOrGest, ctrl.getProduitById)
router.post('/produits',          adminOrGest, ctrl.createProduit)
router.put ('/produits/:id',      adminOrGest, ctrl.updateProduit)
router.get ('/mouvements',        adminOrGest, ctrl.getMouvements)
router.post('/mouvements',        adminOrGest, ctrl.createMouvement)

module.exports = router


// ═══════════════ routes/recoltes.js ═══════════════
const express2  = require('express')
const router2   = express2.Router()
const ctrl2     = require('../controllers/recoltesController')
const { protect: p2, adminOrGest: ag2, adminOnly: ao2 } = require('../middleware/auth')

router2.use(p2)
router2.get ('/saisons',        ag2, ctrl2.getSaisons)
router2.get ('/saisons/active', ag2, ctrl2.getSaisonActive)
router2.post('/saisons',        ag2, ctrl2.createSaison)
router2.get ('/comparaison',    ag2, ctrl2.getComparaison)
router2.get ('/',               ag2, ctrl2.getRecoltes)
router2.post('/',               ag2, ctrl2.createRecolte)
router2.put ('/:id',            ag2, ctrl2.updateRecolte)
router2.delete('/:id',          ao2, ctrl2.deleteRecolte)

module.exports = { stocksRouter: router, recoltesRouter: router2 }


// ═══════════════ routes/finances.js ═══════════════
const express3  = require('express')
const router3   = express3.Router()
const ctrl3     = require('../controllers/financesController')
const { protect: p3, adminOnly: ao3 } = require('../middleware/auth')

router3.use(p3)
router3.get ('/bilan',        ao3, ctrl3.getBilan)
router3.get ('/',             ao3, ctrl3.getTransactions)
router3.post('/',             ao3, ctrl3.createTransaction)
router3.post('/:id/recu',    ao3, ctrl3.genererRecu)

module.exports = router3
