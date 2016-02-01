// require(__dirname + '/app.js');

Parse.Cloud.afterDelete(Parse.User, function(request, response) {
  var query;
  query = new Parse.Query("Activity");
  query.equalTo("actingUser", request.object);
  console.log("finding activities to destroy");
  return query.find({
    success: function(results) {
      var result, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        console.log("destroying activity");
        _results.push(result.destroy());
      }
      return _results;
    }
  });
});

Parse.Cloud.afterDelete("Follow", function(request, response) {
  var query;
  query = new Parse.Query("Activity");
  query.equalTo("actingUser", request.object.get("follower"));
  query.equalTo("animalActedOn", request.object.get("following"));
  query.equalTo("action", "follow");
  console.log("finding activities to destroy");
  return query.find({
    success: function(results) {
      var result, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        console.log("destroying activity");
        _results.push(result.destroy());
      }
      return _results;
    }
  });
});

Parse.Cloud.afterDelete("Comment", function(request, response) {
  var query;
  query = new Parse.Query("Activity");
  query.equalTo("actingAnimal", request.object.get("animal"));
  query.equalTo("entryActedOn", request.object.get("entry"));
  query.equalTo("action", "comment");
  console.log("finding activities to destroy");
  return query.find({
    success: function(results) {
      var result, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        console.log("destroying activity");
        _results.push(result.destroy());
      }
      return _results;
    }
  });
});

Parse.Cloud.afterDelete("Like", function(request, response) {
  var query;
  query = new Parse.Query("Activity");
  query.equalTo("actingUser", request.object.get("actingUser"));
  query.equalTo("entryActedOn", request.object.get("entry"));
  query.equalTo("action", "like");
  console.log("finding activities to destroy");
  return query.find({
    success: function(results) {
      var result, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        console.log("destroying activity");
        _results.push(result.destroy());
      }
      return _results;
    }
  });
});

Parse.Cloud.afterDelete("Animal", function(request, response) {
  var query;
  query = new Parse.Query("AnimalTimelineEntry");
  query.equalTo("animal", {
    "__type": "Pointer",
    "className": "Animal",
    "objectId": request.object.id
  });
  query.find({
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
  query = new Parse.Query("Follow");
  query.equalTo("following", {
    "__type": "Pointer",
    "className": "Animal",
    "objectId": request.object.id
  });
  query.find({
    success: function(results) {
      var result, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        console.log("destroying follow");
        _results.push(result.destroy());
      }
      return _results;
    }
  });
  query = new Parse.Query("Comment");
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
        console.log("destroying comment");
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
