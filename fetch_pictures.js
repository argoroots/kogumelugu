const _ = require('lodash')
const fs = require('fs-extra')
const path = require('path')
const request = require('request')
const vimeo = require('vimeo').Vimeo
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
        url: 'https://api.entu.ee/auth',
        method: 'GET',
        json: true,
        'auth': {
            'bearer': ENTU_KEY
        }
    }, (error, res, body) => {
        if (error) { console.error(error) }
        if (res.statusCode !== 200) { console.error(body) }

        let token = _.get(body, [ENTU_DB, 'token'], '')

        let options = {
            url: 'https://api.entu.ee/property/' + id + '?download',
            method: 'GET',
            auth: { 'bearer': token }
        }
        let r = request(options)
        r.on('response',  function (res) {
            res.pipe(
                fs.createWriteStream(filename)
            )
            callback()
        })
    })

}


const videos = yaml.safeLoad(fs.readFileSync(PICTURES_YAML, 'utf8'))

async.eachLimit(videos, 15, (video, callback) => {
    if (video.path === undefined) {
        return callback()
    }
    if (video.photo === undefined) {
        return callback()
    }
    const videoPath = path.join(PICTURES_DIR, video.path + '.jpg')

    console.log(video.photo._id, videoPath)
    fs.ensureDir(path.dirname(videoPath))
    .then(() => download(video.photo._id, videoPath, callback))
}, function(err){
    if( err ) {
        console.log('A file failed to process')
        return
    } else {
        console.log('All files have been processed successfully')
        return
    }
})
