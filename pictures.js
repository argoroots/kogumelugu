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
  console.log('foo')
  // return
  request.head(uri, (err, res, body) => {
    console.log(uri, filename)
    console.log('content-type:', res.headers['content-type'])
    console.log('content-length:', res.headers['content-length'])

    request({
      url: uri,
      method: 'GET',
      encoding: 'binary'
    }, (error, response, body) => {
      if (error) {
        console.error(error)
        callback(null)
      } else if (response.statusCode !== 200) {
        console.error(body)
        callback(null)
      } else {
        fs.outputFile(filename, body, 'binary', callback)
      }
    })
  })
}


const videos = yaml.safeLoad(fs.readFileSync(PICTURES_YAML, 'utf8'))


// for (var i = 0; i < videos.length; i++) {
videos.forEach((video, ix) => {
  const videoPath = path.join(PICTURES_DIR, video.path + '.jpg')
  console.log(videoPath);
  // process.exit(0)
  fs.access(videoPath, fs.constants.F_OK, (err) => {
  //   console.log(videoPath, err ? 'will try to fetch' : 'file allready here')
    if (!err) {
    // console.log('present', videoPath, video.subtitle_et)
      return
    }

    console.log('missing', videoPath)
  //   return
    const videoId = video.videoUrl

    if (parseInt(videoId, 10).toString() === videoId) {
      var v = new vimeo(APP_VIMEO_ID, APP_VIMEO_SECRET, APP_VIMEO_TOKEN)

      v.request({ path: '/videos/' + videoId + '/pictures' }, (error, body, status_code, headers) => {
        if (error) {
          console.log({body:body, headers:headers, url:video.videoUrl, eid:video._mid})
        }
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
            download(url, videoPath, (error) => {
              if (error) {
                throw error
              }
            })
          }
        }
      })
    } else if (videoId === undefined) {
      console.log('No video url for ', video._mid)
    } else {
      let url = 'https://img.youtube.com/vi/' + videoId + '/0.jpg'
      console.log('fetch from youtube', url)
      download(url, path.join(PICTURES_DIR, videoPath + '.jpg'), () => {})
    }
  })
})
