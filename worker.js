if(process.env.NEW_RELIC_LICENSE_KEY) { require('newrelic') }

var bparser  = require('body-parser')
var cparser  = require('cookie-parser')
var express  = require('express')
var path     = require('path')
var raven    = require('raven')
var random   = require('randomstring')

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
app.use(cparser())

// parse POST requests
app.use(bparser.json())
app.use(bparser.urlencoded({extended: true}))

// routes mapping
app.use('/', require('./routes/index'))
app.use('/video', require('./routes/video'))
app.use('/user', require('./routes/user'))

// logs to getsentry.com - error
if(APP_SENTRY) {
    app.use(raven.middleware.express.errorHandler(ravenClient))
}

// show error
app.use(function(err, req, res) {
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
