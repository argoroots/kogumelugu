$(function () {
    var initMap = function () {
        if($('#map').length === 0) {
            return
        }

        var ibOptions = {
            disableAutoPan: false,
            maxWidth: 0,
            pixelOffset: new google.maps.Size(-160, 10),
            zIndex: null,
            boxStyle: {
                width: '320px',
                height: '80px'
            },
            closeBoxURL : '',
            infoBoxClearance: new google.maps.Size(1, 1),
            isHidden: false,
            pane: 'floatPane',
            enableEventPropagation: false
        }

        var markers = []
        var infoboxes = []

        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 3,
            center: {
                lat: 53.1744575,
                lng: 50.2548807
            }
        })

        var oms = new OverlappingMarkerSpiderfier(map, {
            markersWontMove: true,
            markersWontHide: true,
            basicFormatEvents: true,
            keepSpiderfied: true
        })

        $('#map-items > .map-item').each(function () {
            var marker = new google.maps.Marker({
                position: {
                    lat: Number($(this).data('lat')),
                    lng: Number($(this).data('lng'))
                },
                map: map,
                icon: {
                    url: '/assets/images/map/map-marker.svg',
                    size: new google.maps.Size(24, 36)
                }
            })

            var el = $('<div/>', {
                class: 'map-popup'
            })

            var elLink = $('<a/>', {
                href: $(this).data('path'),
            }).appendTo(el)

            var elImg = $('<img />', {
                src: $(this).data('img'),
                alt: $(this).data('title') + ' - ' + $(this).data('subtitle')
            }).appendTo(elLink)

            var elTextWrap = $('<div/>', {
                class: 'text'
            }).appendTo(elLink)

            var elTitleWrap = $('<h3/>').appendTo(elTextWrap)

            var elTitle = $('<span/>', {
                text: $(this).data('title')
            }).appendTo(elTitleWrap)

            var elText = $('<p/>', {
                text: $(this).data('subtitle')
            }).appendTo(elTextWrap)

            var ib = new InfoBox(ibOptions)
            ib.setContent(el.get(0))

            if (!hideMapLabels) {
                google.maps.event.addListener(marker, 'spider_click', function () {
                    closeInfoboxes()
                    ib.open(map, this)
                    map.setCenter(this.getPosition())
                })
            }

            markers.push(marker)
            infoboxes.push(ib)
            oms.addMarker(marker)
        })

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
        })

        google.maps.event.addListener(markerCluster, 'clusterclick', function (cluster) {
            google.maps.event.addListener(map, 'zoom_changed', function () {
            if (map.getZoom() > 15) {
                    map.setZoom(15)
                    google.maps.event.clearListeners(map, 'zoom_changed')
                }
            })
        })

        map.addListener('click', function () {
            closeInfoboxes()
        })

        function closeInfoboxes() {
            infoboxes.forEach( function (element, index) {
                element.close()
            })
        }
    }
    initMap()

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
