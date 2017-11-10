const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const async = require('async')


VIDEOS_YAML = process.env.VIDEOS_YAML
REGIONS_YAML = process.env.REGIONS_YAML
TCREGIONS_YAML = process.env.TCREGIONS_YAML

const videos = yaml.safeLoad(fs.readFileSync(VIDEOS_YAML, 'utf8'))
const regions = yaml.safeLoad(fs.readFileSync(REGIONS_YAML, 'utf8'))
const tcregions = yaml.safeLoad(fs.readFileSync(TCREGIONS_YAML, 'utf8'))

arr2obj = (arr, callback) => {
    let obj = {}
    async.each(arr, (item, callback) => {
        obj[item['_id']] = item
        async.setImmediate(() => callback(null))
    }, (err) => {
        if (err) { return callback(err) }
        callback(null, obj)
    })
}

async.parallel({
    regions: (callback) => {
        arr2obj(regions, callback)
    },
    tcregions: (callback) => {
        arr2obj(tcregions, callback)
    }
}, (err, results) => {
    if (err) { throw err }
    fs.writeFileSync(
        'regions_obj.yaml',
        yaml.safeDump(results),
        { indent: 4, lineWidth: 999999999 }
    )
})
