app.factory 'Location', (Parse) ->
  class Location extends Parse.Model
    @configure "Location", "type", "name", "short_name", "email", "address", "city", "state", "zip", "geo", "phone", "website", "fbUrl", "twitterUrl", "instagramUrl", "youtubeUrl", "fbUrl", "yelpUrl", "logo"
