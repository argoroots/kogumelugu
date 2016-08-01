var API_URL    = 'https://kogumelugu.entu.ee/api2/'
var API_USER   = 1174
var API_KEY    = 'bLePreStfUlAYLoRESPIGhtITATchUrPE'
var API_FOLDER = 1940



function cl(d) {
    console.log(d)
}



function getSignedData(user, key, data) {
    if(!user || !key) return

    var conditions = []
    for(k in data) {
        conditions.push({k: data[k]})
    }

    var expiration = new Date()
    expiration.setMinutes(expiration.getMinutes() + 10)

    data['user'] = user
    data['policy'] = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify({expiration: expiration.toISOString(), conditions: conditions})))
    data['signature'] = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(data['policy'], key))

    return data
}



var parseQueryString = function( queryString ) {
    var params = {}, queries, temp, i, l

    queries = queryString.replace('?', '').split("&")

    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=')
        params[temp[0]] = temp[1]
    }

    return params
}



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




    .controller('index', ['$scope', '$http', function($scope, $http) {
        $scope.send = {
            author: {},
            storyteller: {},
            interview: {},
        }

        $scope.doFileUpload = function(e) {
            $scope.send.file = $("input[ng-model='send.interview.file']").get(0).files[0]

            if (!$scope.send.author.email && !$scope.send.author.forename && !$scope.send.author.phone && !$scope.send.storyteller.name && !$scope.send.interview.title && !$scope.send.interview.description && !$scope.send.interview.file_description && !$scope.send.file) { return }

            $scope.send.sending = true
            async.series([
                function(callback) {
                    if (!$scope.send.author.email && !$scope.send.author.forename && !$scope.send.author.phone) { return callback(null) }
                    $http({
                            method: 'POST',
                            url: API_URL + 'entity-' + API_FOLDER,
                            data: getSignedData(API_USER, API_KEY, {
                                'definition': 'person',
                                'person-email': $scope.send.author.email,
                                'person-forename': $scope.send.author.forename,
                                'person-phone': $scope.send.author.phone,
                            })
                        })
                        .success(function(data) {
                            $scope.send.author.id = data.result.id
                            callback(null)
                        })
                        .error(function(data) {
                            callback(data.error)
                        })
                },
                function(callback) {
                    if (!$scope.send.storyteller.name) { return callback(null) }
                    $http({
                            method: 'POST',
                            url: API_URL + 'entity-' + API_FOLDER,
                            data: getSignedData(API_USER, API_KEY, {
                                'definition': 'person',
                                'person-forename': $scope.send.storyteller.name,
                            })
                        })
                        .success(function(data) {
                            $scope.send.storyteller.id = data.result.id
                            callback(null)
                        })
                        .error(function(data) {
                            callback(data.error)
                        })
                },
                function(callback) {
                    if (!$scope.send.interview.title && !$scope.send.author.id && !$scope.send.storyteller.id && !$scope.send.interview.description && !$scope.send.interview.file_description && !$scope.send.file) { return callback(null) }
                    $http({
                            method: 'POST',
                            url: API_URL + 'entity-' + API_FOLDER,
                            data: getSignedData(API_USER, API_KEY, {
                                'definition': 'interview',
                                'interview-title-et': $scope.send.interview.title,
                                'interview-author': $scope.send.author.id,
                                'interview-storyteller': $scope.send.storyteller.id,
                                'interview-description-et': $scope.send.interview.description,
                                'interview-fileDescription-et': $scope.send.interview.file_description,
                            })
                        })
                        .success(function(data) {
                            $scope.send.interview.id = data.result.id
                            callback(null)
                        })
                        .error(function(data) {
                            callback(data.error)
                        })
                },
                function(callback) {
                    if (!$scope.send.file || ! $scope.send.interview.id) { return callback(null) }
                    $http({
                            method: 'POST',
                            url: API_URL + 'file/s3',
                            data: getSignedData(API_USER, API_KEY, {
                                entity: $scope.send.interview.id,
                                property: 'interview-file',
                                filename: $scope.send.file.name,
                                filesize: $scope.send.file.size,
                                filetype: $scope.send.file.type
                            })
                        })
                        .success(function(data) {
                            $scope.send.s3 = data.result.s3
                            callback(null)
                        })
                        .error(function(data) {
                            callback(data.error)
                        })
                },
                function(callback) {
                    if (!$scope.send.interview.id) { return callback(null) }
                    $http({
                            method : 'POST',
                            url    : API_URL + 'entity-' + $scope.send.interview.id + '/rights',
                            data   : getSignedData(API_USER, API_KEY, {
                                'entity': API_USER
                            })
                        })
                        .success(function(data) {
                            callback(null)
                        })
                        .error(function(data) {
                            callback(data.error)
                        })
                },
                function(callback) {
                    if (!$scope.send.author.id) { return callback(null) }
                    $http({
                            method : 'POST',
                            url    : API_URL + 'entity-' + $scope.send.author.id + '/rights',
                            data   : getSignedData(API_USER, API_KEY, {
                                'entity': API_USER
                            })
                        })
                        .success(function(data) {
                            callback(null)
                        })
                        .error(function(data) {
                            callback(data.error)
                        })
                },
                function(callback) {
                    if (!$scope.send.storyteller.id) { return callback(null) }
                    $http({
                            method : 'POST',
                            url    : API_URL + 'entity-' + $scope.send.storyteller.id + '/rights',
                            data   : getSignedData(API_USER, API_KEY, {
                                'entity': API_USER
                            })
                        })
                        .success(function(data) {
                            callback(null)
                        })
                        .error(function(data) {
                            callback(data.error)
                        })
                },
            ], function(err) {
                if(err) {
                    $scope.sending = false
                    $('#sending').html('ERROR')
                    cl(err)
                    return
                }

                if($scope.send.s3) {
                    var xhr = new XMLHttpRequest()
                    var form = new FormData()

                    for(var i in $scope.send.s3.data) {
                        form.append(i, $scope.send.s3.data[i])
                    }
                    form.append('file', $scope.send.file)

                    xhr.upload.addEventListener('progress', function (ev) {
                        if(!ev.lengthComputable) return
                        $scope.send.progress = (ev.loaded * 100 / ev.total - 0.1).toFixed(1)
                        $scope.$apply()
                        $('#sending').html($scope.send.progress)
                    }, false)

                    xhr.onreadystatechange = function(ev) {
                        if(xhr.readyState != 4) return
                        if(xhr.status == 201) {
                            $scope.send.sending = false
                            $scope.send.sent = true
                        } else {
                            cl(xhr)
                            $('#sending').html('ERROR')
                        }
                    }

                    xhr.open('POST', $scope.send.s3.url, true)
                    xhr.send(form)
                } else {
                    $scope.send.sending = false
                    $scope.send.sent = true
                }
            })
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
