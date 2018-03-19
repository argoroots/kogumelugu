$(function () {
    $('.menu--toggle').click(function (e) {
        e.preventDefault()
        $('body').toggleClass('menu-open')
    })

    $(window).scroll(function (event) {
        if ($(window).scrollTop() > 0) {
            $('body').addClass('header-fixed')
        } else {
            $('body').removeClass('header-fixed')
        }
    })
})
