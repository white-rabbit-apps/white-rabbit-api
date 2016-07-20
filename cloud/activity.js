var generateActivityString, generateRelativeUri, sendPushNotification;

generateRelativeUri = function(action, info) {
  var uriString;
  uriString = "notifications";
  switch (action) {
    case "follow":
      uriString = "human/" + info['actingUserName'];
      break;
    case "like":
      uriString = "notifications";
      break;
    case "poke":
      uriString = "human/" + info['actingUserName'];
      break;
    case "comment":
      uriString = "cat/" + info['actingAnimalName'];
  }
  return uriString;
};

generateActivityString = function(action, info) {
  var activityString;
  activityString = "Made a new " + action;
  switch (action) {
    case "follow":
      activityString = "" + info['actingUserName'] + " started following " + info['animalActedOnName'];
      break;
    case "like":
      activityString = "" + info['actingUserName'] + " liked your photo";
      switch (info['likeAction']) {
        case "meow":
          activityString = "" + info['actingUserName'] + " meowed at your photo 😺";
          break;
        case "purr":
          activityString = "" + info['actingUserName'] + " purred at your photo 😻";
          break;
        case "lick":
          activityString = "" + info['actingUserName'] + " licked your photo 😽";
          break;
        case "bump":
          activityString = "" + info['actingUserName'] + " head bumped your photo 😸";
          break;
        case "hiss":
          activityString = "" + info['actingUserName'] + " hissed at your photo 😼";
      }
      break;
    case "poke":
      activityString = "" + info['actingUserName'] + " poked you";
      switch (info['likeAction']) {
        case "meow":
          activityString = "" + info['actingUserName'] + " meowed at you 😺";
          break;
        case "purr":
          activityString = "" + info['actingUserName'] + " purred at you 😻";
          break;
        case "lick":
          activityString = "" + info['actingUserName'] + " licked you 😽";
          break;
        case "bump":
          activityString = "" + info['actingUserName'] + " head bumped you 😸";
          break;
        case "hiss":
          activityString = "" + info['actingUserName'] + " hissed at you! 😼";
      }
      break;
    case "comment":
      activityString = "" + info['actingAnimalName'] + " commented on your photo: " + info['commentMadeText'];
  }
  return activityString;
};

sendPushNotification = function(userToSendTo, message, sound, relativeUri) {
  var pushQuery, soundFilename, soundsDirectory, uriPrefix;
  console.log("Sending push notification");
  pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo('user', userToSendTo);
  soundsDirectory = 'sound/';
  soundFilename = 'meow1.caf';
  switch (sound) {
    case "meow":
      soundFilename = 'meow1.caf';
      break;
    case "purr":
      soundFilename = 'purr1.caf';
      break;
    case "hiss":
      soundFilename = 'hiss1.caf';
      break;
    case "bump":
      soundFilename = 'chirp1.caf';
      break;
    case "lick":
      soundFilename = 'lick2.caf';
  }
  uriPrefix = "communikittydev://";
  if (process.env.ENV === 'production') {
    uriPrefix = "communikitty://";
  }
  return Parse.Push.send({
    where: pushQuery,
    data: {
      alert: message,
      sound: soundFilename,
      uri: uriPrefix + relativeUri
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
};

Parse.Cloud.afterSave("Activity", function(request, response) {
  var action, info, message, relativeUri, sound, targetUser;
  console.log("new activity");
  targetUser = request.object.get("forUser");
  action = request.object.get("action");
  info = {
    'actingUserName': request.object.get('actingUserName'),
    'actingAnimalName': request.object.get('actingAnimalName'),
    'animalActedOnName': request.object.get('animalActedOnName'),
    'commentMadeText': request.object.get('commentMadeText'),
    'likeAction': request.object.get('likeAction')
  };
  message = generateActivityString(action, info);
  relativeUri = generateRelativeUri(action, info);
  sound = info['likeAction'];
  return sendPushNotification(targetUser, message, sound, relativeUri);
});

Parse.Cloud.afterSave("Poke", function(request, response) {
  var userQuery;
  console.log("new poke");
  console.log("finding user: " + request.object.get("userActedOn").id);
  userQuery = new Parse.Query("_User");
  return userQuery.get(request.object.get("userActedOn").id, {
    useMasterKey: true,
    success: function(user) {
      var activity;
      activity = new Parse.Object("Activity");
      activity.set("actingUserName", request.object.get("actingUserName"));
      activity.set("action", "poke");
      activity.set("likeAction", request.object.get("action"));
      activity.set("actingUser", {
        "__type": "Pointer",
        "className": "_User",
        "objectId": request.object.get("actingUser").id
      });
      activity.set("forUser", {
        "__type": "Pointer",
        "className": "_User",
        "objectId": request.object.get("userActedOn").id
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
});

Parse.Cloud.afterSave("Follow", function(request, response) {
  var query;
  console.log("new follow");
  query = new Parse.Query("Animal");
  query.equalTo("objectId", request.object.get("following").id);
  query.include("owners");
  query.include("foster");
  console.log("finding animal: " + request.object.get("following").id);
  return query.find({
    useMasterKey: true,
    success: function(results) {
      var activity, animal, owner, owners, userId, userQuery, _i, _len, _results;
      console.log("found: " + results);
      if (results.length > 0) {
        animal = results[0];
        owners = [];
        if (animal.get("owners")) {
          owners = animal.get("owners");
        } else if (animal.get("foster")) {
          owners = [animal.get("foster")];
        }
        console.log("owners: " + owners);
        _results = [];
        for (_i = 0, _len = owners.length; _i < _len; _i++) {
          owner = owners[_i];
          console.log("creating activity for owner: " + owner.id);
          activity = new Parse.Object("Activity");
          activity.set("action", "follow");
          userId = request.object.get("follower").id;
          activity.set("actingUser", {
            "__type": "Pointer",
            "className": "_User",
            "objectId": userId
          });
          userQuery = new Parse.Query("_User");
          _results.push(userQuery.get(userId, {
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
                    "objectId": owner.id
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
          }));
        }
        return _results;
      }
    }
  });
});
