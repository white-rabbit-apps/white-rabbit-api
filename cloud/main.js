require(__dirname + '/validations.js');

require(__dirname + '/deletes.js');

require(__dirname + '/activity.js');

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
  var entryText, user, userObjectId;
  console.log("timeline entry created: " + JSON.stringify(request));
  console.log("shareToFacebook: " + request.object.get("shareToFacebook"));
  console.log("shareToTwitter: " + request.object.get("shareToTwitter"));
  if (request.object.get("shareToFacebook")) {
    console.log("sharing to Facebook for: " + request.object.get("createdBy").id);
    userObjectId = request.object.get("createdBy").id;
    entryText = request.object.get("text");
    user = new Parse.Query(Parse.User);
    user.get(userObjectId, {
      useMasterKey: true
    }).then(function(user) {
      console.log('UserID: ' + user.id);
      if (Parse.FacebookUtils.isLinked(user)) {
        console.log('token:' + user.get('authData').facebook.access_token);
        Parse.Cloud.httpRequest({
          method: 'POST',
          params: {
            message: entryText + "\n\nCheck out Phoebe on White Rabbit Apps",
            link: "http://www.whiterabbitapps.net/cat/phoebe_the_bug",
            access_token: user.get('authData').facebook.access_token
          },
          url: 'https://graph.facebook.com/me/feed'
        }).then((function(httpResponse) {
          console.log("back from http request 6543");
        }), function(error) {
          console.log("error with http request: " + JSON.stringify(error));
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
    return Parse.Cloud.run('shareToTwitter', {
      userObjectId: request.object.get("createdBy").id,
      entryText: request.object.get("text")
    }).then((function(result) {
      console.log('result :' + JSON.stringify(result));
    }), function(error) {});
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
