app.controller 'BetaCtrl', ($scope, $rootScope, $stateParams) ->

  $scope.status = $stateParams.status
  $rootScope.status = $stateParams.status

  $rootScope.hideNavigation = true
  $rootScope.bodyClass = 'no-nav'

  $rootScope.betaConfirm = false
  $rootScope.betaSubscribed = false


  if $scope.status is 'confirm'
    $rootScope.betaConfirm = true
  if $scope.status is 'subscribed'
    $rootScope.betaSubscribed = true
