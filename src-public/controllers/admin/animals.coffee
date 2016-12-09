app.controller 'AnimalsCtrl', ($scope, Animal, Breed, Location, $stateParams) ->

  $scope.addAnimal = ->
    $scope.newAnimal.save().then (animal) ->
      $scope.fetchAnimals()
    $scope.newAnimal = new Animal

  $scope.removeAnimal = (animal) ->
    if confirm("Are you sure?  All data will be lost.")
      animal.destroy().then () ->
        _.remove $scope.animals, (animal) ->
          animal.objectId is null

  $scope.editingAnimal = (animal) ->
    animal.editing = true

  $scope.editAnimal = (animal) ->
    # if(animal.birthDate?)
    #   animal.birthDate =  {
    #     "__type": "Date",
    #     "iso": animal.birthDate
    #   }
    if(animal.breed?)
      animal.breed = new Breed(animal.breed)
    if(animal.shelter?)
      animal.shelter = new Location(animal.shelter)
    if(animal.profilePhoto? && animal.profilePhoto.file?)
      name = animal.profilePhoto.filename || 'profile.jpg'
      imageBase64= animal.profilePhoto.file.replace(/^data:image\/(png|jpeg);base64,/, "")
      file = new Parse.File(name, {
        base64: imageBase64
      }, "image/jpeg")
      animal.saving = true
      file.save()
      .then (file) ->
        console.log("image uploaded: " + file)
        animal.profilePhoto = file
        animal.save().then(
          (object) ->
            console.log("saved animal")
            animal.saving = false
            animal.editing = false
          ,
          (error) ->
            console.log("error saving animal")
        )
    else
      animal.save()
      animal.editing = false

  $scope.cancelEditing = (animal) ->
    animal.name = animal._cache.name
    animal.editing = false

  $scope.fetchBreeds = ->
    Breed.query()
    .then (breeds) ->
      $scope.breeds = breeds

  $scope.fetchAnimals = ->
    query = Animal.query(
      include: "breed,shelter"
    )
    if($scope.selectedGroup == 'Mine')
      query = Animal.query(
        where:
          owner:
            __type: 'Pointer'
            className: '_User'
            objectId: 'KSZuBHXIyE'
        include: "breed,shelter"
      )
    if($scope.selectedGroup == 'Featured')
      query = Animal.query(
        where:
          featured: true
          adoptable: false
        include: "breed,shelter"
      )
    if($scope.selectedGroup == 'New')
      query = Animal.query(
        where:
          name: null
        include: "breed,shelter"
      )
    if($scope.selectedGroup == 'Kittens')
      query = Animal.query(
        include: "breed,shelter"
      )
    if($scope.selectedGroup == 'Adoptable')
      query = Animal.query(
        where:
          adoptable: true
          featured: true
        include: "breed,shelter"
      )
      if($scope.selectedShelter?)
        query = Animal.query(
          where:
            adoptable: true
            shelter:
              __type: 'Pointer'
              className: 'Location'
              objectId: $scope.selectedShelter.objectId
          include: "breed,shelter"
        )

    query.then (animals) ->
      console.log(animals)
      $scope.animals = animals

  $scope.fetchShelters = ->
    Location.query(
      where:
        type: "shelter"
    )
    .then (locations) ->
      $scope.shelters = locations

  $scope.selectedGroup = 'Mine'
  $scope.fetchBreeds()
  $scope.fetchShelters()
  $scope.fetchAnimals()
  $scope.newAnimal = new Animal
