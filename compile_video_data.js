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
                if (item === undefined) { return }
                if (item._id in id_tree) { return }
                let is_root = undefined
                if (item._parent === undefined) {
                    is_root = true
                } else if (item._parent in obj) {
                    is_root = false
                } else {
                    is_root = true
                }
                id_tree[item._id] = {
                    _id: item._id,
                    _is_root: is_root,
                    _childs: []
                }
                return
            }

            async.forEachOf(obj, (item, key, callback) => {
                ensureItemInTree(item)
                if (id_tree[item._id]._is_root) {
                    async.setImmediate(() => callback(null))
                    return
                }
                ensureItemInTree(obj[item._parent])
                id_tree[item._parent]._childs.push(id_tree[item._id])
                async.setImmediate(() => callback(null))
            }, function (err) {
                // console.log('2 HHHHH')
                if (err) { return callback(err) }

                Object.keys(obj).forEach((key) => {
                    delete(obj[key]._childs)
                })

                // Add anchestors
                propagateAnchestors = (parent_id) => {
                    // console.log('parent: ', obj[parent_id], id_tree[parent_id])
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

                callback(null, { flat: obj, tree: id_tree })
            })
        } else {
            callback(null, {flat: obj})
        }
    })
}

const attach2parent = (childs, all_data_videos, all_data_of_type, type_name, callback) => {
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

// let videos_out = []

async.parallel({
    regions: (callback) => {
        // console.log('arr2obj regions')
        arr2obj(regions_arr, true, callback)
    },
    tcregions: (callback) => {
        // console.log('arr2obj tcregions')
        arr2obj(tcregions_arr, false, callback)
    },
    videos: (callback) => {
        // console.log('arr2obj videos')
        arr2obj(videos_arr, false, callback)
    },
    persons: (callback) => {
        // console.log('arr2obj persons')
        arr2obj(persons_arr, false, callback)
    },
    tags: (callback) => {
        // console.log('arr2obj tags')
        arr2obj(tags_arr, true, callback)
    },
    tctags: (callback) => {
        // console.log('arr2obj tctags')
        arr2obj(tctags_arr, false, callback)
    },
    categories: (callback) => {
        // console.log('arr2obj categories')
        arr2obj(categories_arr, false, callback)
    },
    languages: (callback) => {
        // console.log('arr2obj languages')
        arr2obj(languages_arr, false, callback)
    }
}, (err, all_data) => {
    // console.log('arr2obj callback')
    if (err) { throw err }
    // console.log('all_data.tags.tree', all_data.tags.tree)
    async.each(all_data.videos.flat, (video, callback) => {
        // Regions
        if (video.region !== undefined) {
            video.region = video.region
            .map((_id) => {
                return all_data.regions.flat[_id]
            })
            .filter((r) => r !== undefined)
            if (video.region.length === 0) {
                delete(video.region)
            }
        }

        // Storytellers
        if (video.storyteller !== undefined) {
            video.storyteller = video.storyteller
            if (all_data.persons.flat[video.storyteller]) {
                video.storyteller = all_data.persons.flat[video.storyteller]
            }
        }

        // Authors
        if (video.author !== undefined) {
            video.author = video.author
            if (all_data.persons.flat[video.author]) {
                video.author = all_data.persons.flat[video.author]
            }
        }

        // Tags / Märksõnad
        if (video.tag !== undefined) {
            video.tag = video.tag
            .map((_id) => {
                return all_data.tags.flat[_id]
            })
            .filter((r) => r !== undefined)
            if (video.tag.length === 0) {
                delete(video.tag)
            }
        }

        // Categories
        if (video.category !== undefined) {
            video.category = video.category
            if (all_data.categories.flat[video.category]) {
                video.category = all_data.categories.flat[video.category]
            }
        }

        // Languages
        if (video.language !== undefined) {
            video.language = video.language
            if (all_data.languages.flat[video.language]) {
                video.language = all_data.languages.flat[video.language]
            }
        }

        async.setImmediate(() => callback(null))
        return
    }, (err) => {
        if (err) { return callback(err) }

        async.series([
            (callback) => attach2parent(all_data.tcregions.flat, all_data.videos.flat, all_data.regions.flat, 'region', callback),
            (callback) => attach2parent(all_data.tctags.flat, all_data.videos.flat, all_data.tags.flat, 'tag', callback),
            (callback) => attach2parent(all_data.tags.flat, all_data.tags.flat, all_data.tags.flat, 'tag', callback)
        ], (err) => {
            const isPersonInVideo = (person_key, videos) => {
                if (videos.some(
                    (video) => {
                        if ((video.author ? true : false) &&
                            (video.author._id === person_key)
                        ) {
                            all_data.persons.flat[person_key].type = 'author'
                            return true
                        }
                        if ((video.storyteller ? true : false) &&
                            (video.storyteller._id === person_key)
                        ) {
                            all_data.persons.flat[person_key].type = 'storyteller'
                            return true
                        }
                        return false
                    })) { return true }
                return false
            }
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
            if (err) { return callback(err) }
            let videos_out = Object.keys(all_data.videos.flat)
                .map((key) => all_data.videos.flat[key])
            let tags_out = Object.keys(all_data.tags.flat)
                .filter((key) => isTagInVideo(key, videos_out))
                .map((key) => all_data.tags.flat[key])
            let regions_out = Object.keys(all_data.regions.flat)
                .filter((key) => isRegionInVideo(key, videos_out))
                .map((key) => all_data.regions.flat[key])
            let persons_out = Object.keys(all_data.persons.flat)
                .filter((key) => isPersonInVideo(key, videos_out))
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
    })
})
