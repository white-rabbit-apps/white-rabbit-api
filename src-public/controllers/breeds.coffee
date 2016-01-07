app.controller 'BreedsCtrl', ($scope, Breed) ->

  $scope.addBreed = ->
    $scope.newBreed.save().then (breed) ->
      $scope.fetchBreeds()
    $scope.newBreed = new Breed

  $scope.removeBreed = (breed) ->
    if confirm("Are you sure?  All data will be lost.")
      breed.destroy().then () ->
        _.remove $scope.breeds, (breed) ->
          breed.objectId is null

  $scope.editingBreed = (breed) ->
    breed.editing = true

  $scope.editBreed = (breed) ->
    if(breed.image? && breed.image.file?)
      name = breed.image.filename || 'image.jpg'
      imageBase64= breed.image.file.replace(/^data:image\/(png|jpeg);base64,/, "")
      file = new Parse.File(name, {
        base64: imageBase64
      }, "image/jpeg")
      breed.saving = true
      file.save()
      .then (file) ->
        console.log("image uploaded: " + file)
        breed.image = file
        breed.save().then(
          (object) ->
            console.log("saved breed")
            breed.saving = false
            breed.editing = false
          ,
          (error) ->
            console.log("error saving breed")
        )
    else
      breed.save()
      breed.editing = false



    breed.save()
    breed.editing = false

  $scope.cancelEditing = (breed) ->
    breed.title = breed._cache.title
    breed.editing = false

  $scope.fetchBreeds = ->
    Breed.query()
    .then (breeds) ->
      $scope.breeds = breeds

  $scope.fetchBreeds()
  $scope.newBreed = new Breed
