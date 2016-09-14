function moveScroller() {
    var move = function() {
        var st = $(window).scrollTop();
        var ot = $("#carousel").height();
        var s = $(".navbar-default");
        if (st > ot) {
            s.addClass('navbar-fixed-top ');
            s.addClass('shrink');
        } else {
            if (st <= ot) {
                s.removeClass('navbar-fixed-top ');
                s.removeClass('shrink');
            }
        }
    };
    $(window).scroll(move);
    move();
}

$(function() {
    // moveScroller();
});

function setCustom() {
    var value = $('.customsum').val();
    $('#customsum').val(value);
}

//- $('.teema').click(function() {
//-     $(this).addClass('flip');
//- });
