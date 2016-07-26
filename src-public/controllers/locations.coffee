app.controller 'LocationsCtrl', ($scope, Location, Upload) ->

  $scope.addLocation = ->
    $scope.newLocation = new Location
    $scope.newLocation.types = ["_new"]
    $scope.newLocation.save().then (location) ->
      $scope.fetchLocations()

  $scope.duplicateLocation = (location) ->
    newLocation = new Location
    attrsJson = JSON.stringify(location.attributes())
    attrs = JSON.parse(attrsJson)

    for key in Object.keys(attrs)
      newLocation[key] = attrs[key]

    newLocation.save().then () ->
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
    location.editing = false

  $scope.cancelEditing = (location) ->
    location.title = location._cache.title
    location.editing = false

  $scope.selectType = (type) ->
    $scope.selectedType = type
    $scope.fetchLocations()

  $scope.searchLocations = () ->
    Location.query(
      where:
        name:
          "$regex": '\\Q' + $scope.searchTerm + '\\E'
          "$options": "i"
    )
    .then (locations) ->
      $scope.locations = locations

  $scope.fetchLocations = ->
    if $scope.selectedAnimal != null && $scope.selectedAnimal != "any"
      params =
        where:
          types: $scope.selectedType
          animals: $scope.selectedAnimal
    else
      params =
        where:
          types: $scope.selectedType

    Location.query(params)
    .then (locations) ->
      $scope.locations = locations

  $scope.searchTerm = ""
  $scope.types = ["_new", "vet", "hospital", "emergency", "shelter", "rescue", "cafe", "supplies", "grooming", "boarding", "daycare", "training", "sitting", "walking", "insurance"]
  $scope.animals = ["cats", "dogs", "birds", "rabbits", "reptiles", "fish", "rodents", "horses", "pigs", "chicken"]
  $scope.selectedType = $scope.types[0]

  $scope.selectedAnimal = "any"
  $scope.fetchLocations()
  $scope.newLocation = new Location
