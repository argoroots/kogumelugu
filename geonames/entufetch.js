const fs = require('fs')
const request = require('request')
const async = require('async')


const reqWrapper = (options, callback) => {
  request(options, (error, response, body) => {
    if (error) {
      console.log(error)
      callback(error)
    }
    if (response.statusCode !== 200) {
      console.log(response.statusCode)
      callback('response ' + response.statusCode)
    }
    return callback(null, JSON.parse(body))
  })
}

const entuAuth = (key, callback) => {
  let options = {
    url: 'https://api.entu.ee/auth',
    headers: { 'Authorization': 'Bearer ' + key }
  }
  reqWrapper(options, callback)
}

const entuFetchRegions = (token, callback) => {
  let options = {
    url: 'https://api.entu.ee/entity?_type.string=person'
      //  + '&name.string.exists=true'
      //  + '&props=name'
       + '&limit=1000',
    headers: { 'Authorization': 'Bearer ' + token }
  }
  reqWrapper(options, callback)
}


module.exports = (key) => {
  async.waterfall([
    (callback) => {
      entuAuth(key, (error, response) => {
        if (error) {
          return callback(error)
        }
        return callback(null, response['kogumelugu']['token'])
      })
    },
    (token, callback) => {
      entuFetchRegions(token, (error, response) => {
        console.log(require('util').inspect(response, { depth: null }))
        return callback(null, 'bye!')
      })
    }
  ], function (err, result) {
    console.log('finito', result)
  })
}
