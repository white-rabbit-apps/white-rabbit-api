app.factory 'Coat', (Parse) ->
  class Coat extends Parse.Model
    @configure "Coat", "name"
