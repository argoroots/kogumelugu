var parseQueryString = function( queryString ) {
    var params = {}, queries, temp, i, l

    queries = queryString.replace('?', '').split("&")

    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=')
        params[temp[0]] = temp[1]
    }

    return params
};



angular.module('kmlApp', [])



    .filter('multiple', ['filterFilter', function (filterFilter) {
        return function (items, query) {
            if (!query) return items

            var terms = query.split(/\s+/)
            var result = items
            terms.forEach(function(term) {
                result = filterFilter(result,term)
            })

            return result
        }
      }])



    .controller('vidoeGallery', ['$scope', '$http', '$filter', '$location', function($scope, $http, $filter, $location) {
        if(!$scope.sData) { $scope.sData = {} }

        var search = parseQueryString(decodeURI(window.location.search))
        $scope.sData.subject = search.subject || null
        $scope.sData.region = search.region || null
        $scope.sData.generation = search.generation || null
        $scope.sData.query = search.query || null

        $http.get('video/json')
            .success(function(videos) {
                var groupedVideos = []
                var lastWasFive = false

                $scope.sData.allVideos = videos

                $scope.sData.allVideos.sort(function() {
                    return 0.5 - Math.random()
                })

                // while(videos.length > 0) {
                //     groupedVideos.push(videos.slice(0, 3))
                //     videos.splice(0, 3)
                //
                //     if (lastWasFive) {
                //         groupedVideos.push(videos.slice(0, 2))
                //         videos.splice(0, 2)
                //     } else {
                //         groupedVideos.push(videos.slice(0, 5))
                //         videos.splice(0, 5)
                //     }
                //     lastWasFive = !lastWasFive
                // }
                //
                // $scope.sData.videos = groupedVideos

                $scope.doFilter(false)

            })
            .error(function(error) {
                console.log(error)
            })

        $scope.doFilter = function(doApply) {
            var query = [$scope.sData.subject, $scope.sData.region, $scope.sData.generation, $scope.sData.query].join(' ').trim().toLowerCase()

            $scope.sData.videos = $filter('multiple')($scope.sData.allVideos, query)

            if(doApply) { $scope.$apply() }

            $('html, body').animate({ scrollTop: $('.gallery.container').offset().top - 230 }, 'slow')
        }

        $scope.getClass = function(idx) {
            var classes = [
                ['col-md-6', 'col-sm-6', 'col-xs-12', 'video'],
                ['col-md-4', 'col-sm-4', 'col-xs-12', 'video'],
                ['col-md-4', 'col-sm-4', 'col-xs-12', 'video'],
                ['col-md-4', 'col-sm-4', 'col-xs-12', 'video'],
                ['col-md-6', 'col-sm-6', 'col-xs-12', 'video'],
                ['col-md-3', 'col-sm-3', 'col-xs-6', 'video'],
                ['col-md-3', 'col-sm-3', 'col-xs-6', 'video'],
                ['col-md-3', 'col-sm-3', 'col-xs-6', 'video'],
                ['col-md-3', 'col-sm-3', 'col-xs-6', 'video'],
                ['col-md-4', 'col-sm-4', 'col-xs-12', 'video'],
                ['col-md-4', 'col-sm-4', 'col-xs-12', 'video'],
                ['col-md-4', 'col-sm-4', 'col-xs-12', 'video'],
                ['col-md-6', 'col-sm-6', 'col-xs-12', 'video'],
            ]
            return classes[(idx + 1) % 13]
        }

    }])
