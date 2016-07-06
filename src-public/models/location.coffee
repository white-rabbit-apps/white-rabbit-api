app.factory 'Location', (Parse) ->
  class Location extends Parse.Model
    @configure "Location", "type", "name", "short_name", "email", "address", "city", "state", "zip", "geo", "geoForCity","phone", "website", "facebookPageId", "twitterId", "instagramId", "instagramPlaceId", "youtubeUrl", "pinterestId", "yelpBusinessId", "googlePlaceId", "logo", "types", "animals", "notes", "websiteDown"
