app.controller 'UserCtrl', ($scope, User, $stateParams, $rootScope) ->

  $scope.token = $stateParams.token
  $scope.username = $stateParams.username

  $rootScope.hideNavigation = true
  $rootScope.bodyClass = 'no-nav'

  $scope.verifyEmail = ->
    User.query(
      where:
        _email_verify_token: $stateParams.token
    )
    .then (users) ->
      user = users[0]

      if user && user["username"] == $stateParams.username
        user.emailVerified = true
        user.save().then(
          (object) ->
            console.log("saved user")
          ,
          (error) ->
            console.log("error saving user")
        )

  $scope.verifyEmail()
