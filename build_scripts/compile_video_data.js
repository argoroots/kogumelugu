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



const arr2objAll = (callback) => {

    const arr2obj = (arr, is_hierarchical, callback) => {
        let obj = {}

        async.each(arr, (item, callback) => {
            obj[item._id] = item
            obj[item._id]._anchestors = []
            async.setImmediate(() => callback(null))
        }, (err) => {
            if (err) { return callback(err) }

            if (is_hierarchical) {
                let id_tree = {}

                ensureItemInTree = (item) => {
                    if (item === undefined) { return false }
                    if (item._id in id_tree) { return true }
                    let is_root = undefined
                    if (item._parent === undefined) {
                        is_root = true
                    } else if (item._parent in obj) {
                        is_root = false
                    } else if (Array.isArray(item._parent)) {
                        is_root = !item._parent.some((element) => element in obj)
                    } else {
                        is_root = true
                    }
                    id_tree[item._id] = {
                        _id: item._id,
                        _is_root: is_root,
                        _childs: []
                    }
                    return true
                }

                async.forEachOf(obj, (item, key, callback) => {
                    ensureItemInTree(item)
                    if (id_tree[item._id]._is_root) {
                        async.setImmediate(() => callback(null))
                        return
                    }
                    if (Array.isArray(item._parent)) {
                        item._parent.forEach((element) => {
                            if (ensureItemInTree(obj[element])) {
                                id_tree[element]._childs.push(id_tree[item._id])
                            }
                        })
                    } else {
                        ensureItemInTree(obj[item._parent])
                        id_tree[item._parent]._childs.push(id_tree[item._id])
                    }
                    async.setImmediate(() => callback(null))
                }, function (err) {
                    // console.log('2 HHHHH')
                    if (err) { return callback(err) }

                    Object.keys(obj).forEach((key) => {
                        delete(obj[key]._childs)
                    })

                    // Add anchestors
                    propagateAnchestors = (parent_id) => {
                        id_tree[parent_id]._childs.forEach((child) => {
                            let child_id = child._id
                            // console.log('child: ', child_id, obj[child_id])
                            obj[parent_id]._anchestors.forEach((anch_id) => {
                                obj[child_id]._anchestors.push(anch_id)
                            })
                            obj[child_id]._anchestors.push(parent_id)
                            propagateAnchestors(child_id)
                        })
                    }
                    Object.keys(id_tree).forEach((key) => {
                        if (id_tree[key]._is_root) {
                            propagateAnchestors(key)
                        }
                    })

                    let tree = Object.keys(id_tree)
                        .filter((key) => id_tree[key]._is_root)
                        .map((key) => id_tree[key])
                    callback(null, { flat: obj, tree: tree })
                })
            } else {
                callback(null, {flat: obj})
            }
        })
    }

    async.parallel({
        regions: (callback) => {    // tree
            arr2obj(regions_arr, true, callback)
        },
        tcregions: (callback) => {
            arr2obj(tcregions_arr, false, callback)
        },
        videos: (callback) => {
            arr2obj(videos_arr, false, callback)
        },
        persons: (callback) => {
            arr2obj(persons_arr, false, callback)
        },
        tags: (callback) => {       // tree
            arr2obj(tags_arr, true, callback)
        },
        tctags: (callback) => {
            arr2obj(tctags_arr, false, callback)
        },
        categories: (callback) => {
            arr2obj(categories_arr, false, callback)
        },
        languages: (callback) => {
            arr2obj(languages_arr, false, callback)
        }
    }, (err, all_data) => {
        if (err) { callback(err) }
        fs.writeFileSync(
            HIERARCHY_DATA_YAML + '1.yaml',
            yaml.safeDump(all_data, { indent: 4, lineWidth: 999999999, noRefs: true })
        )
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
                    async.forEachOf(all_data.videos.flat, (video, key, callback) => {
                        video._persons = []
                        video._regions = []
                        video._tags = []
                        if (video.storyteller && !Array.isArray(video.storyteller)) {
                            video.storyteller = [video.storyteller]
                        }
                        if (video.author && !Array.isArray(video.author)) {
                            video.author = [video.author]
                        }
                        callback(null)
                    }, (err) => {
                        if (err) { return callback(err) }
                        callback(null)
                    })
                },
                (callback) => { // init _videos for tag
                    async.forEachOf(all_data.tags.flat, (tag, key, callback) => {
                        tag._videos = []
                        callback(null)
                    }, (err) => {
                        if (err) { return callback(err) }
                        callback(null)
                    })
                },
                (callback) => { // init _videos for region
                    async.forEachOf(all_data.regions.flat, (region, key, callback) => {
                        region._videos = []
                        callback(null)
                    }, (err) => {
                        if (err) { return callback(err) }
                        callback(null)
                    })
                },
                (callback) => { // init _videos for person
                    async.forEachOf(all_data.persons.flat, (person, key, callback) => {
                        person._videos = []
                        callback(null)
                    }, (err) => {
                        if (err) { return callback(err) }
                        callback(null)
                    })
                }
            ], (err) => {
                if (err) { return callback(err) }
                fs.writeFileSync(
                    HIERARCHY_DATA_YAML + '2.yaml',
                    yaml.safeDump(all_data, { indent: 4, lineWidth: 999999999, noRefs: true })
                )
                async.setImmediate(() => callback(null))
            })
        }
        const attach2parent = (childs, parents, all_data_of_type, type_name, callback) => {
            async.each(childs, (child, callback) => {
                // console.log(require('util').inspect(child, { depth: null }));
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
                if (parents[child._parent] === undefined) {
                    async.setImmediate(() => callback(null))
                    return
                }
                let parent = parents[child._parent]
                let new_field = all_data_of_type[child[type_name]]
                if (child.time !== undefined) {
                    new_field.time = child.time
                }
                if (parent[type_name] === undefined) {
                    parent[type_name] = []
                }
                parent[type_name].push(new_field)
                return callback(null)
            }, (err) => {
                if (err) {
                    async.setImmediate(() => callback(err))
                    return
                }
                async.setImmediate(() => callback(null))
            })
        }
        const enrichTree = (flat, tree, callback) => {
            async.each(tree, (node, callback) => {
                let flatNode = flat[node._id]
                if (flatNode === undefined) {
                    async.setImmediate(() => callback(null))
                    return
                }
                node.name_et = flatNode.name_et
                node.name_en = flatNode.name_en
                node.name_ru = flatNode.name_ru

                if (node._childs.length === 0) {
                    callback(null)
                } else {
                    enrichTree(flat, node._childs, callback)
                }
            }, (err) => {
                if (err) { return callback(err) }
                return callback(null)
            })
        }
        const personsAndVideos = (videos, persons, callback) => {
            async.each(videos, (video, callback) => {
                if (video.storyteller) {
                    video.storyteller.forEach((_id) => {
                        video._persons.push({
                            _id: _id,
                            forename: persons[_id].forename || '-',
                            surname: persons[_id].surname || '-'
                        })
                        persons[_id].type = 'storyteller'
                        persons[_id]._videos.push({
                            _id: video._id,
                            title_et: video.title_et || '-',
                            title_en: video.title_en || '-',
                            title_ru: video.title_ru || '-'
                        })
                    })
                }
                if (video.author) {
                    video.author.forEach((_id) => {
                        video._persons.push({
                            _id: _id,
                            forename: persons[_id].forename || '-',
                            surname: persons[_id].surname || '-'
                        })
                        persons[_id].type = 'author'
                        persons[_id]._videos.push({
                            _id: video._id,
                            title_et: video.title_et || '-',
                            title_en: video.title_en || '-',
                            title_ru: video.title_ru || '-'
                        })
                    })
                }
                async.setImmediate(() => callback(null))
            }, (err) => {
                if (err) { return callback(err) }
                return callback(null)
            })
        }
        const tagsAndVideos = (videos, tags, callback) => {
            async.each(videos, (video, callback) => {
                if (video.tag) {
                    video.tag.forEach((_tag) => {
                        let _id = _tag._id
                        // console.log(require('util').inspect(_id, { depth: null }));
                        video._tags.push({
                            _id: _id,
                            name_et: tags[_id].name_et || '-',
                            name_en: tags[_id].name_en || '-',
                            name_ru: tags[_id].name_ru || '-'
                        })
                        tags[_id]._videos.push({
                            _id: video._id,
                            title_et: video.title_et || '-',
                            title_en: video.title_en || '-',
                            title_ru: video.title_ru || '-'
                        })
                    })
                }
                async.setImmediate(() => callback(null))
            }, (err) => {
                if (err) { return callback(err) }
                return callback(null)
            })
        }
        const regionsAndVideos = (videos, regions, callback) => {
            async.each(videos, (video, callback) => {
                if (video.region) {
                    video.region.forEach((_region) => {
                        let _id = _region._id
                        video._regions.push({
                            _id: _id,
                            name_et: regions[_id].name_et || '-',
                            name_en: regions[_id].name_en || '-',
                            name_ru: regions[_id].name_ru || '-'
                        })
                        regions[_id]._videos.push({
                            _id: video._id,
                            title_et: video.title_et || '-',
                            title_en: video.title_en || '-',
                            title_ru: video.title_ru || '-'
                        })
                    })
                }
                async.setImmediate(() => callback(null))
            }, (err) => {
                if (err) { return callback(err) }
                return callback(null)
            })
        }

        async.series({
            zero: (callback) => initialize(all_data, callback),
            one: (callback) => attach2parent(
                all_data.tcregions.flat, // childs
                all_data.videos.flat,    // parents
                all_data.regions.flat,   // all_data_of_type
                'region', callback),     // type_name
            two: (callback) => attach2parent(
                all_data.tctags.flat,    // childs
                all_data.videos.flat,    // parents
                all_data.tags.flat,      // all_data_of_type
                'tag', callback),        // type_name
            // three: (callback) => attach2parent(
            //     all_data.tags.flat,      // childs
            //     all_data.tags.flat,      // parents
            //     all_data.tags.flat,      // all_data_of_type
            //     'tag', callback),        // type_name
            PnV: (callback) => personsAndVideos(
                all_data.videos.flat,
                all_data.persons.flat,
                callback),
            TnV: (callback) => tagsAndVideos(
                all_data.videos.flat,
                all_data.tags.flat,
                callback),
            RnV: (callback) => regionsAndVideos(
                all_data.videos.flat,
                all_data.regions.flat,
                callback),
            htags: (callback) => enrichTree(
                all_data.tags.flat,      // flat
                all_data.tags.tree,      // tree
                callback),
            all_data: (callback) => callback(null, all_data)
        }, (err, all_data) => { // just pass all_data
            if (err) { return callback(err) }
            callback(null, all_data.all_data)
        })
    },
    (all_data, callback) => { // do more manipulation on all_data
        fs.writeFileSync(
            HIERARCHY_DATA_YAML + '3.yaml',
            yaml.safeDump(all_data, { indent: 4, lineWidth: 999999999, noRefs: true })
        )
        callback(null, all_data)
    }
], (err, all_data) => {
    if (err) { throw err }
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

    let videos_out = Object.keys(all_data.videos.flat)
        .map((key) => all_data.videos.flat[key])
    let tags_out = Object.keys(all_data.tags.flat)
        // .filter((key) => all_data.tags.flat[key]._videos.length > 1)
        .filter((key) => isTagInVideo(key, videos_out))
        .map((key) => all_data.tags.flat[key])
    let regions_out = Object.keys(all_data.regions.flat)
        .filter((key) => all_data.regions.flat[key]._videos.length > 1)
        // .filter((key) => isRegionInVideo(key, videos_out))
        .map((key) => all_data.regions.flat[key])
    let persons_out = Object.keys(all_data.persons.flat)
        .filter((key) => all_data.persons.flat[key]._videos.length > 1)
        .map((key) => all_data.persons.flat[key])

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
    fs.writeFileSync(
        HIERARCHY_DATA_YAML,
        yaml.safeDump({
            'regions': all_data.regions.tree,
            'tags': all_data.tags.tree,
            // 'persons': all_data.persons.tree,
        }, { indent: 4, lineWidth: 999999999, noRefs: true })
    )
    console.log('ready')
})
