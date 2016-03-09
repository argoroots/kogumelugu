var router   = require('express').Router()



router.get('/login', function(req, res) {
    res.render('user/login', {
        result: true,
        version: APP_VERSION,
        started: APP_STARTED
    })
})



router.get('/login/:provider', function(req, res) {
    res.render('user/login', {
        result: true,
        version: APP_VERSION,
        started: APP_STARTED
    })
})



module.exports = router
