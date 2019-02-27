const _ = require('lodash')
const fs = require('fs-extra')
const path = require('path')
const request = require('request')
const yaml = require('js-yaml')
const async = require('async')


const APP_VIMEO_ID = process.env.VIMEO_ID
const APP_VIMEO_SECRET = process.env.VIMEO_SECRET
const APP_VIMEO_TOKEN = process.env.VIMEO_TOKEN
const ENTU_KEY = process.env.ENTU_KEY
const ENTU_DB = process.env.ENTU_DB

const PICTURES_YAML = process.env.PICTURES_YAML
    ? ( path.isAbsolute(process.env.PICTURES_YAML)
        ? process.env.PICTURES_YAML
        : path.join(process.cwd(), process.env.PICTURES_YAML)
    )
    : false


const PICTURES_DIR = process.env.PICTURES_DIR
    ? ( path.isAbsolute(process.env.PICTURES_DIR)
        ? process.env.PICTURES_DIR
        : path.join(process.cwd(), process.env.PICTURES_DIR)
    )
    : false


const download = (id, filename, callback) => {
    request({
        url: 'https://api.entu.app/auth',
        method: 'GET',
        json: true,
        'auth': {
            'bearer': ENTU_KEY
        }
    }, (error, res, body) => {
        if (error) { throw error }
        if (!res) { throw 'No res' }
        if (res.statusCode !== 200) { throw body }

        let token = _.get(body, [ENTU_DB, 'token'], '')

        let options = {
            url: 'https://api.entu.app/property/' + id + '?download',
            method: 'GET',
            auth: { 'bearer': token }
        }
        let r = request(options)
        r.on('response',  function (res) {
            res.pipe(
                fs.createWriteStream(filename)
            )
        })
        r.on('end',  function (res) {
            callback(null)
        })
    })

}


const videos = yaml.safeLoad(fs.readFileSync(PICTURES_YAML, 'utf8'))

// Originals (for featured videos)
async.eachLimit(videos, 5, (video, callback) => {
    if (video.path === undefined) {
        return callback()
    }
    if (video.photo === undefined) {
        return callback()
    }
    if (video.featured !== true) {
        return callback()
    }
    const videoPath = path.join(PICTURES_DIR, video.path + '.jpg')

    if (video.photo._id === undefined) {
        console.log(require('util').inspect(video, { depth: null }));
    }
    console.log(video.photo._id, videoPath)
    fs.ensureDir(path.dirname(videoPath))
    .then(() => download(video.photo._id, videoPath, callback))
}, function (err){
    if( err ) {
        console.log('A file failed to process')
        return
    } else {
        console.log('All originals have been processed successfully')
        return
    }
})

-// Thumbs
async.eachLimit(videos, 5, (video, callback) => {
    if (video.path === undefined) {
        return callback()
    }
    if (video.thumb === undefined) {
        return callback()
    }
    const videoPath = path.join(PICTURES_DIR, video.path + '_small.jpg')

    if (video.thumb._id === undefined) {
        console.log(require('util').inspect(video, { depth: null }));
    }
    console.log(video.thumb._id, videoPath)
    fs.ensureDir(path.dirname(videoPath))
    .then(() => download(video.thumb._id, videoPath, callback))
}, function (err){
    if( err ) {
        console.log('A file failed to process')
        return
    } else {
        console.log('All thumbs have been processed successfully')
        return
    }
})
