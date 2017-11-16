const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const async = require('async')


VIDEOS_YAML = process.env.VIDEOS_YAML
REGIONS_YAML = process.env.REGIONS_YAML
TCREGIONS_YAML = process.env.TCREGIONS_YAML
VIDEO_DATA_YAML = process.env.VIDEO_DATA_YAML
PERSONS_YAML = process.env.PERSONS_YAML
TAGS_YAML = process.env.TAGS_YAML
TCTAGS_YAML = process.env.TCTAGS_YAML
CATEGORIES_YAML = process.env.CATEGORIES_YAML
LANGUAGES_YAML = process.env.LANGUAGES_YAML

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
const persons_arr = yaml.safeLoad(fs.readFileSync(PERSONS_YAML, 'utf8'))
const tags_arr = yaml.safeLoad(fs.readFileSync(TAGS_YAML, 'utf8'))
const tctags_arr = yaml.safeLoad(fs.readFileSync(TCTAGS_YAML, 'utf8'))
const categories_arr = yaml.safeLoad(fs.readFileSync(CATEGORIES_YAML, 'utf8'))
const languages_arr = yaml.safeLoad(fs.readFileSync(LANGUAGES_YAML, 'utf8'))


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

attach2parent = (childs, all_data_videos, all_data_of_type, type_name, callback) => {
    async.each(childs, (child, callback) => {
        if (child._parent === undefined) {
            async.setImmediate(() => callback(null))
            return
        }
        if (child[type_name] === undefined) {
            async.setImmediate(() => callback(null))
            return
        }
        if (all_data_of_type[child[type_name]] === undefined) {
            async.setImmediate(() => callback(null))
            return
        }
        let video = all_data_videos[child._parent]
        let new_field = all_data_of_type[child[type_name]]
        if (child.time !== undefined) {
            new_field.time = child.time
        }
        if (video[type_name] === undefined) {
            video[type_name] = []
        }
        video[type_name].push(new_field)
        return callback(null)
    }, (err) => {
        if (err) { return callback(err) }
        return callback(null)
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
    },
    persons: (callback) => {
        arr2obj(persons_arr, callback)
    },
    tags: (callback) => {
        arr2obj(tags_arr, callback)
    },
    tctags: (callback) => {
        arr2obj(tctags_arr, callback)
    },
    categories: (callback) => {
        arr2obj(categories_arr, callback)
    },
    languages: (callback) => {
        arr2obj(languages_arr, callback)
    }
}, (err, all_data) => {
    if (err) { throw err }

    async.each(all_data.videos, (video, callback) => {
        // Regions
        if (video.region !== undefined) {
            video.region = video.region
            .map((_id) => {
                return all_data.regions[_id]
            })
            .filter((r) => r !== undefined)
            if (video.region.length === 0) {
                delete(video.region)
            }
        }

        // Storytellers
        if (video.storyteller !== undefined) {
            video.storyteller = video.storyteller
            if (all_data.persons[video.storyteller]) {
                video.storyteller = all_data.persons[video.storyteller]
            }
        }

        // Authors
        if (video.author !== undefined) {
            video.author = video.author
            if (all_data.persons[video.author]) {
                video.author = all_data.persons[video.author]
            }
        }

        // Tags / Märksõnad
        if (video.tag !== undefined) {
            video.tag = video.tag
            .map((_id) => {
                return all_data.tags[_id]
            })
            .filter((r) => r !== undefined)
            if (video.tag.length === 0) {
                delete(video.tag)
            }
        }

        // Categories
        if (video.category !== undefined) {
            video.category = video.category
            if (all_data.categories[video.category]) {
                video.category = all_data.categories[video.category]
            }
        }

        // Languages
        if (video.language !== undefined) {
            video.language = video.language
            if (all_data.languages[video.language]) {
                video.language = all_data.languages[video.language]
            }
        }

        async.setImmediate(() => callback(null))
        return
    }, (err) => {
        if (err) { return callback(err) }

        async.series([
            (callback) => attach2parent(all_data.tcregions, all_data.videos, all_data.regions, 'region', callback),
            (callback) => attach2parent(all_data.tctags, all_data.videos, all_data.tags, 'tag', callback)
        ], (err) => {
            if (err) { return callback(err) }
            let videos_out = Object.keys(all_data.videos).map((key) => all_data.videos[key])
            fs.writeFileSync(
                VIDEO_DATA_YAML,
                yaml.safeDump(videos_out, { indent: 4, lineWidth: 999999999, noRefs: true })
            )
            console.log('ready')
        })

        // async.each(all_data.tcregions, (tcregion, callback) => {
        //     if (tcregion._parent === undefined) {
        //         async.setImmediate(() => callback(null))
        //         return
        //     }
        //     if (tcregion.region === undefined) {
        //         async.setImmediate(() => callback(null))
        //         return
        //     }
        //     if (all_data.regions[tcregion.region] === undefined) {
        //         async.setImmediate(() => callback(null))
        //         return
        //     }
        //     let video = all_data.videos[tcregion._parent]
        //     let region = all_data.regions[tcregion.region]
        //     if (tcregion.time !== undefined) {
        //         region.time = tcregion.time
        //     }
        //     if (video.region === undefined) {
        //         video.region = []
        //     }
        //     video.region.push(region)
        //     return callback(null)
        // }, (err) => {
        //     if (err) { return callback(err) }
        //     let videos_out = Object.keys(all_data.videos).map((key) => all_data.videos[key])
        //     fs.writeFileSync(
        //         VIDEO_DATA_YAML,
        //         yaml.safeDump(videos_out, { indent: 4, lineWidth: 999999999, noRefs: true })
        //     )
        //     console.log('ready')
        // })
    })
})
