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



    .controller('vidoeGallery', ['$scope', '$http', '$filter', function($scope, $http, $filter) {
        if(!$scope.sData) { $scope.sData = {} }

        $http.get('/video/json')
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

                $scope.sData.videos = $scope.sData.allVideos

            })
            .error(function(error) {
                console.log(error)
            })

        $scope.doFilter = function() {
            var query = [$scope.sData.subject, $scope.sData.region, $scope.sData.generation, $scope.sData.query].join(' ').trim().toLowerCase()
            console.log(query)

            $scope.sData.videos = $filter('multiple')($scope.sData.allVideos, query)
            console.log($scope.sData.videos.length)
            $scope.$apply()
            $('html, body').animate({ scrollTop: $('.gallery.container').offset().top - 230 }, 'slow')
        }

    }])
