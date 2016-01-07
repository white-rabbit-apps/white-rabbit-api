app.controller 'HomeCtrl', ($scope, $rootScope) ->

  $rootScope.hideNavigation = true
  $rootScope.bodyClass = 'no-nav'
  $rootScope.betaConfirm = false
  $rootScope.betaSubscribed = false

  $scope.home = ->
