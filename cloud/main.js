var download, fs, http, ig;

require(__dirname + '/validations.js');

require(__dirname + '/deletes.js');

require(__dirname + '/activity.js');

http = require('http');

fs = require('fs');

download = function(url, dest, cb) {
  var file, request;
  file = fs.createWriteStream(dest);
  request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      console.log("finished downloading");
      file.close();
      cb(null, file);
    });
  }).on('error', function(err) {
    fs.unlink(dest);
    if (cb) {
      cb(err.message);
    }
  });
};

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
    var u, user, _i, _len;
    console.log('finished searching users: ' + JSON.stringify(users));
    if (!err) {
      console.log('no error searching users');
      user = users[0];
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        u = users[_i];
        if (u["username"] === instagramUsername) {
          user = u;
        }
      }
      console.log('user: ' + JSON.stringify(user));
      ig.user_media_recent(user["id"], {
        "count": 3
      }, function(err, medias, pagination, remaining, limit) {
        var query;
        if (err) {
          console.log('error searching media: ' + JSON.stringify(err));
          return;
        }
        console.log('finished searching media: ' + JSON.stringify(medias));
        query = new Parse.Query("Animal");
        query.equalTo("objectId", animalObjectId);
        console.log("finding animal: " + animalObjectId);
        return query.find({
          useMasterKey: true,
          success: function(results) {
            var animal, media, media_caption, media_date, media_id, media_url, timelineEntry, _j, _len1, _results;
            console.log("found animals: " + results);
            if (results.length > 0) {
              animal = results[0];
              console.log('found animal: ' + JSON.stringify(animal));
              _results = [];
              for (_j = 0, _len1 = medias.length; _j < _len1; _j++) {
                media = medias[_j];
                media_id = media["id"];
                media_caption = media["caption"]["text"];
                media_date = new Date(parseInt(media["created_time"]) * 1000);
                media_url = media["images"]["standard_resolution"]["url"];
                console.log('media: ' + media_url);
                timelineEntry = new Parse.Object("AnimalTimelineEntry");
                timelineEntry.set("instagramId", media_id);
                timelineEntry.set("text", media_caption);
                timelineEntry.set("type", "image");
                timelineEntry.set("date", media_date);
                timelineEntry.set("imageUrl", media_url);
                timelineEntry.set("animal", animal);
                _results.push(timelineEntry.save(null, {
                  useMasterKey: true,
                  success: function(result) {
                    return console.log("timeline entry saved: " + JSON.stringify(result));
                  },
                  error: function(error) {
                    return console.log("error: " + JSON.stringify(error));
                  }
                }));
              }
              return _results;
            }
          }
        });
      });
      return response.success();
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
