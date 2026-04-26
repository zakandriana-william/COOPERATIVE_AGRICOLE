const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/recoltesController')
const { protect, adminOrGest, adminOnly } = require('../middleware/auth')

router.use(protect)
router.get ('/saisons',        adminOrGest, ctrl.getSaisons)
router.get ('/saisons/active', adminOrGest, ctrl.getSaisonActive)
router.post('/saisons',        adminOrGest, ctrl.createSaison)
router.get ('/comparaison',    adminOrGest, ctrl.getComparaison)
router.get ('/',               adminOrGest, ctrl.getRecoltes)
router.post('/',               adminOrGest, ctrl.createRecolte)
router.put ('/:id',            adminOrGest, ctrl.updateRecolte)
router.delete('/:id',          adminOnly,   ctrl.deleteRecolte)

module.exports = router
