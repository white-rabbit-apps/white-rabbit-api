app.controller 'LocationsCtrl', ($scope, Location, Upload) ->

  $scope.addLocation = ->
    $scope.newLocation = new Location
    $scope.newLocation.types = ["_new"]
    $scope.newLocation.save().then (location) ->
      $scope.fetchLocations()

  $scope.removeLocation = (location) ->
    if confirm("Are you sure?  All data will be lost.")
      location.destroy().then () ->
        _.remove $scope.locations, (location) ->
          location.objectId is null

  $scope.editingLocation = (location) ->
    location.editing = true

  $scope.editLocation = (location) ->
    console.log("saving location")
    if(location.geo?)
      location.geo = {
        "__type": "GeoPoint",
        "latitude": parseFloat(location.geo.latitude),
        "longitude": parseFloat(location.geo.longitude)
      }
    if(location.logo? && location.logo.file?)
      name = location.logo.filename || 'logo.jpg'
      imageBase64= location.logo.file.replace(/^data:image\/(png|jpeg);base64,/, "")
      file = new Parse.File(name, {
        base64: imageBase64
      }, "image/jpeg")
      location.saving = true
      file.save()
      .then (file) ->
        console.log("image uploaded: " + file)
        location.logo = file
        location.save().then(
          (object) ->
            console.log("saved location")
            location.saving = false
            location.editing = false
          ,
          (error) ->
            console.log("error saving location")
        )
    else
      location.save().then(
        (object) ->
          console.log("saved location")
          location.editing = false
        ,
        (error) ->
          console.log("error saving location")
      )
    location.save()
    location.editing = false

  $scope.cancelEditing = (location) ->
    location.title = location._cache.title
    location.editing = false

  $scope.selectType = (type) ->
    $scope.selectedType = type
    $scope.fetchLocations()

  $scope.fetchLocations = ->
    Location.query(
      where:
        types: $scope.selectedType
    )
    .then (locations) ->
      $scope.locations = locations

  $scope.types = ["_new", "vet", "shelter", "cafe", "supplies", "grooming", "boarding", "daycare", "training", "sitting", "walking"]
  $scope.animals = ["cats", "dogs", "birds", "rabbits", "reptiles"]
  $scope.selectedType = $scope.types[0]
  $scope.fetchLocations()
  $scope.newLocation = new Location
