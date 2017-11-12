function initMap(data) {
  var items;
  var ibOptions = {
    disableAutoPan: false,
    maxWidth: 0,
    pixelOffset: new google.maps.Size(-160, 10),
    zIndex: null,
    boxStyle: {
      width: "320px",
      height: "80px"
    },
    closeBoxURL : "",
    infoBoxClearance: new google.maps.Size(1, 1),
    isHidden: false,
    pane: "floatPane",
    enableEventPropagation: false
  };

  var markers = [];
  var infoboxes = [];

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3,
    center: {lat: 53.1744575, lng: 50.2548807}
  });

  if (data.length > 0) {
    items = data;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      for (var y = 0; y < item.region.length; y++) {
        var region  = item.region[y],
            ELlng   = Number(region.lng)
            ELlat   = Number(region.lat),
            marker  = new google.maps.Marker({
              position: {lat: ELlat, lng: ELlng},
              map: map,
              icon: '/assets/images/map/map-marker.svg'
            });

        var el = $('<div/>', {
          class: 'map-popup'
        });

        var elLink = $('<a/>', {
            href: './' + item.path,
        }).appendTo(el);

        var elImg = $('<img />', {
            src: '/assets/images/' + item.path + '.jpg',
            alt: item.title_et + ' - ' + item.subtitle_et
        }).appendTo(elLink);

        var elTextWrap = $('<div/>', {
          class: 'text'
        }).appendTo(elLink);

        var elTitleWrap = $('<h3/>').appendTo(elTextWrap);

        var elTitle = $('<span/>', {
            text: item.title_et
        }).appendTo(elTitleWrap);

        var elText = $('<p/>', {
            text: item.subtitle_et
        }).appendTo(elTextWrap);

        const ib = new InfoBox(ibOptions);
        ib.setContent(el.get(0));

        google.maps.event.addListener(marker, 'click', function () {
          closeInfoboxes();
          ib.open(map,this);
          map.setCenter(this.getPosition());
        });

        markers.push(marker);
        infoboxes.push(ib);
      }
    }
  }
  var markerCluster = new MarkerClusterer(map, markers, {
    imageExtension: 'svg',
    imagePath: '/assets/images/map/',
    maxZoom: 14,
    minimumClusterSize: 2,
    styles: [{
      url: '/assets/images/map/1.svg',
      height: 60,
      width: 60,
      anchor: [0, 0],
      textColor: '#FFFFFF',
      textSize: 14,
      fontWeight: 'bold'
    }]
  });

  map.addListener('click', function() {
    closeInfoboxes();
  });

  function closeInfoboxes() {
    infoboxes.forEach( function(element, index) {
      element.close();
    });
  }
}

function moveBG() {
  if ($(window).width() < 560) {
    var bgimg = $('.hero').attr('style');
    $('.main-post').attr('style', bgimg);
    $('.hero').removeAttr('style');
  } else {
    var bgimg = $('.main-post').attr('style');
    $('.hero').attr('style', bgimg);
    $('.main-post').removeAttr('style');
  }
}

function scrollToDiv() {
  var div = window.location.hash;
  $('html, body').animate({
      scrollTop: $(div).offset().top - $('.header').outerHeight()
  }, 200);
}

$(document).ready(function() {
  moveBG();

  if($('#map').length) {
    var xhr = $.getJSON('/assets/map.json');
    xhr.done(initMap);
  }

  $('.accordion--item > a').click(function(e) {
    e.preventDefault();
    $(this).parent().toggleClass('u-open');
  });

  $('.tabs--link').click(function() {
    var id = $(this).attr('href');
    $('.tabs--link').not(this).removeClass('u-active');
    $('.tabs--item').not(id).removeClass('u-open');
    $(this).addClass('u-active');
    $(id).addClass('u-open');
  });

  $('.menu--toggle').click(function(e) {
    e.preventDefault();
    $('body').toggleClass('menu-open');
  });

  $(window).scroll(function(event) {
    if ($(window).scrollTop() > 0) {
      $('body').addClass('header-fixed');
    } else {
      $('body').removeClass('header-fixed');
    }
  });

  if (window.location.hash) {
    scrollToDiv();
  }

  $('.main-menu a[href*="#"]').click(function(event) {
    if ( location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top - $('.header').outerHeight()
        }, 200, function() {
          var $target = $(target);
          $target.focus();
          if ($target.is(":focus")) {
            return false;
          } else {
            $target.attr('tabindex','-1');
            $target.focus();
          };
        });
      }
    }
  });


  $(window).resize(function(event) {
    moveBG();
  });

});
