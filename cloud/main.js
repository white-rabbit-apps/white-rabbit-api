var SimpleSendGridAdapter, ig, lolspeak, sendgrid, shareToFacebook;

require(__dirname + '/validations.js');

require(__dirname + '/deletes.js');

require(__dirname + '/activity.js');

require(__dirname + '/jobs.js');

lolspeak = require('lolspeak');

SimpleSendGridAdapter = require('parse-server-sendgrid-adapter');

sendgrid = SimpleSendGridAdapter({
  fromAddress: 'purrfactory@communikitty.com',
  domain: 'communikitty.com',
  apiKey: process.env.SENDGRID_KEY
});

ig = require('instagram-node').instagram();

ig.use({
  client_id: 'd10bd77c510c4e09af13763839673b0d',
  client_secret: '4823381080a94838aa5168ff6a4936b1'
});

Parse.Cloud.define('translate', function(request, response) {
  var message, translated_message;
  console.log('translating');
  message = request.params.message;
  translated_message = lolspeak(message);
  return response.success(translated_message);
});

Parse.Cloud.define('importInstagramPhotos', function(request, response) {
  var animalObjectId, instagramUsername;
  console.log('importing instagram photos');
  animalObjectId = request.params.animalObjectId;
  instagramUsername = request.params.instagramUsername;
  return ig.user_search(instagramUsername, function(err, users, remaining, limit) {
    var u, user, _i, _len;
    console.log('finished searching users: ' + JSON.stringify(users));
    if (err) {
      return console.log('error searching ig: ' + err);
    } else {
      console.log('no error searching users');
      user = users[0];
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        u = users[_i];
        if (u["username"] === instagramUsername) {
          user = u;
        }
      }
      console.log('user: ' + JSON.stringify(user));
      return ig.user_media_recent(user["id"], {
        "count": 1000
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
            var animal, media, media_caption, media_date, media_id, media_url, timelineEntry, _j, _len1;
            console.log("found animals: " + results);
            if (results.length > 0) {
              animal = results[0];
              console.log('found animal: ' + JSON.stringify(animal));
              console.log('media size: ' + medias.length);
              for (_j = 0, _len1 = medias.length; _j < _len1; _j++) {
                media = medias[_j];
                media_id = media["id"];
                media_caption = media["caption"]["text"];
                media_date = new Date(parseInt(media["created_time"]) * 1000);
                media_url = media["images"]["standard_resolution"]["url"];
                console.log('media: ' + JSON.stringify(media));
                timelineEntry = new Parse.Object("AnimalTimelineEntry");
                timelineEntry.set("instagramId", media_id);
                timelineEntry.set("text", media_caption);
                timelineEntry.set("type", "image");
                timelineEntry.set("date", media_date);
                timelineEntry.set("createdAt", media_date);
                timelineEntry.set("imageUrl", media_url);
                timelineEntry.set("animal", animal);
                timelineEntry.save(null, {
                  useMasterKey: true,
                  success: function(result) {
                    console.log("timeline entry saved: " + JSON.stringify(result));
                  },
                  error: function(error) {
                    console.log("error: " + JSON.stringify(error));
                  }
                });
              }
              return response.success();
            }
          }
        });
      });
    }
  });
});

Parse.Cloud.beforeSave("AnimalTimelineEntry", function(request, response) {
  var timelineEntryQuery;
  if (!request.object.existed() && request.object.get("instagramId")) {
    timelineEntryQuery = new Parse.Query("AnimalTimelineEntry");
    timelineEntryQuery.equalTo("instagramId", request.object.get("instagramId"));
    timelineEntryQuery.equalTo("animal", request.object.get("animal"));
    return timelineEntryQuery.find({
      useMasterKey: true,
      success: function(results) {
        if (results.length === 0) {
          console.log("found no timeline entries");
          return response.success();
        } else {
          console.log("already have a timeline entry for that photo");
          return response.error("Already have a timeline entry for that instagram photo");
        }
      }
    });
  } else {
    return response.success();
  }
});

shareToFacebook = function(forUser, message, link) {
  var userQuery;
  console.log('sharing to facebook');
  userQuery = new Parse.Query(Parse.User);
  return userQuery.get(forUser.id, {
    useMasterKey: true
  }).then(function(user) {
    console.log('User: ' + JSON.stringify(user));
    if (Parse.FacebookUtils.isLinked(user)) {
      console.log('token: ' + user.get('authData').facebook.access_token);
      return Parse.Cloud.httpRequest({
        method: 'POST',
        url: 'https://graph.facebook.com/me/feed',
        params: {
          access_token: user.get('authData').facebook.access_token,
          message: message,
          link: link
        }
      }).then((function(httpResponse) {
        return console.log("back from http request");
      }), function(error) {
        console.log("error with http request: " + error.data.error.message);
        return response.error(error.data.error.message);
      });
    } else {
      return Parse.Promise.error('user not linked to fb account');
    }
  });
};

Parse.Cloud.afterSave("AnimalTimelineEntry", function(request, response) {
  var animal, animalQuery, entryId, entryText, user;
  if (request.object.get("shareToFacebook")) {
    console.log("sharing to Facebook for: " + request.object.get("createdBy").id);
    user = request.object.get("createdBy");
    entryText = request.object.get("text");
    entryId = request.object.id;
    animal = request.object.get("animal");
    animalQuery = new Parse.Query("Animal");
    animalQuery.get(animal.id, {
      useMasterKey: true
    }).then(function(animal) {
      var link, username;
      console.log('Animal: ' + JSON.stringify(animal));
      username = animal.get("username");
      link = "http://www.communikitty.com/cat/" + username + "/" + entryId;
      return shareToFacebook(user, entryText, link);
    });
  }
  if (request.object.get("shareToTwitter")) {
    console.log("sharing to Twitter for: " + request.object.get("createdBy").id);
  }
  return response.success();
});

Parse.Cloud.afterSave("AnimalTransfer", function(request, response) {
  var entry;
  console.log('creating activity for animal transfer');
  if (request.object.isNew()) {
    console.log('attempting email for animal transfer');
    sendgrid.sendEmail({
      to: ['michaelbina@icloud.com'],
      from: 'support@communikitty.com',
      subject: 'You\'ve been invited to take over',
      text: 'Congratulations on your new family member!',
      replyto: 'support@communikitty.com'
    }).then((function(httpResponse) {
      return console.log(httpResponse);
    }), function(httpResponse) {
      return console.error(httpResponse);
    });
  }
  if (request.object.get("status") === "accepted") {
    console.log('animal transfer has been accepted');
    if (request.object.get("type") === "Adopter") {
      console.log('animal transfer has been accepted for an adopter');
      entry = new Parse.Object("AnimalTimelineEntry");
      entry.set("type", "adopted");
      entry.set("animal", request.object.get("animal"));
      entry.set("text", "Adopted by");
      entry.set("actingUser", request.object.get("acceptedByUser"));
      entry.set("date", {
        "__type": "Date",
        "iso": (new Date()).toISOString()
      });
      console.log("saving entry");
      entry.save(null, {
        useMasterKey: true,
        success: function(result) {
          console.log("saved: " + result.id);
          return response.success();
        },
        error: function(error) {
          return response.error(error.message);
        }
      });
    }
    if (request.object.get("type") === "Foster") {
      console.log('animal transfer has been accepted for an foster');
      entry = new Parse.Object("AnimalTimelineEntry");
      entry.set("type", "fostered");
      entry.set("animal", request.object.get("animal"));
      entry.set("text", "Started being fostered by");
      entry.set("actingUser", request.object.get("acceptedByUser"));
      entry.set("date", {
        "__type": "Date",
        "iso": (new Date()).toISOString()
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
    }
  }
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

Parse.Cloud.afterSave("Like", function(request, response) {
  var query;
  console.log("afterSave: Like");
  console.log("Creating activity items for like");
  console.log("Finding timeline entry: " + request.object.get("entry").id);
  query = new Parse.Query("AnimalTimelineEntry");
  query.equalTo("objectId", request.object.get("entry").id);
  query.include("createdBy");
  query.include("animal");
  query.find({
    useMasterKey: true,
    success: function(results) {
      var actedOnAnimalId, actedOnAnimalQuery, entry;
      console.log("found: " + results);
      if (results.length > 0) {
        entry = results[0];
        console.log("Timeline entry found: " + entry);
        actedOnAnimalId = entry.get("animal").id;
        actedOnAnimalQuery = new Parse.Query("Animal");
        return actedOnAnimalQuery.get(actedOnAnimalId, {
          useMasterKey: true,
          success: function(actedOnAnimal) {
            var owners, userId, userQuery;
            owners = [];
            if (actedOnAnimal.get("owners")) {
              owners = actedOnAnimal.get("owners");
            } else if (actedOnAnimal.get("fosters")) {
              owners = actedOnAnimal.get("fosters");
            }
            console.log("Found owners for the acted on: " + owners);
            userId = request.object.get("actingUser").id;
            userQuery = new Parse.Query("_User");
            return userQuery.get(userId, {
              useMasterKey: true,
              success: function(user) {
                var activity, owner, ownerId, _i, _len, _results;
                _results = [];
                for (_i = 0, _len = owners.length; _i < _len; _i++) {
                  owner = owners[_i];
                  ownerId = owner.id;
                  if (ownerId !== request.object.get("actingUser").id) {
                    activity = new Parse.Object("Activity");
                    activity.set("action", "like");
                    activity.set("likeAction", request.object.get("action"));
                    activity.set("actingUser", {
                      "__type": "Pointer",
                      "className": "_User",
                      "objectId": userId
                    });
                    activity.set("actingUserName", user.get('username'));
                    activity.set("entryActedOn", {
                      "__type": "Pointer",
                      "className": "AnimalTimelineEntry",
                      "objectId": request.object.get("entry").id
                    });
                    activity.set("forUser", {
                      "__type": "Pointer",
                      "className": "_User",
                      "objectId": ownerId
                    });
                    console.log("saving activity for owner: " + ownerId);
                    _results.push(activity.save(null, {
                      useMasterKey: true,
                      success: function(result) {
                        return console.log("for user: " + result.get("forUser").id + ", activity saved: " + result);
                      }
                    }));
                  } else {
                    _results.push(void 0);
                  }
                }
                return _results;
              }
            });
          }
        });
      }
    }
  });
  console.log("Incrementing like count");
  query = new Parse.Query("AnimalTimelineEntry");
  query.equalTo("objectId", request.object.get("entry").id);
  console.log("finding entry: " + request.object.get("entry").id);
  query.find({
    useMasterKey: true,
    success: function(results) {
      var entry, likeCount;
      console.log("found - incrementing count: " + JSON.stringify(results));
      if (results.length > 0) {
        entry = results[0];
        if (entry.get("likeCount")) {
          likeCount = parseInt(entry.get("likeCount"), 10);
        } else {
          likeCount = 0;
        }
        console.log("likeCount before: " + likeCount);
        entry.set("likeCount", likeCount + 1);
        return entry.save(null, {
          useMasterKey: true,
          success: function(result) {
            return console.log("Entry saved after incrementing likeCount: " + result);
          }
        });
      }
    }
  });
  return response.success();
});

Parse.Cloud.afterDelete("Like", function(request, response) {
  var query;
  console.log("afterDelete: Like");
  console.log("deleted like - decrementing count");
  query = new Parse.Query("AnimalTimelineEntry");
  query.equalTo("objectId", request.object.get("entry").id);
  console.log("finding entry: " + request.object.get("entry").id);
  query.find({
    useMasterKey: true,
    success: function(results) {
      var entry, likeCount;
      console.log("found - decrementing count: " + JSON.stringify(results));
      if (results.length > 0) {
        entry = results[0];
        if (entry.get("likeCount")) {
          likeCount = parseInt(entry.get("likeCount"), 10);
        } else {
          likeCount = 0;
        }
        console.log("likeCount before: " + likeCount);
        entry.set("likeCount", likeCount - 1);
        return entry.save(null, {
          useMasterKey: true,
          success: function(result) {
            return console.log("Entry saved after decrementing likeCount: " + result);
          }
        });
      }
    }
  });
  query = new Parse.Query("Activity");
  query.equalTo("actingUser", request.object.get("actingUser"));
  query.equalTo("entryActedOn", request.object.get("entry"));
  query.equalTo("action", "like");
  console.log("finding activities to destroy");
  query.find({
    useMasterKey: true,
    success: function(results) {
      var result, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        console.log("destroying activity");
        _results.push(result.destroy({
          useMasterKey: true
        }));
      }
      return _results;
    }
  });
  return response.success();
});

Parse.Cloud.afterSave("Comment", function(request, response) {
  var query;
  console.log("afterSave: Comment");
  console.log("Creating activity items for comment: " + request.object.get("text"));
  console.log("Finding timeline entry: " + request.object.get("entry").id);
  query = new Parse.Query("AnimalTimelineEntry");
  query.equalTo("objectId", request.object.get("entry").id);
  query.include("createdBy");
  query.include("animal");
  query.find({
    useMasterKey: true,
    success: function(results) {
      var actingAnimalId, actingAnimalQuery, entry;
      console.log("found: " + results);
      if (results.length > 0) {
        entry = results[0];
        console.log("Timeline entry found: " + entry);
        actingAnimalId = request.object.get("animal").id;
        actingAnimalQuery = new Parse.Query("Animal");
        console.log("Finding acting animal: " + actingAnimalId);
        return actingAnimalQuery.get(actingAnimalId, {
          useMasterKey: true,
          success: function(actingAnimal) {
            var actedOnAnimalId, actedOnAnimalQuery;
            actedOnAnimalId = entry.get("animal").id;
            actedOnAnimalQuery = new Parse.Query("Animal");
            return actedOnAnimalQuery.get(actedOnAnimalId, {
              useMasterKey: true,
              success: function(actedOnAnimal) {
                var activity, owner, ownerId, owners, _i, _len, _results;
                owners = [];
                if (actedOnAnimal.get("owners")) {
                  owners = actedOnAnimal.get("owners");
                } else if (actedOnAnimal.get("fosters")) {
                  owners = actedOnAnimal.get("fosters");
                }
                console.log("Found owners for the acted on: " + owners);
                _results = [];
                for (_i = 0, _len = owners.length; _i < _len; _i++) {
                  owner = owners[_i];
                  ownerId = owner.id;
                  activity = new Parse.Object("Activity");
                  activity.set("action", "comment");
                  activity.set("actingAnimal", {
                    "__type": "Pointer",
                    "className": "Animal",
                    "objectId": actingAnimalId
                  });
                  activity.set("actingAnimalName", actingAnimal.get('username'));
                  activity.set("entryActedOn", {
                    "__type": "Pointer",
                    "className": "AnimalTimelineEntry",
                    "objectId": request.object.get("entry").id
                  });
                  activity.set("commentMade", request.object);
                  activity.set("commentMadeText", request.object.get("text"));
                  activity.set("forUser", {
                    "__type": "Pointer",
                    "className": "_User",
                    "objectId": ownerId
                  });
                  console.log("Saving activity for owner: " + ownerId);
                  _results.push(activity.save(null, {
                    useMasterKey: true,
                    success: function(result) {
                      return console.log("for user: " + result.get("forUser").id + ", activity saved: " + result);
                    }
                  }));
                }
                return _results;
              }
            });
          },
          error: function(error) {
            return console.log('ERROR: ' + error);
          }
        });
      }
    }
  });
  query = new Parse.Query("AnimalTimelineEntry");
  query.equalTo("objectId", request.object.get("entry").id);
  query.find({
    useMasterKey: true,
    success: function(results) {
      var entry, likeCount;
      console.log("found - incrementing count: " + JSON.stringify(results));
      if (results.length > 0) {
        entry = results[0];
        if (entry.get("commentCount")) {
          likeCount = parseInt(entry.get("commentCount"), 10);
        } else {
          likeCount = 0;
        }
        entry.set("commentCount", likeCount + 1);
        return entry.save(null, {
          useMasterKey: true,
          success: function(result) {
            return console.log("Entry saved after incrementing commentCount: " + result);
          }
        });
      }
    }
  });
  return response.success();
});

Parse.Cloud.afterDelete("Comment", function(request, response) {
  var query;
  console.log("afterDelete: Comment");
  query = new Parse.Query("AnimalTimelineEntry");
  query.equalTo("objectId", request.object.get("entry").id);
  console.log("finding entry: " + request.object.get("entry").id);
  query.find({
    useMasterKey: true,
    success: function(results) {
      var commentCount, entry;
      console.log("found - decrementing count: " + JSON.stringify(results));
      if (results.length > 0) {
        entry = results[0];
        if (entry.get("commentCount")) {
          commentCount = parseInt(entry.get("commentCount"), 10);
        } else {
          commentCount = 0;
        }
        console.log("commentCount before: " + commentCount);
        entry.set("commentCount", commentCount - 1);
        return entry.save(null, {
          useMasterKey: true,
          success: function(result) {
            return console.log("Entry saved after decrementing commentCount: " + result);
          }
        });
      }
    }
  });
  query = new Parse.Query("Activity");
  query.equalTo("actingAnimal", request.object.get("animal"));
  query.equalTo("entryActedOn", request.object.get("entry"));
  query.equalTo("commentMade", request.object);
  console.log("finding activities to destroy");
  query.find({
    useMasterKey: true,
    success: function(results) {
      var result, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        console.log("destroying activity");
        _results.push(result.destroy({
          useMasterKey: true
        }));
      }
      return _results;
    }
  });
  return response.success();
});
