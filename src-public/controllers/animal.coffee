app.controller 'AnimalCtrl', ($scope, Animal, AnimalTimelineEntry, $stateParams, $rootScope) ->

  $scope.isAlive = true
  $scope.username = $stateParams.username
  $rootScope.hideNavigation = false
  $rootScope.bodyClass = 'no-nav'

  $scope.createNewEntry = ->
    $scope.newEntry = new AnimalTimelineEntry({
      "animal": {
        "__type": "Pointer",
        "className": "Animal",
        "objectId": $scope.animal.objectId
      },
      "type": "image",
      "date": {
        "__type": "Date",
        "iso": new Date()
      }
    })

  $scope.addEntry = ->
    if($scope.newEntry? && $scope.newEntry.image?)
      name = $scope.newEntry.filename || 'timeline.jpg'
      imageBase64= $scope.newEntry.image.file.replace(/^data:image\/(png|jpeg);base64,/, "")
      file = new Parse.File(name, {
        base64: imageBase64
      }, "image/jpeg")
      file.save()
      .then (file) ->
        console.log("image uploaded: " + file)
        $scope.newEntry.image = file
        $scope.newEntry.save().then(
          (entry) ->
            console.log("saved entry")
            $scope.fetchEntries()
            $scope.createNewEntry()
          ,
          (error) ->
            console.log("error saving entry")
        )
    else
      $scope.newEntry.save().then (entry) ->
        $scope.fetchEntries()
        $scope.createNewEntry()

  $scope.fetchAnimal = ->
    Animal.query(
      where:
        username: $stateParams.username
      include: 'breed,shelter'
    )
    .then (animals) ->
      $scope.animal = animals[0]
      console.log($scope.animal.deceasedDate)
      if $scope.animal.deceasedDate
        $scope.isAlive = false

      $rootScope.titlePrefix = $scope.animal.name + ' on '
      $scope.createNewEntry()
      $scope.fetchEntries()

  $scope.fetchEntries = ->
    AnimalTimelineEntry.query(
      where:
        animal:
          __type: 'Pointer'
          className: 'Animal'
          objectId: $scope.animal.objectId
      include: 'shelter'
      orderBy: 'date DESC'
    )
    .then (entries) ->
      if $scope.isAlive
        $scope.entries = entries.reverse()
      else
        $scope.entries = entries

  $scope.prettyDate = (iso) ->
    monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    date = new Date(iso)
    day = date.getDate()
    monthIndex = date.getMonth()
    year = date.getFullYear()
    dateString = day + ' ' + monthNames[monthIndex] + ' ' + year
    return dateString

  $scope.fetchAnimal()
