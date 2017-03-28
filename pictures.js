const fs = require('fs')
const op = require('object-path')
const path = require('path')
const request = require('request')
const vimeo  = require('vimeo').Vimeo
const yaml = require('js-yaml')


const APP_VIMEO_ID = process.env.VIMEO_ID
const APP_VIMEO_SECRET = process.env.VIMEO_SECRET
const APP_VIMEO_TOKEN = process.env.VIMEO_TOKEN


const VIDEOS_YAML = process.env.VIDEOS_YAML
    ? ( path.isAbsolute(process.env.VIDEOS_YAML)
            ? process.env.VIDEOS_YAML
            : path.join(process.cwd(), process.env.VIDEOS_YAML)
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


const videos = yaml.safeLoad(fs.readFileSync(VIDEOS_YAML, 'utf8'))


for (var i = 0; i < videos.length; i++) {
    const videoId = op.get(videos[i], 'properties.videoUrl.values.0.value')
    var videoUrl

    if (parseInt(videoId, 10).toString() === videoId) {
        var v = new vimeo(APP_VIMEO_ID, APP_VIMEO_SECRET, APP_VIMEO_TOKEN)

        v.request({ path: '/videos/' + videoId + '/pictures' }, (error, body, status_code, headers) => {
            if (error) {
                videoUrl = 'https://placehold.it/579x318/?text=Kogu Me Lugu!'
            } else {
                let urlList = op.get(body, ['data', 0, 'sizes'], [])
                let url = op.get(urlList, [urlList.length - 1, 'link'])
                if (url) {
                    download(url, path.join(PICTURES_DIR, videoId + '.jpg'), () => {})
                }
            }
        })
    } else {
        let url = 'https://img.youtube.com/vi/' + videoId + '/0.jpg'
        download(url, path.join(PICTURES_DIR, videoId + '.jpg'), () => {})
    }
}
