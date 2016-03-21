var _      = require('lodash')
var async  = require('async')
var router = require('express').Router()

var entu   = require('../helpers/entu')


router.get('/', function(req, res) {
    async.parallel({
        subjects: function(callback) {
            entu.getEntities({
                definition: 'subject',
                fullObject: false
            }, callback)
        },
        regions: function(callback) {
            entu.getEntities({
                definition: 'region',
                fullObject: false
            }, callback)
        },
        stories: function(callback) {
            entu.getEntities({
                definition: 'story',
                fullObject: true
            }, callback)
        },
        interviews: function(callback) {
            entu.getEntities({
                definition: 'interview',
                fullObject: true
            }, callback)
        },
    },
    function(err, results) {
        if(err) return next(err)

        var videos = results.stories.concat(results.interviews)
        var groupedVideos = []
        var lastWasFive = false

        while(videos.length > 0) {
            groupedVideos.push(videos.slice(0, 3))
            videos.splice(0, 3)

            if(lastWasFive) {
                groupedVideos.push(videos.slice(0, 2))
                videos.splice(0, 2)
            } else {
                groupedVideos.push(videos.slice(0, 5))
                videos.splice(0, 5)
            }
            lastWasFive = !lastWasFive
        }
        results.videos = groupedVideos
        results.pageUrl = req.protocol + '://' + req.get('host') + req.originalUrl

        res.render('video/videolist', results)
    })
})



router.get('/:id', function(req, res) {
    async.parallel({
        subjects: function(callback) {
            entu.getEntities({
                definition: 'subject',
                fullObject: false
            }, callback)
        },
        regions: function(callback) {
            entu.getEntities({
                definition: 'region',
                fullObject: false
            }, callback)
        },
        stories: function(callback) {
            entu.getEntities({
                definition: 'story',
                fullObject: true
            }, callback)
        },
        interviews: function(callback) {
            entu.getEntities({
                definition: 'interview',
                fullObject: true
            }, callback)
        },
        video: function(callback) {
            entu.getEntity({
                id: req.params.id
            }, callback)
        },
    },
    function(err, results) {
        if(err) return next(err)

        var videos = results.stories.concat(results.interviews)
        var groupedVideos = []
        var lastWasFive = false

        while(videos.length > 0) {
            groupedVideos.push(videos.slice(0, 3))
            videos.splice(0, 3)

            if(lastWasFive) {
                groupedVideos.push(videos.slice(0, 2))
                videos.splice(0, 2)
            } else {
                groupedVideos.push(videos.slice(0, 5))
                videos.splice(0, 5)
            }
            lastWasFive = !lastWasFive
        }
        results.videos = groupedVideos
        results.pageUrl = req.protocol + '://' + req.get('host') + req.originalUrl

        res.render('video/video', results)
    })
})



module.exports = router
