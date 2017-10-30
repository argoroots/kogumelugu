const async = require('async')
const readline = require('readline')
const fs = require('fs')
const path = require('path')
const YAML = require('yamljs')

const fetch = require('./fetch.js')

const rl = readline.createInterface({
  input: require('fs').createReadStream('places.txt'),
  // output: process.stdout
})

var places = []

rl.on('line', function (line) {
  places.push(line)
})

rl.on('close', () => {
  async.eachLimit(places, 1, (place, callback) => {
    console.log('Processing place "' + place + '"')

    if( place.length === 0 ) {
      console.log('Place with no name')
      callback()
    } else {
      fetch(place, (placeData) => {
        console.log('Place "' + place + '" processed')
        // console.log('PlaceData', YAML.stringify(placeData))
        let filename = path.join('data', place + '.yaml')
        fs.writeFile(filename, YAML.stringify(placeData), (err) => {
          if (err) throw err
        })
        setTimeout(function () {
          callback()
        }, 5000)
      })
    }
  }, (err) => {
    if( err ) {
      console.log('A place failed to process')
    } else {
      console.log('All places have been processed successfully')
    }
  })
})


// rl.on('line', function (line) {
//   rl.pause()
//   console.log('Line from file:', line)
//   fetch(line, () => {
//     console.log('done with ' + line)
//     rl.resume()
//   })
// })
