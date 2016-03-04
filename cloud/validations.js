var emailRegEx, usernameRegex;

emailRegEx = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

usernameRegex = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/;

Parse.Cloud.beforeSave(Parse.User, function(request, response) {
  var query;
  console.log("validating user object: " + JSON.stringify(request.object));
  console.log("is new: " + request.object.isNew());
  console.log("auth data: " + (request.object.get("authData") === null));
  if (request.object.get("authData") === null) {
    if (!request.object.get("firstName")) {
      return response.error("Firse name can't be blank.");
    }
    if (!(request.object.get("firstName").length > 1)) {
      return response.error("Firse name can't be less than 2 characters.");
    }
    if (!request.object.get("lastName")) {
      return response.error("Last name can't be blank");
    }
    if (!(request.object.get("lastName").length > 1)) {
      return response.error("Last name can't be shorter than 2 characters.");
    }
    if (!request.object.get("email")) {
      return response.error("Email can't be blank.");
    }
    if (!(request.object.get("email").length > 2)) {
      return response.error("Email can't be shorter than 3 characters.");
    }
    if (!(request.object.get("email").length < 255)) {
      return response.error("Email can't be longer than 254 characters.");
    }
    if (!emailRegEx.test(request.object.get("email"))) {
      return response.error("Email must be a valid email address.");
    }
    if (!request.object.get("username")) {
      return response.error("Username can't be blank.");
    }
    if (!(request.object.get("username").length > 5)) {
      return response.error("Username can't be shorter than 6 characters.");
    }
    if (!(request.object.get("username").length < 25)) {
      return response.error("Username can't be longer than 24 characters.");
    }
    if (!usernameRegex.test(request.object.get("username"))) {
      return response.error("Username must be valid.");
    }
  }
  if (request.object.isNew()) {
    request.object.set("admin", false);
    request.object.save();
  }
  if (request.object.get("username")) {
    console.log("checking username uniqueness");
    request.object.set("username", request.object.get("username").toLowerCase());
    query = new Parse.Query("_User");
    query.equalTo('username', request.object.get('username'));
    if (request.object.id) {
      query.notEqualTo('objectId', request.object.id);
    }
    return query.first({
      useMasterKey: true,
      success: function(object) {
        if (object) {
          return response.error('A user with that username already exists.');
        } else {
          query = new Parse.Query("Animal");
          query.equalTo('username', request.object.get('username'));
          return query.first({
            useMasterKey: true,
            success: function(object) {
              if (object) {
                return response.error('A cat with that username already exists.');
              } else {
                return response.success();
              }
            },
            error: function(error) {
              return response.error(error.message);
            }
          });
        }
      },
      error: function(error) {
        return response.error(error.message);
      }
    });
  } else {
    return response.success();
  }
});

Parse.Cloud.beforeSave("Animal", function(request, response) {
  var query;
  console.log("validating animal object");
  if (!request.object.get("name")) {
    return response.error("Name can't be blank.");
  }
  if (!(request.object.get("name").length > 1)) {
    return response.error("Name can't be less than 2 characters.");
  }
  if (!request.object.get("username")) {
    return response.error("Username can't be blank.");
  }
  if (!(request.object.get("username").length > 4)) {
    return response.error("Username can't be shorter than 5 characters.");
  }
  if (!(request.object.get("username").length < 25)) {
    return response.error("Username can't be longer than 24 characters.");
  }
  if (!usernameRegex.test(request.object.get("username"))) {
    return response.error("Username must be valid.");
  }
  if (!request.object.get("gender")) {
    return response.error("Gender can't be blank.");
  }
  if (request.object.get("username")) {
    console.log("checking username uniqueness");
    request.object.set("username", request.object.get("username").toLowerCase());
    query = new Parse.Query("Animal");
    query.equalTo('username', request.object.get('username'));
    if (request.object.id) {
      query.notEqualTo('objectId', request.object.id);
    }
    return query.first({
      useMasterKey: true,
      success: function(object) {
        console.log("return from username uniqueness check: " + JSON.stringify(object));
        if (object) {
          return response.error('A cat with that username already exists.');
        } else {
          query = new Parse.Query("_User");
          query.equalTo('username', request.object.get('username'));
          return query.first({
            useMasterKey: true,
            success: function(object) {
              if (object) {
                return response.error('A user with that username already exists.');
              } else {
                return response.success();
              }
            },
            error: function(error) {
              return response.error(error.message);
            }
          });
        }
      },
      error: function(error) {
        return response.error(error.message);
      }
    });
  } else {
    return response.success();
  }
});
