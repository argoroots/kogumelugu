var router   = require('express').Router()



router.get('/', function(req, res) {
    res.render('index', {
        result: true,
        version: APP_VERSION,
        started: APP_STARTED
    })
})



router.get('/test', function() {
    throw new Error('böö')
})



module.exports = router
