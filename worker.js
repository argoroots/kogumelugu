if(process.env.NEW_RELIC_LICENSE_KEY) { require('newrelic') }

var bparser  = require('body-parser')
var cparser  = require('cookie-parser')
var express  = require('express')
var path     = require('path')
var raven    = require('raven')

var entu     = require('./helpers/entu')



// global variables (and list of all used environment variables)
APP_VERSION        = process.env.VERSION || require('./package').version
APP_STARTED        = new Date().toISOString()
APP_PORT           = process.env.PORT || 3000
APP_COOKIE_DOMAIN  = process.env.COOKIE_DOMAIN || ''



// initialize getsentry.com client
var ravenClient = new raven.Client({
    release: APP_VERSION,
    dataCallback: function(data) {
        delete data.request.env
        return data
    }
})



// start express app
var app = express()

// get correct client IP behind nginx
app.set('trust proxy', true)

// use Jade templates
app.set('view engine', 'jade')
app.set('views', path.join(__dirname, 'views'))

// logs to getsentry.com - start
app.use(raven.middleware.express.requestHandler(ravenClient))

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
app.use(raven.middleware.express.errorHandler(ravenClient))

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
