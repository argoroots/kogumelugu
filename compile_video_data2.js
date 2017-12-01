const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const async = require('async')


VIDEO_DATA_YAML = process.env.VIDEO_DATA_YAML
TAG_DATA_YAML = process.env.TAG_DATA_YAML
REGION_DATA_YAML = process.env.REGION_DATA_YAML
PERSON_DATA_YAML = process.env.PERSON_DATA_YAML
HIERARCHY_DATA_YAML = process.env.HIERARCHY_DATA_YAML

VIDEOS_YAML = process.env.VIDEOS_YAML
REGIONS_YAML = process.env.REGIONS_YAML
TCREGIONS_YAML = process.env.TCREGIONS_YAML
PERSONS_YAML = process.env.PERSONS_YAML
TCPERSONS_YAML = process.env.TCPERSONS_YAML
TAGS_YAML = process.env.TAGS_YAML
TCTAGS_YAML = process.env.TCTAGS_YAML
CATEGORIES_YAML = process.env.CATEGORIES_YAML
LANGUAGES_YAML = process.env.LANGUAGES_YAML

const videos_arr = yaml.safeLoad(fs.readFileSync(VIDEOS_YAML, 'utf8'))
const regions_arr = yaml.safeLoad(fs.readFileSync(REGIONS_YAML, 'utf8'))
    .filter((r) => {
        if (r.name_et === undefined || r.name_en === undefined || r.name_ru === undefined) {
            return false
        }
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
const tcpersons_arr = yaml.safeLoad(fs.readFileSync(TCPERSONS_YAML, 'utf8'))
const tags_arr = yaml.safeLoad(fs.readFileSync(TAGS_YAML, 'utf8'))
    .filter((r) => {
        if (r.name_et === undefined || r.name_en === undefined || r.name_ru === undefined) {
            return false
        }
        return true
    })
const tctags_arr = yaml.safeLoad(fs.readFileSync(TCTAGS_YAML, 'utf8'))
const categories_arr = yaml.safeLoad(fs.readFileSync(CATEGORIES_YAML, 'utf8'))
const languages_arr = yaml.safeLoad(fs.readFileSync(LANGUAGES_YAML, 'utf8'))


const arr2objAll = (callback) => {

    const arr2obj = (arr, is_hierarchical, callback) => {
        let obj = {}

        async.each(arr, (item, callback) => {
            obj[item._id] = item
            obj[item._id]._anchestors = []
            async.setImmediate(() => callback(null))
        }, (err) => {
            if (err) {
                return callback(err)
            }
            callback(null, obj)
        })
    }

    async.parallel({
        videos: (callback) => {
            arr2obj(videos_arr, false, callback)
        },
        regions: (callback) => {    // tree
            arr2obj(regions_arr, true, callback)
        },
        persons: (callback) => {
            arr2obj(persons_arr, false, callback)
        },
        tags: (callback) => {       // tree
            arr2obj(tags_arr, true, callback)
        },
        categories: (callback) => {
            arr2obj(categories_arr, false, callback)
        },
        languages: (callback) => {
            arr2obj(languages_arr, false, callback)
        }
    }, (err, all_data) => {
        if (err) { callback(err) }
        // fs.writeFileSync(
        //     HIERARCHY_DATA_YAML + '1.yaml',
        //     yaml.safeDump(all_data, { indent: 4, lineWidth: 999999999, noRefs: true })
        // )
        callback(null, all_data)
    })
}

async.waterfall([
    (callback) => arr2objAll(callback),
    (all_data, callback) => {
        // console.log(require('util').inspect(Object.keys(all_data), { depth: null }));
        const initialize = (all_data, callback) => {
            async.parallel([
                (callback) => { // init _persons, _regions and _tags for video
                    async.forEachOf(all_data.videos, (video, key, callback) => {
                        video._persons = []
                        video._regions = []
                        video._tags = []
                        if (video.storyteller === undefined) {
                            video.storyteller = []
                        }
                        if (!Array.isArray(video.storyteller)) {
                            video.storyteller = [video.storyteller]
                        }
                        if (video.author === undefined) {
                            video.author = []
                        }
                        if (!Array.isArray(video.author)) {
                            video.author = [video.author]
                        }
                        async.setImmediate(() => callback(null))
                    }, (err) => {
                        if (err) { return callback(err) }
                        callback(null)
                    })
                },
                (callback) => { // init _videos, _childs for tag, clean parents
                    async.forEachOf(all_data.tags, (tag, key, callback) => {
                        tag._videos = []
                        tag._childs = []
                        if (tag._parent === undefined) {
                            tag._parent = []
                        }
                        if (!Array.isArray(tag._parent)) {
                            tag._parent = [tag._parent]
                        }
                        tag._parent = tag._parent.filter((p) => p in all_data.tags)
                        async.setImmediate(() => callback(null))
                    }, (err) => {
                        if (err) { return callback(err) }
                        callback(null)
                    })
                },
                (callback) => { // init _videos, _childs for region, clean parents
                    async.forEachOf(all_data.regions, (region, key, callback) => {
                        region._videos = []
                        region._childs = []
                        if (region._parent === undefined) {
                            region._parent = []
                        }
                        if (!Array.isArray(region._parent)) {
                            region._parent = [region._parent]
                        }
                        region._parent = region._parent.filter((p) => p in all_data.regions)
                        async.setImmediate(() => callback(null))
                    }, (err) => {
                        if (err) { return callback(err) }
                        callback(null)
                    })
                },
                (callback) => { // init _videos for person
                    async.forEachOf(all_data.persons, (person, key, callback) => {
                        person._videos = []
                        if (person._parent === undefined) {
                            person._parent = []
                        }
                        if (!Array.isArray(person._parent)) {
                            person._parent = [person._parent]
                        }
                        async.setImmediate(() => callback(null))
                    }, (err) => {
                        if (err) { return callback(err) }
                        callback(null)
                    })
                }
            ], (err) => {
                if (err) { return callback(err) }
                callback(null)
            })
        }
        const connectTC = (tc_arr, all_data, tctype_name, callback) => {
            const recAddVideo = (rel_types_obj, rel_id, video) => {
                let tc_obj = rel_types_obj[rel_id]
                // console.log(require('util').inspect({rel_id,tc_obj}, { depth: null }));
                if (tc_obj._videos.indexOf(video._id) === -1) {
                    tc_obj._videos.push(video._id)
                }
                tc_obj._parent.forEach((_id) => {
                    if (_id in rel_types_obj) {
                        recAddVideo(rel_types_obj, _id, video)
                    }
                })
            }
            let tctype_names = tctype_name + 's'
            let _tctype_name = '_' + tctype_names
            async.each(tc_arr, (tc_relation, callback) => {
                if (tc_relation._parent === undefined) {
                    async.setImmediate(() => callback(null))
                    return
                }
                if (tc_relation[tctype_name] === undefined) {
                    async.setImmediate(() => callback(null))
                    return
                }
                if (tc_relation.time === undefined) {
                    tc_relation.time = '00:00:00'
                }
                let video = all_data['videos'][tc_relation._parent]
                if (video === undefined) {
                    async.setImmediate(() => callback(null))
                    return
                }
                let rel_types_obj = all_data[tctype_names]
                let rel_id = tc_relation[tctype_name]
                let tc_obj = rel_types_obj[rel_id]
                if (tc_obj === undefined) {
                    async.setImmediate(() => callback(null))
                    return
                }
                video[_tctype_name].push({'_id': tc_obj._id, 'time': tc_relation.time})
                recAddVideo(rel_types_obj, rel_id, video)
                async.setImmediate(() => callback(null))
                return
            }, (err) => {
                if (err) {
                    return callback(err)
                }
                callback(null)
            })
        }
        const parentChild = (all_data, type_name, callback) => {
            let objects = all_data[type_name + 's']
            async.forEachOf(objects, (o, callback) => {
                o._parent.forEach((_id) => {
                    objects[_id]._childs.push(o._id)
                })
            }, (err) => {
                if (err) { return callback(err) }
                callback(null)
            })
            async.setImmediate(() => callback(null))
        }
        // const enrichTree = (flat, tree, callback) => {
        //     async.each(tree, (node, callback) => {
        //         let flatNode = flat[node._id]
        //         if (flatNode === undefined) {
        //             async.setImmediate(() => callback(null))
        //             return
        //         }
        //         node.name_et = flatNode.name_et
        //         node.name_en = flatNode.name_en
        //         node.name_ru = flatNode.name_ru
        //
        //         if (node._childs.length === 0) {
        //             callback(null)
        //         } else {
        //             enrichTree(flat, node._childs, callback)
        //         }
        //     }, (err) => {
        //         if (err) { return callback(err) }
        //         return callback(null)
        //     })
        // }

        async.series({
            zero: (callback) => initialize(all_data, callback),
            VnR: (callback) => connectTC(
                tcregions_arr,      // relationships
                all_data,           // all data
                'region',           // type_name
                callback),
            VnP: (callback) => connectTC(
                tcpersons_arr,      // relationships
                all_data,           // all data
                'person',           // type_name
                callback),
            VnT: (callback) => connectTC(
                tctags_arr,         // relationships
                all_data,           // all data
                'tag',              // type_name
                callback),
            RnR: (callback) => parentChild(
                all_data,           // all data
                'region',           // type_name
                callback),
            TnT: (callback) => parentChild(
                all_data,           // all data
                'tag',              // type_name
                callback),
            all_data: (callback) => callback(null, all_data)
        }, (err, data) => { // just pass all_data
            if (err) { return callback(err) }
            // fs.writeFileSync(
            //     HIERARCHY_DATA_YAML + '2.yaml',
            //     yaml.safeDump(data.all_data, { indent: 4, lineWidth: 999999999, noRefs: true })
            // )
            callback(null, data.all_data)
        })
    },
    (all_data, callback) => { // do more manipulation on all_data
        // fs.writeFileSync(
        //     HIERARCHY_DATA_YAML + '3.yaml',
        //     yaml.safeDump(all_data, { indent: 4, lineWidth: 999999999, noRefs: true })
        // )
        callback(null, all_data)
    }
], (err, all_data) => {
    if (err) { throw err }
    // fs.writeFileSync(
    //     HIERARCHY_DATA_YAML + '4.yaml',
    //     yaml.safeDump(all_data, { indent: 4, lineWidth: 999999999, noRefs: true })
    // )
    const isTagInVideo = (tag_key, videos) => {
        if (videos.some(
            (video) => {
                if ((video.tag ? true : false) &&
                    (video.tag.some((tag) => tag._id === tag_key))
                ) { return true }
                return false
            })) { return true }
        return false
    }
    const isRegionInVideo = (region_key, videos) => {
        if (videos.some(
            (video) => {
                if ((video.region ? true : false) &&
                    (video.region.some((region) => region._id === region_key))
                ) { return true }
                return false
            })) { return true }
        return false
    }

    let videos_out = Object.keys(all_data.videos)
        .map((key) => all_data.videos[key])
    let tags_out = Object.keys(all_data.tags)
        // .filter((key) => all_data.tags[key]._videos.length > 1)
        .filter((key) => all_data.tags[key]._videos.length > 1)
        .map((key) => all_data.tags[key])
    let regions_out = Object.keys(all_data.regions)
        .filter((key) => all_data.regions[key]._videos.length > 1)
        // .filter((key) => isRegionInVideo(key, videos_out))
        .map((key) => all_data.regions[key])
    let persons_out = Object.keys(all_data.persons)
        .filter((key) => all_data.persons[key]._videos.length > 1)
        .map((key) => all_data.persons[key])

    fs.writeFileSync(
        VIDEO_DATA_YAML,
        yaml.safeDump(videos_out, { indent: 4, lineWidth: 999999999, noRefs: true })
    )
    fs.writeFileSync(
        TAG_DATA_YAML,
        yaml.safeDump(tags_out, { indent: 4, lineWidth: 999999999, noRefs: true })
    )
    fs.writeFileSync(
        REGION_DATA_YAML,
        yaml.safeDump(regions_out, { indent: 4, lineWidth: 999999999, noRefs: true })
    )
    fs.writeFileSync(
        PERSON_DATA_YAML,
        yaml.safeDump(persons_out, { indent: 4, lineWidth: 999999999, noRefs: true })
    )
    // fs.writeFileSync(
    //     HIERARCHY_DATA_YAML,
    //     yaml.safeDump({
    //         'regions': all_data.regions.tree,
    //         'tags': all_data.tags.tree,
    //         // 'persons': all_data.persons.tree,
    //     }, { indent: 4, lineWidth: 999999999, noRefs: true })
    // )
    console.log('ready')
})
