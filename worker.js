if(process.env.NEW_RELIC_LICENSE_KEY) { require('newrelic') }

var bparser  = require('body-parser')
var cparser  = require('cookie-parser')
var express  = require('express')
var op       = require('object-path')
var path     = require('path')
var random   = require('randomstring')
var raven    = require('raven')

var entu     = require('./helpers/entu')



// global variables (and list of all used environment variables)
APP_VERSION         = process.env.VERSION || require('./package').version
APP_STARTED         = new Date().toISOString()
APP_PORT            = process.env.PORT || 4000
APP_CACHE_DIR       = process.env.CACHEDIR || path.join(__dirname, 'cache')
APP_COOKIE_SECRET   = process.env.COOKIE_SECRET || random.generate(16)
APP_ENTU_URL        = process.env.ENTU_URL || 'https://kogumelugu.entu.ee/api2'
APP_ENTU_USER       = process.env.ENTU_USER
APP_ENTU_KEY        = process.env.ENTU_KEY
APP_SENTRY          = process.env.SENTRY_DSN
APP_DEFAULT_LOCALE  = process.env.DEFAULT_LOCALE || 'en'
APP_TIMEZONE        = process.env.TIMEZONE || 'Europe/Tallinn'
APP_VIMEO_ID        = process.env.VIMEO_ID
APP_VIMEO_SECRET    = process.env.VIMEO_SECRET
APP_VIMEO_TOKEN     = process.env.VIMEO_TOKEN
APP_LANGUAGES       = ['et', 'en']



// initialize getsentry.com client
if(APP_SENTRY) {
    var ravenClient = new raven.Client({
        release: APP_VERSION,
        dataCallback: function(data) {
            delete data.request.env
            return data
        }
    })
}



// start express app
var app = express()

// get correct client IP behind nginx
app.set('trust proxy', true)

// use Jade templates
app.set('view engine', 'jade')
app.set('views', path.join(__dirname, 'views'))

// logs to getsentry.com - start
if(APP_SENTRY) {
    app.use(raven.middleware.express.requestHandler(ravenClient))
}

//serve static files
app.use(express.static(path.join(__dirname, 'public')))

// parse Cookies
app.use(cparser(APP_COOKIE_SECRET))

// parse POST requests
app.use(bparser.json())
app.use(bparser.urlencoded({extended: true}))

// set defaults for views
app.use(function(req, res, next) {
    res.authenticate = function(e) {
        if(!res.locals.user) {
            res.cookie('redirect_url', res.locals.path, {signed:true, maxAge:1000*60*60})
            res.redirect('/' + res.locals.lang + '/signin?e=' + e)
            return false
        } else {
            return true
        }

    }

    if (APP_LANGUAGES.indexOf(req.path.split('/')[1]) === -1) {
        return res.redirect('/' + APP_LANGUAGES[0])
    } else {
        res.locals.lang = req.path.split('/')[1]
    }

    res.locals.path = req.path

    if(!req.signedCookies) next(null)
    if(req.signedCookies.auth_id && req.signedCookies.auth_token) {
        entu.getUser({
            auth_id: req.signedCookies.auth_id,
            auth_token: req.signedCookies.auth_token
        }, function(error, user) {
            if(user) {
                res.locals.user = {
                    id: parseInt(req.signedCookies.auth_id, 10),
                    token: req.signedCookies.auth_token,
                    picture: op.get(user, 'picture'),
                    lang: op.get(user, 'person.language.values.0.value', APP_DEFAULT_LOCALE)
                }
            } else {
                res.clearCookie('auth_id')
                res.clearCookie('auth_token')
            }
            next(null)
        })
    } else {
        next(null)
    }
})


// routes mapping
app.use('/:lang', require('./routes/index'))
app.use('/:lang/video', require('./routes/video'))
app.use('/:lang/signin', require('./routes/signin'))

// logs to getsentry.com - error
if(APP_SENTRY) {
    app.use(raven.middleware.express.errorHandler(ravenClient))
}

// show error
app.use(function(err, req, res, next) {
    res.send({
        error: err.message,
        version: APP_VERSION,
        started: APP_STARTED
    })

    if(err.status !== 404) { console.log(err) }
})

// start server
app.listen(APP_PORT, function() {
    console.log(new Date().toString() + ' started listening port ' + APP_PORT)
})
