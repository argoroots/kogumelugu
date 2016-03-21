var _      = require('lodash')
var async  = require('async')
var op     = require('object-path')
var router = require('express').Router()
var vimeo  = require('vimeo').Vimeo

var entu   = require('../helpers/entu')


router.get('/', function(req, res, next) {
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
        if (err) return next(err)

        var videos = results.stories.concat(results.interviews)
        var groupedVideos = []
        var lastWasFive = false

        videos.sort(function() {
            return 0.5 - Math.random()
        })

        while(videos.length > 0) {
            groupedVideos.push(videos.slice(0, 3))
            videos.splice(0, 3)

            if (lastWasFive) {
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



router.get('/picture', function(req, res, next) {
    if (parseInt(req.query.id, 10).toString() === parseInt(req.query.id, 10)) {

        var v = new vimeo(APP_VIMEO_ID, APP_VIMEO_SECRET, APP_VIMEO_TOKEN)
        v.request({ path: '/videos/' + req.query.id + '/pictures' }, function(error, body, status_code, headers) {
            if (error) {
                res.redirect('https://placehold.it/579x318/?text=Kogu Me Lugu!')
            } else {
                var urlList = op.get(body, ['data', 0, 'sizes'], [])
                var url = op.get(urlList, [urlList.length - 1, 'link'])
                res.redirect(url)
            }
        })

    } else {

        res.redirect('https://img.youtube.com/vi/' + req.query.id + '/0.jpg')

    }
})



router.get('/:id', function(req, res, next) {
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
        chapters: function(callback) {
            entu.getEntities({
                parentEntityId: req.params.id,
                definition: 'chapter',
                fullObject: false
            }, callback)
        },
    },
    function(err, results) {
        if (err) return next(err)

        var videos = results.stories.concat(results.interviews)
        var groupedVideos = []
        var lastWasFive = false

        videos.sort(function() {
            return 0.5 - Math.random()
        })

        while(videos.length > 0) {
            groupedVideos.push(videos.slice(0, 3))
            videos.splice(0, 3)

            if (lastWasFive) {
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
