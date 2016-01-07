app.controller 'TraitCtrl', ($scope, Trait) ->

  $scope.addTrait = ->
    $scope.newTrait.save().then (trait) ->
      $scope.fetchTraits()
    $scope.newTrait = new Trait

  $scope.removeTrait = (trait) ->
    trait.destroy().then () ->
      _.remove $scope.traits, (trait) ->
        trait.objectId is null

  $scope.editingTrait = (trait) ->
    trait.editing = true

  $scope.editTrait = (trait) ->
    trait.save()
    trait.editing = false

  $scope.cancelEditing = (trait) ->
    trait.title = trait._cache.title
    trait.editing = false

  $scope.fetchTraits = ->
    Trait.query()
    .then (traits) ->
      $scope.traits = traits

  $scope.fetchTraits()
  $scope.newTrait = new Trait
