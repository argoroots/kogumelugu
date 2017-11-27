const async = require('async')
const readline = require('readline')
const fs = require('fs')
const path = require('path')
const YAML = require('yamljs')

const fetch = require('./geofetch.js')

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
                csvWrite(placeData)
                // fs.writeFile(filename, YAML.stringify(placeData), (err) => {
                //     if (err) throw err
                // })
                setTimeout(function () {
                    callback()
                }, 20)
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


FIELDS = [ 'query', 'lng', 'lat', 'toponymName', 'geonameId', 'name-en',
    'countryId', 'countryName-en', 'name-et', 'countryName-et', 'name-ru',
    'countryName-ru' ]
const CSVSTREAM = fs.createWriteStream('places.csv')
CSVSTREAM.write(FIELDS.join(', ') + '\n')

const csvWrite = function csvWrite(place) {
    CSVSTREAM.write(
        FIELDS
            .map(function (field) {
                let ret_val = place[field] ? place[field] : ''
                try {
                    return '"' + ret_val.replace(/"/g, '""') + '"'
                } catch (e) {
                    console.log({ place:place, field:field, ret_val:ret_val })
                    throw e
                }
            })
            .join(', ') + '\n'
    )
}
