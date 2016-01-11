var Parse;

Parse = require('parse-cloud-express').Parse;

Parse.Cloud.define("makeAdmin", function(request, response) {
  var user;
  if (request.params["userId"]) {
    Parse.Cloud.useMasterKey();
    user = new Parse.User({
      id: request.params.userId
    });
    user.set("admin", true);
    user.save();
    return response.success();
  } else {
    return response.error();
  }
});

Parse.Cloud.afterSave("Animal", function(request, response) {
  var query;
  if (request.object.get("birthDate")) {
    query = new Parse.Query("AnimalTimelineEntry");
    query.equalTo("animal", {
      "__type": "Pointer",
      "className": "Animal",
      "objectId": request.object.id
    });
    query.equalTo("type", "birth");
    return query.find({
      success: function(results) {
        var entry, result, _i, _len;
        console.log("results: " + results);
        console.log("request: " + request.object.get("birthDate").toISOString());
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          result = results[_i];
          console.log("destroying entry");
          result.destroy();
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
          success: function(result) {
            console.log("saved: " + result);
            return response.success();
          }
        });
      }
    });
  }
});

Parse.Cloud.afterSave("Follow", function(request, response) {
  var activity;
  activity = new Parse.Object("Activity");
  activity.set("action", "follow");
  activity.set("actingUser", {
    "__type": "Pointer",
    "className": "User",
    "objectId": request.object.get("follower").id
  });
  activity.set("animalActedOn", {
    "__type": "Pointer",
    "className": "Animal",
    "objectId": request.object.get("following").id
  });
  console.log("saving activity");
  return activity.save(null, {
    success: function(result) {
      console.log("activity saved: " + result);
      return response.success();
    }
  });
});

Parse.Cloud.beforeSave("AnimalTimelineEntry", function(request, response) {
  if (!request.object.get("hasDocuments")) {
    request.object.set("hasDocuments", false);
  }
  if (!request.object.get("private")) {
    if (request.object.get("type") === "medical") {
      return request.object.set("private", true);
    } else {
      return request.object.set("private", false);
    }
  }
});

Parse.Cloud.afterDelete("Animal", function(request, response) {
  var query;
  query = new Parse.Query("AnimalTimelineEntry");
  query.equalTo("animal", {
    "__type": "Pointer",
    "className": "Animal",
    "objectId": request.object.id
  });
  return query.find({
    success: function(results) {
      var result, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        console.log("destroying entry");
        _results.push(result.destroy());
      }
      return _results;
    }
  });
});

Parse.Cloud.afterDelete("AnimalTimelineEntry", function(request, response) {
  var query;
  query = new Parse.Query("Document");
  query.equalTo("entry", {
    "__type": "Pointer",
    "className": "AnimalTimelineEntry",
    "objectId": request.object.id
  });
  return query.find({
    success: function(results) {
      var result, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        console.log("destroying document");
        _results.push(result.destroy());
      }
      return _results;
    }
  });
});

Parse.Cloud.afterDelete("Document", function(request, response) {
  var query;
  query = new Parse.Query("DocumentPage");
  query.equalTo("document", {
    "__type": "Pointer",
    "className": "Document",
    "objectId": request.object.id
  });
  return query.find({
    success: function(results) {
      var result, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        console.log("destroying page");
        _results.push(result.destroy());
      }
      return _results;
    }
  });
});
