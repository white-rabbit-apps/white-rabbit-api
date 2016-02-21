'use strict'

# document.addEventListener 'touchstart', (e) ->
#   e.preventDefault()

app = angular.module 'white-rabbit', [
  'ng'
  'ngResource'
  'ui.router'
  'ui.bootstrap'
  'app.templates'
  'Parse'
  'angulartics'
  'angulartics.google.analytics'
  'ngFileUpload'
]

app.config (
  $locationProvider
  $stateProvider
  $urlRouterProvider
  ParseProvider
) ->

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  })
  $locationProvider.hashPrefix('!')

  $stateProvider.state 'home',
    # url: '/:locale'
    url: '/'
    controller: 'HomeCtrl'
    templateUrl: 'landing.html'
  .state 'beta',
    url: '/beta/:status'
    controller: 'BetaCtrl'
    templateUrl: 'landing.html'
  .state 'animal',
    url: '/cat/:username'
    controller: 'AnimalCtrl'
    templateUrl: 'animal.html'
  .state 'location',
    url: '/location/:short_name'
    controller: 'LocationCtrl'
    templateUrl: 'location.html'
  .state 'shelter',
    url: '/shelter/:short_name'
    controller: 'LocationCtrl'
    templateUrl: 'location.html'
  .state 'hashtag',
    url: '/hashtag/:hashtag'
    controller: 'HashtagCtrl'
    templateUrl: 'hashtag.html'

  .state 'trait',
    url: '/admin/traits'
    controller: 'TraitCtrl'
    templateUrl: 'trait.html'
  .state 'animals',
    url: '/admin/animals'
    controller: 'AnimalsCtrl'
    templateUrl: 'animals.html'
  .state 'locations',
    url: '/admin/locations'
    controller: 'LocationsCtrl'
    templateUrl: 'locations.html'
  .state 'users',
    url: '/admin/users'
    controller: 'UsersCtrl'
    templateUrl: 'users.html'
  .state 'breeds',
    url: '/admin/breeds'
    controller: 'BreedsCtrl'
    templateUrl: 'breeds.html'
  .state 'products',
    url: '/admin/products'
    controller: 'ProductsCtrl'
    templateUrl: 'products.html'


  $urlRouterProvider.otherwise '/'


  ParseProvider.initialize(
    "IWr9xzTirLbjXH80mbTCtT9lWB73ggQe3PhA6nPg", # Application ID
    "SkDTdS8SBGzO9BkRHR3H8kwxCLJSvKsAe1jeOTnW"  # REST API Key
  )
  Parse.initialize("IWr9xzTirLbjXH80mbTCtT9lWB73ggQe3PhA6nPg", "8iUoJovKQkhCcpOaMPZ3r9Ii3thLsuvLfHViXLrK")


app.filter 'unsafe', ($sce) ->
  $sce.trustAsHtml

app.filter 'hashtagFilter', ($sce) ->
  hashtagPattern = /(^|\s)(#([a-z\d-]+))/ig
  mentionPattern = /(^|\s)(@([a-z0-9_-]+))/ig
  (text) ->
    newText = text.replace(hashtagPattern, '$1<a href="/hashtag/$3">$&</a>')
    newText = newText.replace(mentionPattern, '$1<a href="/cat/$3">$&</a>')
    return $sce.trustAsHtml(newText)



app.directive('fileDropzone', () ->
    restrict: 'A'
    scope: {
      file: '='
      fileName: '='
    }
    link: (scope, element, attrs) ->

      # function to prevent default behavior (browser loading image)
      processDragOverOrEnter = (event) ->
        event?.preventDefault()
        event.dataTransfer.effectAllowed = 'copy'
        false

      validMimeTypes = attrs.fileDropzone

      # if the max file size is provided and the size of dropped file is greater than it,
      # it's an invalid file and false is returned
      checkSize = (size) ->
        if attrs.maxFileSize in [undefined, ''] or (size / 1024) / 1024 < attrs.maxFileSize
          true
        else
          alert "File must be smaller than #{attrs.maxFileSize} MB"
          false

      isTypeValid = (type) ->
        if validMimeTypes in [undefined, ''] or validMimeTypes.indexOf(type) > -1
          true
        else
          # return true if no mime types are provided
          alert "Invalid file type.  File must be one of following types #{validMimeTypes}"
          false

      # for dragover and dragenter (IE) we stop the browser from handling the
      # event and specify copy as the allowable effect
      element.bind 'dragover', processDragOverOrEnter
      element.bind 'dragenter', processDragOverOrEnter

      # on drop events we stop browser and read the dropped file via the FileReader
      # the resulting droped file is bound to the image property of the scope of this directive
      element.bind 'drop', (event) ->
        event?.preventDefault()
        reader = new FileReader()
        reader.onload = (evt) ->

          if checkSize(size) and isTypeValid(type)
            scope.$apply ->
              scope.file = evt.target.result
              scope.fileName = name if angular.isString scope.fileName

        file = event.dataTransfer.files[0]
        name = file.name
        type = file.type
        size = file.size
        reader.readAsDataURL(file)
        return false
  )

app.run ($rootScope, $state, $location) ->
  $rootScope.$state = $state
  $rootScope.hideNavigation = false
  $rootScope.bodyClass = 'with-nav'
  $rootScope.title = 'White Rabbit Apps'
  $rootScope.description = 'Follow the white rabbit...'

  $rootScope.serverDomain = 'http://www.whiterabbitapps.net'
  $rootScope.url = $location.url()
  $rootScope.mainImage = 'http://files.parsetfss.com/76b6cc17-92eb-4048-be57-afbc6cb6e77d/tfss-64d0f007-06e1-4c7f-b2a2-6d558b87361f-file'


  $rootScope.currentUser = Parse.User.current()

  $(() ->
    $('.fb-share').click((e) ->
      e.preventDefault()
      window.open($(this).attr('href'), 'fbShareWindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
      return false
    )

    keenClient = new Keen(
      projectId: '5696d7a296773d0613e2abfe'
      writeKey: '238c8ba5674ad10606e769f23128ee11276aa2fcfc13704485edb8e68d4ec82c5a48ebe35b07fb535a36b66a967a48728aacad7f1e2c46768e6e1836ab8d7deadf8fe2b024dfd3116385ad05e2ad941b294d1cf4e61cce913aea0485f3cb4335')
    keenClient.addEvent 'pageview', key: 'value'

    iOS = false
    p = navigator.platform
    if p == 'iPad' or p == 'iPhone' or p == 'iPod'
      iOS = true
    if iOS
      $('#gif_background').show()
      $('#video_background').hide()
  )

  $rootScope.signUp = (form) ->
    user = new (Parse.User)
    user.set 'email', form.email
    user.set 'username', form.username
    user.set 'password', form.password
    user.signUp null,
      success: (user) ->
        $scope.currentUser = user
        $scope.$apply()
        return
      error: (user, error) ->
        alert 'Unable to sign up:  ' + error.code + ' ' + error.message
        return
    return

  $rootScope.logIn = (form) ->
    Parse.User.logIn form.username, form.password,
      success: (user) ->
        $scope.currentUser = user
        $scope.$apply()
        return
      error: (user, error) ->
        alert 'Unable to log in: ' + error.code + ' ' + error.message
        return
    return

  $rootScope.logOut = (form) ->
    Parse.User.logOut()
    $scope.currentUser = null
    return
