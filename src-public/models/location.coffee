app.factory 'Location', (Parse) ->
  class Location extends Parse.Model
    @configure "Location", "type", "name", "short_name", "email", "address", "city", "state", "zip", "geo", "phone", "website", "facebookPageId", "twitterId", "instagramId", "youtubeUrl", "yelpBusinessId", "logo", "types", "animals"
