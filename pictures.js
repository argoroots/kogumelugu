const _ = require('lodash')
const fs = require('fs-extra')
const path = require('path')
const request = require('request')
const vimeo = require('vimeo').Vimeo
const yaml = require('js-yaml')


const APP_VIMEO_ID = process.env.VIMEO_ID
const APP_VIMEO_SECRET = process.env.VIMEO_SECRET
const APP_VIMEO_TOKEN = process.env.VIMEO_TOKEN

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


const download = (uri, filename, callback) => {
    request.head(uri, (err, res, body) => {
        console.log(uri, filename)
        console.log('content-type:', res.headers['content-type'])
        console.log('content-length:', res.headers['content-length'])

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback)
    })
}


const videos = yaml.safeLoad(fs.readFileSync(PICTURES_YAML, 'utf8'))


for (var i = 0; i < videos.length; i++) {
    const videoPath = videos[i].path
    const videoId = videos[i].videoUrl

    if (parseInt(videoId, 10).toString() === videoId) {
        var v = new vimeo(APP_VIMEO_ID, APP_VIMEO_SECRET, APP_VIMEO_TOKEN)

        v.request({ path: '/videos/' + videoId + '/pictures' }, (error, body, status_code, headers) => {
            if (headers['x-ratelimit-remaining'] || headers['x-ratelimit-limit']) {
                console.log('Limit remaining ' + headers['x-ratelimit-remaining'] + ' / ' + headers['x-ratelimit-limit'])
            }
            if (headers['x-ratelimit-reset']) {
                console.log('Next reset ' + headers['x-ratelimit-reset'])
            }
            if (error) {
                console.log(error.message)
            } else {
                let urlList = _.get(body, ['data', 0, 'sizes'], [])
                let url = _.get(urlList, [urlList.length - 1, 'link'])
                if (url) {
                    download(url, path.join(PICTURES_DIR, videoPath + '.jpg'), () => {})
                }
            }
        })
    } else {
        let url = 'https://img.youtube.com/vi/' + videoId + '/0.jpg'
        download(url, path.join(PICTURES_DIR, videoPath + '.jpg'), () => {})
    }
}
