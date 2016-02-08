var async    = require('async')
var crypto   = require('crypto')
var md       = require('marked')
var op       = require('object-path')
var random   = require('randomstring')
var request  = require('request')
var sanitize = require('sanitize-html')



var signData = function(data) {
    data = data || {}

    if(!APP_ENTU_USER || !APP_ENTU_KEY) return data

    var conditions = []
    for(k in data) {
        conditions.push({k: data[k]})
    }

    var expiration = new Date()
    expiration.setMinutes(expiration.getMinutes() + 10)

    data.user = APP_ENTU_USER
    data.policy = new Buffer(JSON.stringify({expiration: expiration.toISOString(), conditions: conditions})).toString('base64')
    data.signature = crypto.createHmac('sha1', APP_ENTU_KEY).update(data.policy).digest('base64')

    return data
}



//Get entity from Entu
exports.getEntity = getEntity = function(params, callback) {
    if(params.auth_id && params.auth_token) {
        var headers = {'X-Auth-UserId': params.auth_id, 'X-Auth-Token': params.auth_token}
        var qs = {}
    } else {
        var headers = {}
        var qs = signData()
    }

    var preparedUrl = APP_ENTU_URL + '/entity-' + params.id
    log.debug('Try to execute URL ' + preparedUrl)
    request.get({url: preparedUrl, headers: headers, qs: qs, strictSSL: true, json: true, timeout: 60000}, function(error, response, body) {
        if(error) return callback(error)
        if(response.statusCode !== 200 || !body.result) return callback(new Error(op.get(body, 'error', body)))

        var properties = op.get(body, 'result.properties', {})
        var entity = {
            _id: op.get(body, 'result.id', null),
            _changed: op.get(body, 'result.changed', null) || op.get(body, 'result.created', null),
            _picture: APP_ENTU_URL + '/entity-' + op.get(body, 'result.id', null) + '/picture'
        }
        for(var p in properties) {
            if(op.has(properties, [p, 'values'])) {
                for(var v in op.get(properties, [p, 'values'])) {
                    if(op.get(properties, [p, 'datatype']) === 'file') {
                        op.push(entity, p, {
                            id: op.get(properties, [p, 'values', v, 'id']),
                            value: sanitize(op.get(properties, [p, 'values', v, 'value'])),
                            file: APP_ENTU_URL + '/file-' + op.get(properties, [p, 'values', v, 'db_value'])
                        })
                    } else if(op.get(properties, [p, 'datatype']) === 'text') {
                        op.push(entity, p, {
                            id: op.get(properties, [p, 'values', v, 'id']),
                            value: sanitize(op.get(properties, [p, 'values', v, 'value'])),
                            md: md(sanitize(op.get(properties, [p, 'values', v, 'db_value'])))
                        })
                    } else if(op.get(properties, [p, 'datatype']) === 'reference') {
                        op.push(entity, p, {
                            id: op.get(properties, [p, 'values', v, 'id']),
                            value: sanitize(op.get(properties, [p, 'values', v, 'value'])),
                            reference: op.get(properties, [p, 'values', v, 'db_value'])
                        })
                    } else {
                        op.push(entity, p, {
                            id: op.get(properties, [p, 'values', v, 'id']),
                            value: sanitize(op.get(properties, [p, 'values', v, 'value'])),
                        })
                    }
                }
                if(op.get(properties, [p, 'multiplicity']) === 1) op.set(entity, p, op.get(entity, [p, 0]))
            }
        }

        callback(null, op(entity))
    })
}



//Get entities by parent, definition or query
exports.getEntities = function(params, callback) {
    var headers = {}
    var qs = {}
    if(params.definition) qs.definition = params.definition
    if(params.query) qs.query = params.query

    if(params.auth_id && params.auth_token) {
        var headers = {'X-Auth-UserId': params.auth_id, 'X-Auth-Token': params.auth_token}
    } else {
        var qs = signData(qs)
    }

    var url = params.parentEntityId ? '/entity-' + params.parentEntityId + '/childs' : '/entity'
    var loop = params.parentEntityId ? ['result', params.definition, 'entities'] : 'result'

    var preparedUrl = APP_ENTU_URL + url
    log.debug('Try to execute URL ' + preparedUrl)
    request.get({url: preparedUrl, headers: headers, qs: qs, strictSSL: true, json: true, timeout: 60000}, function(error, response, body) {
        if(error) return callback(error)
        if(response.statusCode !== 200 || !body.result) return callback(new Error(op.get(body, 'error', body)))

        var entities = []
        async.each(op.get(body, loop, []), function(e, callback) {
            if(params.fullObject === true) {
                getEntity({
                    id: e.id,
                    auth_id: params.auth_id,
                    auth_token: params.auth_token
                }, function(error, entity) {
                    if(error) return callback(error)

                    entities.push(entity)
                    callback()
                })
            } else {
                entities.push(op(e))
                callback()
            }
        }, function(error) {
            if(error) return callback(error)

            callback(null, entities)
        })
    })
}



//Add entity
exports.add = function(params, callback) {
    var data = {
        definition: params.definition
    }

    for(p in params.properties) {
        data[params.definition + '-' + p] = params.properties[p]
    }

    if(params.auth_id && params.auth_token) {
        var headers = {'X-Auth-UserId': params.auth_id, 'X-Auth-Token': params.auth_token}
        var qb = data
    } else {
        var headers = {}
        var qb =signData(data)
    }

    var preparedUrl = APP_ENTU_URL + '/entity-' + params.parentEntityId
    log.debug('Try to execute URL ' + preparedUrl)
    request.post({url: preparedUrl, headers: headers, body: qb, strictSSL: true, json: true, timeout: 60000}, function(error, response, body) {
        if(error) return callback(error)
        if(response.statusCode !== 201 || !body.result) return callback(new Error(op.get(body, 'error', body)))

        callback(null, op.get(body, 'result.id', null))
    })
}



//Edit entity
exports.edit = function(params, callback) {
    var property = params.definition + '-' + op.get(params.data, 'property')
    var body = {}
    body[op.get(params.data, 'id') ? property + '.' + op.get(params.data, 'id') : property] = op.get(params.data, 'value', '')

    if(params.auth_id && params.auth_token) {
        var headers = {'X-Auth-UserId': params.auth_id, 'X-Auth-Token': params.auth_token}
        var qb = body
    } else {
        var headers = {}
        var qb = signData(body)
    }

    var preparedUrl = APP_ENTU_URL + '/entity-' + params.id
    log.debug('Try to execute URL ' + preparedUrl)
    request.put({url: preparedUrl, headers: headers, body: qb, strictSSL: true, json: true, timeout: 60000}, function(error, response, body) {
        if(error) return callback(error)
        if(response.statusCode !== 201 || !body.result) return callback(new Error(op.get(body, 'error', body)))

        callback(null, op.get(body, 'result.properties.' + property + '.0', null))
    })
}



//Set file from url
exports.setFileFromUrl = function(params, callback) {
    var property = params.definition + '-' + params.property
    var body = {
        entity: params.id,
        property: property,
        url: params.url,
        download: true
    }

    if(params.auth_id && params.auth_token) {
        var headers = {'X-Auth-UserId': params.auth_id, 'X-Auth-Token': params.auth_token}
        var qb = body
    } else {
        var headers = {}
        var qb = signData(body)
    }

    var preparedUrl = APP_ENTU_URL + '/file/url'
    log.debug('Try to execute URL ' + preparedUrl)
    request.post({url: preparedUrl, headers: headers, body: qb, strictSSL: true, json: true, timeout: 60000}, function(error, response, body) {
        if(error) return callback(error)
        if(response.statusCode !== 200 || !body.result) return callback(new Error(op.get(body, 'error', body)))

        callback(null, op.get(body, 'result.properties.' + property + '.0', null))
    })
}



//Set entity rights
exports.rights = function(params, callback) {
    var body = {
        entity: params.personId,
        right: params.right
    }
    if(params.auth_id && params.auth_token) {
        var headers = {'X-Auth-UserId': params.auth_id, 'X-Auth-Token': params.auth_token}
        var qb = body
    } else {
        var headers = {}
        var qb = signData(body)
    }

    var preparedUrl = APP_ENTU_URL + '/entity-' + params.id + '/rights'
    log.debug('Try to execute URL ' + preparedUrl)
    request.post({url: preparedUrl, headers: headers, body: qb, strictSSL: true, json: true, timeout: 60000}, function(error, response, body) {
        if(error) return callback(error)
        if(response.statusCode !== 200) return callback(new Error(op.get(body, 'error', body)))

        callback(null, params.id)
    })
}



//Add file
exports.file = function(params, callback) {
    if(params.auth_id && params.auth_token) {
        var headers = {'X-Auth-UserId': params.auth_id, 'X-Auth-Token': params.auth_token}
        var qb = params
    } else {
        var headers = {}
        var qb = signData(params)
    }

    var preparedUrl = APP_ENTU_URL + '/file/s3'
    log.debug('Try to execute URL ' + preparedUrl)
    request.post({url: preparedUrl, headers: headers, body: qb, strictSSL: true, json: true, timeout: 60000}, function(error, response, body) {
        if(error) return callback(error)
        if(response.statusCode !== 200 || !body.result) return callback(new Error(op.get(body, 'error', body)))

        callback(null, op.get(body, 'result', null))
    })
}



//Send message
exports.message = function(params, callback) {
    var body = {
        to: params.to,
        subject: params.subject,
        message: params.message,
        html: true,
        tag: params.tag
    }
    if(params.auth_id && params.auth_token) {
        var headers = {'X-Auth-UserId': params.auth_id, 'X-Auth-Token': params.auth_token}
        var qb = body
    } else {
        var headers = {}
        var qb = signData(body)
    }

    var preparedUrl = APP_ENTU_URL + '/email'
    log.debug('Try to execute URL ' + preparedUrl)
    request.post({url: preparedUrl, headers: headers, body: qb, strictSSL: true, json: true, timeout: 60000}, function(error, response, body) {
        if(error) return callback(error)
        if(response.statusCode !== 200) return callback(new Error(op.get(body, 'error', body)))

        callback(null, body)
    })
}



//Get signin url
exports.getSigninUrl = function(params, callback) {
    var qb = {
        state: random.generate(16),
        redirect_url: params.redirect_url,
        provider: params.provider
    }
    var preparedUrl = APP_ENTU_URL + '/user/auth'
    log.debug('Try to execute URL ' + preparedUrl)
    request.post({url: preparedUrl, body: qb, strictSSL: true, json: true, timeout: 60000}, function(error, response, body) {
        if(error) return callback(error)
        if(response.statusCode !== 200) return callback(new Error(op.get(body, 'error', body)))

        var data = {}
        data.state = op.get(body, 'result.state', null)
        data.auth_url = op.get(body, 'result.auth_url', null)

        callback(null, data)
    })
}



//Get user session
exports.getUserSession = function(params, callback) {
    var qb = {
        'state': params.state
    }
    var preparedUrl = params.auth_url
    log.debug('Try to execute URL ' + preparedUrl)
    request.post({url: preparedUrl, body: qb, strictSSL: true, json: true, timeout: 60000}, function(error, response, body) {
        if(error) return callback(error)
        if(response.statusCode !== 200 || !body.result) return callback(new Error(op.get(body, 'error', body)))

        var user = {}
        user.id = op.get(body, 'result.user.id', null)
        user.token = op.get(body, 'result.user.session_key', null)

        callback(null, user)
    })
}



//Get user
exports.getUser = function(params, callback) {
    if(params.auth_id && params.auth_token) {
        var headers = {'X-Auth-UserId': params.auth_id, 'X-Auth-Token': params.auth_token}
    } else {
        var headers = {}
    }

    var preparedUrl = APP_ENTU_URL + '/user'
    log.debug('Try to execute URL ' + preparedUrl)
    request.get({url: preparedUrl, headers: headers, strictSSL: true, json: true, timeout: 60000}, function(error, response, body) {
        if(error) return callback(error)
        if(response.statusCode !== 200 || !body.result) return callback(new Error(op.get(body, 'error', body)))

        callback(null, op.get(body, 'result', null))
    })
}
