app.factory 'AnimalTimelineEntry', (Parse) ->
  class AnimalTimelineEntry extends Parse.Model
    @configure "AnimalTimelineEntry", "animal", "date", "kind", "image", "text", "type"
