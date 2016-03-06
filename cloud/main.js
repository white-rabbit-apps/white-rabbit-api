var ig;

require(__dirname + '/validations.js');

require(__dirname + '/deletes.js');

require(__dirname + '/activity.js');

ig = require('instagram-node').instagram();

ig.use({
  client_id: '09214a4e95494f70873ea3f8c7c82960',
  client_secret: '18c7f3e84ee54c429364ad48f8a00146'
});

Parse.Cloud.define('importInstagramPhotos', function(request, response) {
  var animalObjectId, instagramUsername;
  console.log('importing instagram photos');
  animalObjectId = request.params.animalObjectId;
  instagramUsername = request.params.instagramUsername;
  return ig.user_search(instagramUsername, function(err, users, remaining, limit) {
    var user;
    console.log('finished searching users: ' + JSON.stringify(users));
    if (!err) {
      console.log('no error searching users');
      user = users[0];
      console.log('user: ' + JSON.stringify(user));
      return ig.user_media_recent(user["id"], {
        "count": 100
      }, function(err, medias, pagination, remaining, limit) {
        var query;
        console.log('finished searching media');
        query = new Parse.Query("Animal");
        query.equalTo("objectId", animalObjectId);
        console.log("finding animal: " + animalObjectId);
        return query.find({
          useMasterKey: true,
          success: function(results) {
            var animal, media, media_caption, media_id, media_url, _i, _len, _results;
            console.log("found: " + results);
            if (results.length > 0) {
              animal = results[0];
              console.log('found animal: ' + JSON.stringify(animal));
              _results = [];
              for (_i = 0, _len = medias.length; _i < _len; _i++) {
                media = medias[_i];
                media_id = media["id"];
                media_caption = media["caption"];
                media_url = media["images"]["standard_resolution"]["url"];
                _results.push(console.log('media: ' + media_url));
              }
              return _results;
            }
          }
        });
      });
    }
  });
});

Parse.Cloud.define('shareToTwitter', function(request, response) {
  var entryText, user, userObjectId;
  Parse.Cloud.useMasterKey();
  userObjectId = request.params.userObjectId;
  entryText = request.params.entryText;
  return user = new Parse.Query(Parse.User);
});

Parse.Cloud.afterSave("AnimalTransfer", function(request, response) {
  return console.log('attempting email for animal transfer');
});

Parse.Cloud.afterSave("AnimalTimelineEntry", function(request, response) {
  var entryText, userObjectId, userQuery;
  console.log("timeline entry created: " + JSON.stringify(request));
  console.log("shareToFacebook: " + request.object.get("shareToFacebook"));
  console.log("shareToTwitter: " + request.object.get("shareToTwitter"));
  if (request.object.get("shareToFacebook")) {
    console.log("sharing to Facebook for: " + request.object.get("createdBy").id);
    userObjectId = request.object.get("createdBy").id;
    entryText = request.object.get("text");
    userQuery = new Parse.Query(Parse.User);
    userQuery.get(userObjectId, {
      useMasterKey: true
    }).then(function(user) {
      console.log('User: ' + JSON.stringify(user));
      if (user.get('_auth_data_facebook')) {
        console.log('token:' + user.get('_auth_data_facebook').access_token);
        Parse.Cloud.httpRequest({
          method: 'POST',
          url: 'https://graph.facebook.com/me/feed',
          params: {
            access_token: user.get('_auth_data_facebook').access_token,
            message: entryText + "\n\nCheck out Phoebe on White Rabbit Apps",
            link: "http://www.whiterabbitapps.net/cat/phoebe_the_bug"
          }
        }).then((function(httpResponse) {
          return console.log("back from http request 6543");
        }), function(error) {
          console.log("error with http request: " + error.data.error.message);
          return response.error(error.data.error.message);
        });
      } else {
        return Parse.Promise.error('user not linked to fb account');
      }
    }).then((function(result) {
      console.log("result from post: " + JSON.stringify(result));
      return response.success('Post');
    }), function(error) {
      console.log(error);
      console.error(error);
      return response.error("Error posting");
    });
    return;
  }
  if (request.object.get("shareToTwitter")) {
    console.log("sharing to Twitter for: " + request.object.get("createdBy").id);
    Parse.Cloud.run('shareToTwitter', {
      userObjectId: request.object.get("createdBy").id,
      entryText: request.object.get("text")
    }).then((function(result) {
      console.log('result :' + JSON.stringify(result));
    }), function(error) {});
  }
  return response.success();
});

Parse.Cloud.afterSave("Animal", function(request, response) {
  var query;
  console.log("afterSave: " + request.object.id);
  if (request.object.get("birthDate")) {
    console.log("has birthday");
    query = new Parse.Query("AnimalTimelineEntry");
    query.equalTo("animal", {
      "__type": "Pointer",
      "className": "Animal",
      "objectId": request.object.id
    });
    query.equalTo("type", "birth");
    return query.find({
      useMasterKey: true,
      success: function(results) {
        var entry, result, _i, _len;
        console.log("results: " + results);
        console.log("request: " + request.object.get("birthDate").toISOString());
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          result = results[_i];
          console.log("destroying entry");
          result.destroy({
            useMasterKey: true
          });
        }
        entry = new Parse.Object("AnimalTimelineEntry");
        entry.set("type", "birth");
        entry.set("animal", {
          "__type": "Pointer",
          "className": "Animal",
          "objectId": request.object.id
        });
        entry.set("text", "Born");
        entry.set("date", {
          "__type": "Date",
          "iso": request.object.get("birthDate").toISOString()
        });
        console.log("saving entry");
        return entry.save(null, {
          useMasterKey: true,
          success: function(result) {
            console.log("saved: " + result.id);
            return response.success();
          },
          error: function(error) {
            return response.error(error.message);
          }
        });
      },
      error: function(error) {
        return response.error(error.message);
      }
    });
  }
});
