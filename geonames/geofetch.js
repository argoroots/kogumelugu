const fs = require('fs')
const request = require('request')
const async = require('async')


module.exports = (cityname, callback) => {
  const languages = ['et', 'en', 'ru']

  async.each(languages, (language, callback) => {
    placeData = {
      query: cityname,
      setProperty: (key, val, callback) => {
        val = String(val)
        if (placeData[key] === undefined) {
          placeData[key] = val
        } else if (placeData[key] !== val) {
          callback('CONFLICT', key)
        } else {
          null
        }
      }
    }
    let uri = 'http://api.geonames.org/searchJSON?q=' + cityname
            + '&lang=' + language
            + '&formatted=true&maxRows=1&username=test2'
    uri = encodeURI(uri)

    request.head(uri, (err, res, body) => {
      let data = ''
      request
        .get(uri)
        .on('data', (chunk) => {
          data = data + chunk
        })
        .on('end', () => {
          parsedData = JSON.parse(data).geonames[0]
          if (parsedData === undefined) {
            return callback()
          }
          placeData.setProperty('geonameId', parsedData['geonameId'], callback)
          placeData.setProperty('countryId', parsedData['countryId'], callback)
          placeData.setProperty('lng', parsedData['lng'], callback)
          placeData.setProperty('lat', parsedData['lat'], callback)
          placeData.setProperty('toponymName', parsedData['toponymName'], callback)
          placeData.setProperty('name-' + language, parsedData['name'], callback)
          placeData.setProperty('countryName-' + language, parsedData['countryName'], callback)
          callback()
        })
    })
  }, (err) => {
    if( err ) {
      console.log('A language failed to process', err)
    } else {
      // console.log('placeData: ', require('util').inspect(placeData, { depth: 2 }))
      delete placeData.setProperty
      callback(placeData)
    }
  })
}
