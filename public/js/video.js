function moveScroller() {
    var move = function() {
        var st = $(window).scrollTop();
        var ot = $("#videoPage").height();
        var s = $("#galleryNav");
        var sub = $(".subnav");
        if (st > ot) {
            s.addClass('navbar-fixed-top');
            s.addClass('shrink');
            sub.addClass('fixed-top');
            $('#galleryPush').css('display', 'block');
        } else {
            if (st <= ot) {
                s.removeClass('navbar-fixed-top');
                s.removeClass('shrink');
                sub.removeClass('fixed-top');
                $('#galleryPush').css('display', 'none');
            }
        }
    };
    $(window).scroll(move);
    move();
}
$(function() {
    // moveScroller();
});

$(document).ready(function() {
    // Count class elements
    var primary = "primary";
    var secondary = "secondary";
    var tertiary = "tertiary";
    var quatenary = "quatenary";
    var timecode = "timecode";
    var primaryKeywords = $('.primary');
    var secondaryKeywords = $('.secondary');
    var tertiaryKeywords = $('.tertiary');
    var quatenaryKeywords = $('.quatenary');
    var timeCodes = $('.timecode');

    function hideExcessive(name, type) {
        var i = 0;
        if (name == "timecode") {
            $('<a href="javascript:void(0)" class="' + name + 'ShowAll"><li class="' + name + ' showall">Näita kõiki järjehoidjaid</li></a>').insertAfter(type.last());
        } else {
            $('<a href="javascript:void(0)" class="' + name + 'ShowAll"><li class="' + name + ' showall">+' + (type.length - 3) + '</li></a>').insertAfter(type.last());
        }
        type.each(function(index, element) {
            if (i > 2 && i < type.length) {
                $(this).addClass('hidden');
            }
            i += 1;
        });

        $('.' + name + 'ShowAll').click(function() {
            type.removeClass('hidden');
            $(this).addClass('hidden');
        });
    }

    if (primaryKeywords.length > 3) {
        hideExcessive(primary, primaryKeywords)
    }
    if (secondaryKeywords.length > 3) {
        hideExcessive(secondary, secondaryKeywords)
    }
    if (tertiaryKeywords.length > 3) {
        hideExcessive(tertiary, tertiaryKeywords)
    }
    if (quatenaryKeywords.length > 3) {
        hideExcessive(quatenary, quatenaryKeywords)
    }
    if (timeCodes.length > 3){
        hideExcessive(time, timecode)
    }
});

(function($) {
  window.fnames = new Array();
  window.ftypes = new Array();
  fnames[1]='FNAME';
  ftypes[1]='text';
  fnames[2]='LNAME';
  ftypes[2]='text';
  fnames[0]='EMAIL';
  ftypes[0]='email';
  fnames[5]='MMERGE5';
  ftypes[5]='number';
  fnames[7]='MMERGE7';
  ftypes[7]='text';
}(jQuery));
var $mcj = jQuery.noConflict(true);
