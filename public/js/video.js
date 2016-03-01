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
    moveScroller();
});

$(document).ready(function() {
    // Count class elements
    var primary = "primary";
    var secondary = "secondary";
    var tertiary = "tertiary";
    var quatenary = "quatenary";
    var primaryKeywords = $('.primary');
    var secondaryKeywords = $('.secondary');
    var tertiaryKeywords = $('.tertiary');
    var quatenaryKeywords = $('.quatenary');

    function hideExcessive(name, type) {
        var i = 0;
        $('<a href="javascript:void(0)" class="' + name + 'ShowAll"><li class="' + name + ' showall">+' + (type.length - 3) + '</li></a>').insertAfter(type.last());
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
});



if (!window['YT']) {
    var YT = {
        loading: 0,
        loaded: 0
    };
}
if (!window['YTConfig']) {
    var YTConfig = {
        'host': 'http://www.youtube.com'
    };
}
if (!YT.loading) {
    YT.loading = 1;
    (function() {
        var l = [];
        YT.ready = function(f) {
            if (YT.loaded) {
                f();
            } else {
                l.push(f);
            }
        };
        window.onYTReady = function() {
            YT.loaded = 1;
            for (var i = 0; i < l.length; i++) {
                try {
                    l[i]();
                } catch (e) {}
            }
        };
        YT.setConfig = function(c) {
            for (var k in c) {
                if (c.hasOwnProperty(k)) {
                    YTConfig[k] = c[k];
                }
            }
        };
        var a = document.createElement('script');
        a.type = 'text/javascript';
        a.id = 'www-widgetapi-script';
        a.src = 'http:' + '//s.ytimg.com/yts/jsbin/www-widgetapi-vfloT07bb/www-widgetapi.js';
        a.async = true;
        var b = document.getElementsByTagName('script')[0];
        b.parentNode.insertBefore(a, b);
    })();
}



// https://developers.google.com/youtube/iframe_api_reference
// global variable for the player
var player;

// this function gets called when API is ready to use
function onYouTubePlayerAPIReady() {
    console.log("onYouTubePlayerAPIReady");
    // create the global player from the specific iframe (#video)
    player = new YT.Player('video', {
        events: {
            // call this function when player is ready to use
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    console.log("onPlayerReady");
    // bind events
    var playButton = document.getElementById("play-button");
    playButton.addEventListener("click", function() {
        player.playVideo();
        $("#play-button").hide();
        $(".playButtonArea").hide();
    });
}

// Inject YouTube API script
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var currentVideo = 'https://www.youtube.com/embed/1SPLV9sdvcQ?rel=0&amp;controls=0&amp;showinfo=0;enablejsapi=1';

function changeTime(x) {
    $('#video').attr('src', currentVideo + ";start=" + x + "&autoplay=1");
    console.log(currentVideo + ";start=" + x + "&autoplay=1");
    $("#play-button").hide();
    $(".playButtonArea").hide();
}
