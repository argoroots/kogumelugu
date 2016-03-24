var _      = require('lodash')
var async  = require('async')
var op     = require('object-path')
var router = require('express').Router()
var vimeo  = require('vimeo').Vimeo

var entu   = require('../helpers/entu')


var splitFormulaValues = function(v) {
    var list = v.split(/[;\/]+/)
    list = _.map(list, function(n) {
        return n.trim() || null
    })
    list = list.filter(function(n) {
        return !!n
    })

    list = _.union(list)
    list.sort()

    return list
}


router.get('/', function(req, res, next) {
    async.parallel({
        subjectsFull: function(callback) {
            entu.getEntities({
                definition: 'subject',
                fullObject: false
            }, callback)
        },
        regionsFull: function(callback) {
            entu.getEntities({
                definition: 'region',
                fullObject: false
            }, callback)
        },
    },
    function(err, results) {
        if (err) return next(err)

        results.subjects = _.map(results.subjectsFull, function(n) {
            return n.get('name')
        })
        delete results.subjectsFull

        results.regions = _.map(results.regionsFull, function(n) {
            return n.get('name')
        })
        delete results.regionsFull

        results.generations = [
            '1920',
            '1930',
            '1940',
            '1950',
            '1960',
            '1970',
            '1980',
            '1990',
        ]
        results.pageUrl = req.protocol + '://' + req.get('host') + req.originalUrl

        res.render('video/videolist.' + res.locals.language + '.jade', results)
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

            var subjects = splitFormulaValues(video.get('subjectFullname-eng.value', '') + ';' + video.get('subjectFullname-est.value', '') + ';' + video.get('subjectFullname-rus.value', ''))
            var regions = splitFormulaValues(video.get('regionFullname.value', ''))
            var generations = splitFormulaValues(video.get('storytellerBirthYear.value', ''))

            results.push({
                id: video.get('_id'),
                name: video.get('_name'),
                info: video.get('_info'),
                video: video.get('videoUrl.value'),
                generations: generations,
                regions: regions,
                subjects: subjects,
            })

        }
        res.send(results)
    })
})



router.get('/:id', function(req, res, next) {

    entu.getEntity({
        id: req.params.id
    }, function(err, video) {
        if (err) return next(err)

        if (!res.locals.user && video.get('_definition') === 'interview') {
            return res.authenticate('interview')
        }

        var storytellers = video.get('storyteller', [])
        var query = []
        for (var i in storytellers) {
            if (!storytellers.hasOwnProperty(i)) { continue }

            query.push(storytellers[i].value)
        }

        async.parallel({
            subjectsFull: function(callback) {
                entu.getEntities({
                    definition: 'subject',
                    fullObject: false
                }, callback)
            },
            regionsFull: function(callback) {
                entu.getEntities({
                    definition: 'region',
                    fullObject: false
                }, callback)
            },
            chapters: function(callback) {
                entu.getEntities({
                    parentEntityId: req.params.id,
                    definition: 'chapter',
                    fullObject: false
                }, callback)
            },
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
            }
        },
        function(err, results) {
            if (err) return next(err)

            results.subjects = _.map(results.subjectsFull, function(n) {
                return n.get('name')
            })
            delete results.subjectsFull

            results.regions = _.map(results.regionsFull, function(n) {
                return n.get('name')
            })
            delete results.regionsFull

            results.generations = [
                '1920',
                '1930',
                '1940',
                '1950',
                '1960',
                '1970',
                '1980',
                '1990',
            ]
            results.video = video
            results.related = results.stories.concat(results.interviews)
            results.pageUrl = req.protocol + '://' + req.get('host') + req.originalUrl
            results.jumpTo = req.query.time

            res.render('video/video.' + res.locals.language + '.jade', results)
        })



    })
})



module.exports = router
