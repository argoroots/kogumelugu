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
    },
    function(err, results) {
        if (err) return next(err)

        results.pageUrl = req.protocol + '://' + req.get('host') + req.originalUrl

        res.render('video/videolist', results)
    })
})



router.get('/picture', function(req, res, next) {
    if (parseInt(req.query.id, 10).toString() === req.query.id) {

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



router.get('/json', function(req, res, next) {
    async.parallel({
        stories: function(callback) {
            entu.getEntities({
                definition: 'story',
                query: req.query.q,
                fullObject: true
            }, callback)
        },
        interviews: function(callback) {
            entu.getEntities({
                definition: 'interview',
                query: req.query.q,
                fullObject: true
            }, callback)
        },
    },
    function(err, results) {
        if (err) return next(err)

        var videos = results.stories.concat(results.interviews)
        var results = []

        for (var i in videos) {
            if (!videos.hasOwnProperty(i)) { continue }

            var video = videos[i]

            var regions = []
            if(video.get('regionFullname.value')) {
                regionFullname = video.get('regionFullname.value', '').split(';')
                for (var r in regionFullname) {
                    if (!regionFullname.hasOwnProperty(r)) { continue }

                    regions.push(regionFullname[r].trim())
                }
            }

            var categories = []
            for (var c in video.get('curriculumSubjects', [])) {
                if (!video.get('curriculumSubjects', []).hasOwnProperty(c)) { continue }

                categories.push(video.get('curriculumSubjects', [])[c].value)
            }

            var generations = []
            if(video.get('storytellerBirthYear.value')) {
                storytellerBirthYear = video.get('storytellerBirthYear.value', '').split(';')
                for (var g in storytellerBirthYear) {
                    if (!storytellerBirthYear.hasOwnProperty(g)) { continue }

                    generations.push(Math.floor(parseInt(storytellerBirthYear[g].trim(), 10) / 10) * 10)
                }
                generations = _.union(generations)
            }

            results.push({
                id: video.get('_id'),
                name: video.get('_name'),
                info: video.get('_info'),
                video: video.get('videoUrl.value'),
                generation: generations,
                regions: regions,
                categories: categories,
            })

        }
        res.send(results)
    })
})



router.get('/:id', function(req, res, next) {
    res.redirect('/video/' + req.params.id + '/0')
})


router.get('/:id/:t', function(req, res, next) {
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

        var storytellers = results.video.get('storyteller', [])
        var query = []
        for (var i in storytellers) {
            if (!storytellers.hasOwnProperty(i)) { continue }

            query.push(storytellers[i].value)
        }

        async.parallel({
            stories: function(callback) {
                entu.getEntities({
                    definition: 'story',
                    query: query.join(' '),
                    fullObject: true
                }, callback)
            },
            interviews: function(callback) {
                entu.getEntities({
                    definition: 'interview',
                    query: query.join(' '),
                    fullObject: true
                }, callback)
            },
        },
        function(err, related) {
            if (err) return next(err)

            results.related = related.stories.concat(related.interviews)
            results.pageUrl = req.protocol + '://' + req.get('host') + req.originalUrl
            results.jumpTo = req.params.t

            res.render('video/video', results)
        })

    })
})



module.exports = router
