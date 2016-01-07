app.factory 'User', (Parse) ->
  class User extends Parse.User
    @configure "User", "firstName", "lastName", "email", "username", "profilePhoto", "admin", "shelter"
