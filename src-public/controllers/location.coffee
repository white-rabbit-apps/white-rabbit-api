app.controller 'LocationCtrl', ($scope, $rootScope, $stateParams, Location, Animal) ->

  $scope.short_name = $stateParams.short_name

  $rootScope.hideNavigation = false
  $rootScope.bodyClass = 'no-nav'

  $scope.fetchLocation = ->
    Location.query(
      where:
        short_name: $stateParams.short_name
    )
    .then (locations) ->
      $scope.location = locations[0]
      console.log($scope.location)

      $rootScope.titlePrefix = $scope.location.name + ' on '

      $scope.fetchAnimals()
      $scope.fetchAlumni()

  $scope.fetchAnimals = ->
    Animal.query(
      where:
        adoptable: true
        shelter:
          __type: 'Pointer'
          className: 'Location'
          objectId: $scope.location.objectId
      include: 'breed'
    )
    .then (animals) ->
      $scope.animals = animals

  $scope.fetchAlumni = ->
    Animal.query(
      where:
        adoptable: false
        shelter:
          __type: 'Pointer'
          className: 'Location'
          objectId: $scope.location.objectId
      include: 'breed'
    )
    .then (animals) ->
      $scope.alumni = animals

  $scope.fetchLocation()
