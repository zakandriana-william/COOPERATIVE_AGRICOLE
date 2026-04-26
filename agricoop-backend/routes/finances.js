const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/financesController')
const { protect, adminOnly } = require('../middleware/auth')

router.use(protect)
router.get ('/bilan',     adminOnly, ctrl.getBilan)
router.get ('/',          adminOnly, ctrl.getTransactions)
router.post('/',          adminOnly, ctrl.createTransaction)
router.post('/:id/recu',  adminOnly, ctrl.genererRecu)

module.exports = router
