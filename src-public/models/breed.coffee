app.factory 'Breed', (Parse) ->
  class Breed extends Parse.Model
    @configure "Breed", "name", "image", "description", "originCountry", "type", "coat", "groomingFrequency", "sheddingFrequency", "attentionNeed", "activity", "vocalization", "minLifeExpectancy", "maxLifeExpectancy", "minWeightLbs", "maxWeightLbs"
