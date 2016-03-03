# require __dirname + '/app.js'
# require __dirname + '/../server.js'

emailRegEx = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
usernameRegex = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/

######
# User object validation
######
Parse.Cloud.beforeSave Parse.User, (request, response) ->
  console.log("validating user object: " + JSON.stringify(request.object))
  console.log("is new: " + request.object.isNew())
  console.log("auth data: " + (request.object.get("authData") == null))

  if request.object.get("authData") == null
    unless request.object.get("firstName")
    		return response.error("Firse name can't be blank.")
    unless request.object.get("firstName").length > 1
    		return response.error("Firse name can't be less than 2 characters.")

    unless request.object.get("lastName")
    		return response.error("Last name can't be blank")
    unless request.object.get("lastName").length > 1
    		return response.error("Last name can't be shorter than 2 characters.")

    unless request.object.get("email")
    		return response.error("Email can't be blank.")
    unless request.object.get("email").length > 2
    		return response.error("Email can't be shorter than 3 characters.")
    unless request.object.get("email").length < 255
    		return response.error("Email can't be longer than 254 characters.")
    unless emailRegEx.test(request.object.get("email"))
    		return response.error("Email must be a valid email address.")

    unless request.object.get("username")
    		return response.error("Username can't be blank.")
    unless request.object.get("username").length > 5
    		return response.error("Username can't be shorter than 6 characters.")
    unless request.object.get("username").length < 25
    		return response.error("Username can't be longer than 24 characters.")
    unless usernameRegex.test(request.object.get("username"))
    		return response.error("Username must be valid.")

  if request.object.isNew()
    request.object.set("admin", false)
    request.object.save()

  if request.object.get("username")
    console.log("checking username uniqueness")
    request.object.set("username", request.object.get("username").toLowerCase())
    query = new Parse.Query("_User")
    query.equalTo 'username', request.object.get('username')
    if request.object.id
      query.notEqualTo 'objectId', request.object.id
    query.first
      useMasterKey: true
      success: (object) ->
        if object
          return response.error 'A user with that username already exists.'
        else
          query = new Parse.Query("Animal")
          query.equalTo 'username', request.object.get('username')
          query.first
            useMasterKey: true
            success: (object) ->
              if object
                return response.error 'A user with that username already exists.'
              else
                return response.success()
            error: (error) ->
              return response.error error.message
      error: (error) ->
        return response.error error.message
        # return response.error 'Could not validate uniqueness for that username.'
  else
    return response.success()




######
# Animal object validation
######
Parse.Cloud.beforeSave "Animal", (request, response) ->
  console.log("validating animal object")

  unless request.object.get("name")
  		return response.error("Name can't be blank.")
  unless request.object.get("name").length > 1
  		return response.error("Name can't be less than 2 characters.")

  unless request.object.get("username")
  		return response.error("Username can't be blank.")
  unless request.object.get("username").length > 4
  		return response.error("Username can't be shorter than 5 characters.")
  unless request.object.get("username").length < 25
  		return response.error("Username can't be longer than 24 characters.")
  unless usernameRegex.test(request.object.get("username"))
  		return response.error("Username must be valid.")

  unless request.object.get("gender")
  		return response.error("Gender can't be blank.")

  if request.object.get("username")
    console.log("checking username uniqueness")
    request.object.set("username", request.object.get("username").toLowerCase())
    query = new Parse.Query("Animal")
    query.equalTo 'username', request.object.get('username')
    if request.object.id
      query.notEqualTo 'objectId', request.object.id
    query.first
      useMasterKey: true
      success: (object) ->
        console.log("return from username uniqueness check: " + JSON.stringify(object))
        if object
          console.log("username is not unique")
          return response.error 'A cat with that username already exists.'
        else
          console.log("username is unique for animals")

          query = new Parse.Query("_User")
          query.equalTo 'username', request.object.get('username')
          query.first
            useMasterKey: true
            success: (object) ->
              console.log("return from user username uniqueness check: " + JSON.stringify(object))
              if object
                console.log("user username is not unique")
                return response.error 'A user with that username already exists.'
              else
                console.log("user username is unique")
                return response.success()
            error: (error) ->
              return response.error error.message
      error: (error) ->
        return response.error error.message
        # return response.error 'Could not validate uniqueness for that username.'
  else
    return response.success()


Parse.Cloud.beforeSave "AnimalTimelineEntry", (request, response) ->
  console.log("validating entry object")

  if (!request.object.get("hasDocuments"))
    request.object.set("hasDocuments", false)

  if request.object.isNew()
    request.object.set("likeCount", 0)
    request.object.save()

  return response.success()
