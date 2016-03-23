var router = require('express').Router()

var entu   = require('../helpers/entu')



// Show signin page
router.get('/', function(req, res) {
    res.render('signin/signin', {
        error: req.query.e
    })
})



// Get user session
router.get('/done', function(req, res, next) {
    if(!req.signedCookies.auth_url || !req.signedCookies.auth_state) {
        res.redirect('/signin')
        return
    }

    entu.getUserSession({
        auth_url: req.signedCookies.auth_url,
        state: req.signedCookies.auth_state
    }, function(error, user) {
        if(error) return next(error)

        res.clearCookie('auth_url')
        res.clearCookie('auth_state')
        res.cookie('auth_id', user.id, {signed:true, maxAge:1000*60*60*24*14})
        res.cookie('auth_token', user.token, {signed:true, maxAge:1000*60*60*24*14})

        entu.getEntity({
            id: user.id,
            auth_id: user.id,
            auth_token: user.token
        }, function(error, profile) {
            if(error) return next(error)

            var url = req.signedCookies.redirect_url || '/'

            console.log(url);

            res.clearCookie('redirect_url')
            res.redirect('/' + url)
        })
    })
})



// Sign out
router.get('/exit', function(req, res) {
    res.clearCookie('auth_url')
    res.clearCookie('auth_state')
    res.clearCookie('auth_id')
    res.clearCookie('auth_token')

    res.redirect('/')
})



// Sign in with given provider
router.get('/:provider', function(req, res, next) {
    if(!req.params.provider) res.redirect('/signin')

    res.clearCookie('auth_url')
    res.clearCookie('auth_state')
    res.clearCookie('auth_id')
    res.clearCookie('auth_token')

    entu.getSigninUrl({
        redirect_url: req.protocol + '://' + req.hostname + '/signin/done',
        provider: req.params.provider
    }, function(error, data) {
        if(error) return next(error)

        res.cookie('auth_url', data.auth_url, {signed:true, maxAge:1000*60*10})
        res.cookie('auth_state', data.state, {signed:true, maxAge:1000*60*10})
        res.redirect(data.auth_url + '/' + req.params.provider)
    })
})



module.exports = router
