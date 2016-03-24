var async  = require('async')
var router = require('express').Router()

var entu   = require('../helpers/entu')



router.get('/', function(req, res) {
    async.parallel({
        partners1: function(callback) {
            entu.getEntities({
                parentEntityId: 1178,
                definition: 'institution',
                fullObject: false
            }, callback)
        },
        partners2: function(callback) {
            entu.getEntities({
                parentEntityId: 1178,
                definition: 'person',
                fullObject: false
            }, callback)
        },
        sponsors: function(callback) {
            entu.getEntities({
                parentEntityId: 1179,
                definition: 'institution',
                fullObject: false
            }, callback)
        },
        thanks: function(callback) {
            entu.getEntities({
                parentEntityId: 1180,
                definition: 'person',
                fullObject: false
            }, callback)
        },
        team: function(callback) {
            entu.getEntities({
                parentEntityId: 1863,
                definition: 'person',
                fullObject: false
            }, callback)
        },
    },
    function(err, results) {
        if (err) return next(err)

        results.partners = results.partners1.concat(results.partners2)
        delete results.partners1
        delete results.partners2

        results.pageUrl = req.protocol + '://' + req.get('host') + req.originalUrl

        res.render('index/index.' + res.locals.language + '.jade', results)
    })
})



module.exports = router
