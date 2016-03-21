var router   = require('express').Router()



router.get('/', function(req, res) {
    res.render('index/index', {
        pageUrl: req.protocol + '://' + req.get('host') + req.originalUrl
    })
})



router.get('/test', function() {
    throw new Error('böö')
})



module.exports = router
