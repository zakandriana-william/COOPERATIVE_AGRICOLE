// routes/membres.js
const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/membresController')
const { protect, adminOrGest, adminOnly } = require('../middleware/auth')

router.use(protect)
router.get ('/',                   adminOrGest, ctrl.getMembres)
router.get ('/:id',                adminOrGest, ctrl.getMembreById)
router.post('/',                   adminOnly,   ctrl.createMembre)
router.put ('/:id',                adminOnly,   ctrl.updateMembre)
router.patch('/:id/suspendre',     adminOnly,   ctrl.suspendreMembre)
router.patch('/:id/reactiver',     adminOnly,   ctrl.reactiverMembre)
router.get ('/:id/cotisations',    adminOrGest, ctrl.getCotisationsMembre)

module.exports = router
