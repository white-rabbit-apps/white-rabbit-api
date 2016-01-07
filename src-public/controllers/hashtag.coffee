app.controller 'HashtagCtrl', ($scope, AnimalTimelineEntry, $stateParams, $rootScope) ->

  $scope.hashtag = $stateParams.hashtag

  $rootScope.title = '#' + $scope.hashtag + ' on ' + $rootScope.title
  $rootScope.hideNavigation = false
  $rootScope.bodyClass = 'no-nav'


  $scope.fetchEntries = ->
    AnimalTimelineEntry.query(
      where:
        text:
          "$regex": '\\Q\#' + $scope.hashtag + '\\E'
          "$options": "i"
      include: 'shelter'
      orderBy: 'createdAt DESC'
    )
    .then (entries) ->
      $scope.entries = entries.reverse()

  $scope.prettyDate = (iso) ->
    monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    date = new Date(iso)
    day = date.getDate()
    monthIndex = date.getMonth()
    year = date.getFullYear()
    dateString = day + ' ' + monthNames[monthIndex] + ' ' + year
    return dateString

  $scope.fetchEntries()
