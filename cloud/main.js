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
    query.limit(100000);
    return query.find({
      useMasterKey: true,
      success: function(results) {
        var result, _i, _len, _results;
        console.log("results: " + results);
        console.log("request: " + request.object.get("birthDate").toISOString());
        _results = [];
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          result = results[_i];
          console.log("destroying entry");
          _results.push(result.destroy({
            useMasterKey: true
          }));
        }
        return _results;
      },
      error: function(error) {
        return response.error(error.message);
      }
    });
  }
});
