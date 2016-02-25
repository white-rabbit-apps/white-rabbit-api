var generateActivityString;

generateActivityString = function(action, info) {
  var activityString;
  activityString = "Made a new " + action;
  switch (action) {
    case "follow":
      activityString = "" + info['actingUserName'] + " started following " + info['animalActedOnName'];
      break;
    case "like":
      activityString = "" + info['actingUserName'] + " loved your photo";
      break;
    case "comment":
      activityString = "" + info['actingAnimalName'] + " commented on your photo: " + info['commentMadeText'];
  }
  return activityString;
};

Parse.Cloud.afterSave("Activity", function(request, response) {
  var action, info, pushQuery, targetUser;
  console.log("new activity");
  targetUser = new Parse.User();
  targetUser.id = request.object.get("forUser").id;
  pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo('user', targetUser);
  action = request.object.get("action");
  info = {
    'actingUserName': request.object.get('actingUserName'),
    'actingAnimalName': request.object.get('actingAnimalName'),
    'animalActedOnName': request.object.get('animalActedOnName'),
    'commentMadeText': request.object.get('commentMadeText')
  };
  return Parse.Push.send({
    where: pushQuery,
    data: {
      alert: generateActivityString(action, info),
      sound: 'hiss1.caf'
    }
  }, {
    useMasterKey: true,
    success: function() {
      return console.log("notification sent!");
    },
    error: function(error) {
      return console.log("error sending notification");
    }
  });
});

Parse.Cloud.afterSave("Follow", function(request, response) {
  var query;
  console.log("new follow");
  query = new Parse.Query("Animal");
  query.equalTo("objectId", request.object.get("following").id);
  query.include("owner");
  query.include("foster");
  console.log("finding animal: " + request.object.get("following").id);
  return query.find({
    useMasterKey: true,
    success: function(results) {
      var activity, animal, ownerId, userId, userQuery;
      console.log("found: " + results);
      if (results.length > 0) {
        animal = results[0];
        ownerId = "";
        if (animal.get("owner")) {
          ownerId = animal.get("owner").id;
        } else if (animal.get("foster")) {
          ownerId = animal.get("foster").id;
        }
        console.log("ownerId: " + ownerId);
        activity = new Parse.Object("Activity");
        activity.set("action", "follow");
        userId = request.object.get("follower").id;
        activity.set("actingUser", {
          "__type": "Pointer",
          "className": "_User",
          "objectId": userId
        });
        userQuery = new Parse.Query("_User");
        return userQuery.get(userId, {
          useMasterKey: true,
          success: function(user) {
            var animalId, animalQuery;
            activity.set("actingUserName", user.get('username'));
            animalId = request.object.get("following").id;
            activity.set("animalActedOn", {
              "__type": "Pointer",
              "className": "Animal",
              "objectId": animalId
            });
            animalQuery = new Parse.Query("Animal");
            return animalQuery.get(animalId, {
              useMasterKey: true,
              success: function(animal) {
                console.log("CCCC animal: " + JSON.stringify(animal));
                activity.set("animalActedOnName", animal.get('username'));
                activity.set("forUser", {
                  "__type": "Pointer",
                  "className": "_User",
                  "objectId": ownerId
                });
                console.log("saving activity");
                return activity.save(null, {
                  useMasterKey: true,
                  success: function(result) {
                    return console.log("activity saved: " + result);
                  }
                });
              }
            });
          }
        });
      }
    }
  });
});

Parse.Cloud.afterSave("Like", function(request, response) {
  var query;
  console.log("new like");
  query = new Parse.Query("AnimalTimelineEntry");
  query.equalTo("objectId", request.object.get("entry").id);
  query.include("createdBy");
  query.include("animal");
  console.log("finding entry: " + request.object.get("entry").id);
  return query.find({
    useMasterKey: true,
    success: function(results) {
      var activity, animal, entry, ownerId, userId, userQuery;
      console.log("found: " + JSON.stringify(results));
      if (results.length > 0) {
        entry = results[0];
        animal = entry.get("animal");
        ownerId = "";
        if (animal.get("owner")) {
          ownerId = animal.get("owner").id;
        } else if (animal.get("foster")) {
          ownerId = animal.get("foster").id;
        }
        console.log("ownerId: " + ownerId);
        if (ownerId !== request.object.get("actingUser").id) {
          activity = new Parse.Object("Activity");
          activity.set("action", "like");
          userId = request.object.get("actingUser").id;
          activity.set("actingUser", {
            "__type": "Pointer",
            "className": "_User",
            "objectId": userId
          });
          userQuery = new Parse.Query("_User");
          return userQuery.get(userId, {
            useMasterKey: true,
            success: function(user) {
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
              console.log("saving activity");
              return activity.save(null, {
                useMasterKey: true,
                success: function(result) {
                  return console.log("activity saved: " + result);
                }
              });
            }
          });
        }
      }
    }
  });
});

Parse.Cloud.afterSave("Comment", function(request, response) {
  var query;
  console.log("new comment");
  query = new Parse.Query("AnimalTimelineEntry");
  query.equalTo("objectId", request.object.get("entry").id);
  query.include("createdBy");
  query.include("animal");
  return query.find({
    useMasterKey: true,
    success: function(results) {
      var activity, animalId, animalQuery, entry, ownerId;
      console.log("found: " + results);
      if (results.length > 0) {
        entry = results[0];
        console.log("entry: " + JSON.stringify(entry));
        ownerId = "";
        if (entry.get("createdBy")) {
          ownerId = entry.get("createdBy").id;
        }
        console.log("ownerId: " + ownerId);
        activity = new Parse.Object("Activity");
        activity.set("action", "comment");
        animalId = request.object.get("animal").id;
        activity.set("actingAnimal", {
          "__type": "Pointer",
          "className": "Animal",
          "objectId": animalId
        });
        animalQuery = new Parse.Query("Animal");
        return animalQuery.get(animalId, {
          useMasterKey: true,
          success: function(animal) {
            activity.set("actingAnimalName", animal.get('username'));
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
            console.log("saving activity");
            return activity.save(null, {
              useMasterKey: true,
              success: function(result) {
                return console.log("activity saved: " + result);
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
});
