# require __dirname + '/app.js'
# require __dirname + '/../server.js'

# Cascading deletes for User
Parse.Cloud.afterDelete Parse.User, (request, response) ->
  query = new Parse.Query("Activity")
  query.equalTo("actingUser", request.object)
  console.log("finding activities to destroy")
  query.find
    useMasterKey: true
    success: (results) ->
      for result in results
        console.log("destroying activity")
        result.destroy
          useMasterKey: true

# Cascading deletes Follow
Parse.Cloud.afterDelete "Follow", (request, response) ->
  query = new Parse.Query("Activity")
  query.equalTo("actingUser", request.object.get("follower"))
  query.equalTo("animalActedOn", request.object.get("following"))
  query.equalTo("action", "follow")
  console.log("finding activities to destroy")
  query.find
    useMasterKey: true
    success: (results) ->
      for result in results
        console.log("destroying activity")
        result.destroy
          useMasterKey: true

# Cascading deletes
# Parse.Cloud.afterDelete "Comment", (request, response) ->


# Parse.Cloud.afterDelete "Like", (request, response) ->


Parse.Cloud.afterDelete "Animal", (request, response) ->
  # destroy all related timeline entries
  query = new Parse.Query("AnimalTimelineEntry")
  query.equalTo("animal", {
      "__type": "Pointer",
      "className": "Animal",
      "objectId": request.object.id
  })
  query.find
    useMasterKey: true
    success: (results) ->
      for result in results
        console.log("destroying entry")
        result.destroy
          useMasterKey: true

  # destroy all related follows
  query = new Parse.Query("Follow")
  query.equalTo("following", {
      "__type": "Pointer",
      "className": "Animal",
      "objectId": request.object.id
  })
  query.find
    useMasterKey: true
    success: (results) ->
      for result in results
        console.log("destroying follow")
        result.destroy
          useMasterKey: true

  # destroy all related comments
  query = new Parse.Query("Comment")
  query.equalTo("animal", {
      "__type": "Pointer",
      "className": "Animal",
      "objectId": request.object.id
  })
  query.find
    useMasterKey: true
    success: (results) ->
      for result in results
        console.log("destroying comment")
        result.destroy
          useMasterKey: true


Parse.Cloud.afterDelete "AnimalTimelineEntry", (request, response) ->
  if request.object.get("type") != "birth"
    query = new Parse.Query("Document")
    query.equalTo("entry", {
        "__type": "Pointer",
        "className": "AnimalTimelineEntry",
        "objectId": request.object.id
    })
    query.find
      useMasterKey: true
      success: (results) ->
        for result in results
          console.log("destroying document")
          result.destroy
            useMasterKey: true

    query = new Parse.Query("Activity")
    query.equalTo("entryActedOn", {
        "__type": "Pointer",
        "className": "AnimalTimelineEntry",
        "objectId": request.object.id
    })
    query.find
      useMasterKey: true
      success: (results) ->
        for result in results
          console.log("destroying activity")
          result.destroy
            useMasterKey: true



Parse.Cloud.afterDelete "Document", (request, response) ->
  query = new Parse.Query("DocumentPage")
  query.equalTo("document", {
      "__type": "Pointer",
      "className": "Document",
      "objectId": request.object.id
  })
  query.find
    useMasterKey: true
    success: (results) ->
      for result in results
        console.log("destroying page")
        result.destroy
          useMasterKey: true
