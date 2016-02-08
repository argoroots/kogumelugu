var router   = require('express').Router()



router.get('/', function(req, res) {
    res.redirect('/video')
})



router.get('/test', function() {
    throw new Error('böö')
})



module.exports = router
