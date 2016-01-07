app.controller 'UsersCtrl', ($scope, User) ->

  $scope.addUser = ->
    $scope.newUser.save().then (user) ->
      $scope.fetchUsers()
    $scope.newUser = new User

  $scope.removeUser = (user) ->
    user.destroy().then () ->
      _.remove $scope.users, (user) ->
        user.objectId is null

  $scope.makeAdmin = (user) ->
    console.log("make admin")
    Parse.Cloud.run("makeAdmin", {
      userId: user.objectId
    })

  $scope.editingUser = (user) ->
    user.editing = true

  $scope.editUser = (user) ->
    user.save()
    user.editing = false

  $scope.cancelEditing = (user) ->
    user.title = user._cache.title
    user.editing = false

  $scope.fetchUsers = ->
    User.query(
      include: 'shelter'
    ).then (users) ->
      $scope.users = users

  $scope.fetchUsers()
  $scope.newUser = new User
