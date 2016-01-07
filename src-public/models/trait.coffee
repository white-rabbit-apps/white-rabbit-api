app.factory 'Trait', (Parse) ->
  class Trait extends Parse.Model
    @configure "Trait", "name"
