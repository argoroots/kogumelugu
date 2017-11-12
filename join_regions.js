const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const async = require('async')


VIDEOS_YAML = process.env.VIDEOS_YAML
REGIONS_YAML = process.env.REGIONS_YAML
TCREGIONS_YAML = process.env.TCREGIONS_YAML
VIDEO_DATA_YAML = process.env.VIDEO_DATA_YAML
MAP_DATA_JSON = process.env.MAP_DATA_JSON

const videos_arr = yaml.safeLoad(fs.readFileSync(VIDEOS_YAML, 'utf8'))
const regions_arr = yaml.safeLoad(fs.readFileSync(REGIONS_YAML, 'utf8'))
    .filter((r) => {
        if (r.lng === undefined) {
            return false
        }
        if (r.lat === undefined) {
            return false
        }
        return true
    })
const tcregions_arr = yaml.safeLoad(fs.readFileSync(TCREGIONS_YAML, 'utf8'))


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

let videos_out = []

async.parallel({
    regions: (callback) => {
        arr2obj(regions_arr, callback)
    },
    tcregions: (callback) => {
        arr2obj(tcregions_arr, callback)
    },
    videos: (callback) => {
        arr2obj(videos_arr, callback)
    }
}, (err, all_data) => {
    if (err) { throw err }

    async.each(all_data.videos, (video, callback) => {
        if (video.region === undefined) {
            async.setImmediate(() => callback(null))
            return
        }
        video.region = video.region
            .map((_id) => {
                // if (all_data.regions[_id] === undefined) {
                //     return undefined
                // }
                return all_data.regions[_id]
            })
            .filter((r) => r !== undefined)
        if (video.region.length === 0) {
            delete(video.region)
        }
        return callback(null)
    }, (err) => {
        if (err) { return callback(err) }
        async.each(all_data.tcregions, (tcregion, callback) => {
            if (tcregion._parent === undefined) {
                async.setImmediate(() => callback(null))
                return
            }
            if (tcregion.region === undefined) {
                async.setImmediate(() => callback(null))
                return
            }
            if (all_data.regions[tcregion.region] === undefined) {
                async.setImmediate(() => callback(null))
                return
            }
            let video = all_data.videos[tcregion._parent]
            let region = all_data.regions[tcregion.region]
            if (tcregion.time !== undefined) {
                region.time = tcregion.time
            }
            if (video.region === undefined) {
                video.region = []
            }
            video.region.push(region)
            return callback(null)
        }, (err) => {
            if (err) { return callback(err) }
            let videos_out = Object.keys(all_data.videos).map((key) => all_data.videos[key])
            fs.writeFileSync(
                VIDEO_DATA_YAML,
                yaml.safeDump(videos_out, { indent: 4, lineWidth: 999999999, noRefs: true })
            )
            // Expected data structure
            // [
            //   {
            //     "regions" : [
            //       {
            //         "place" : "Tallinn",
            //         "lat" : 59.244776000000002,
            //         "lng" : 25.6706793
            //       },
            fs.writeFileSync(
                MAP_DATA_JSON,
                JSON.stringify(videos_out.filter((v) => 'region' in v))
            )
            console.log('ready')
        })
    })
})
