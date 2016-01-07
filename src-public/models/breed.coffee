app.factory 'Breed', (Parse) ->
  class Breed extends Parse.Model
    @configure "Breed", "name", "image", "description", "originCountry"
