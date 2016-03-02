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
Parse.Cloud.afterDelete "Comment", (request, response) ->
  query = new Parse.Query("Activity")
  query.equalTo("actingAnimal", request.object.get("animal"))
  query.equalTo("entryActedOn", request.object.get("entry"))
  query.equalTo("entryActedOn", request.object.get("entry"))
  query.equalTo("commentMade", request.object)
  console.log("finding activities to destroy")
  query.find
    useMasterKey: true
    success: (results) ->
      for result in results
        console.log("destroying activity")
        result.destroy
          useMasterKey: true




Parse.Cloud.afterDelete "Like", (request, response) ->
  # query = new Parse.Query("AnimalTimelineEntry")
  # query.equalTo("objectId", request.object.get("entry").id)
  # console.log("finding entry: " + request.object.get("entry").id)
  # query.find
  #   success: (results) ->
  #     console.log("found: " + JSON.stringify(results))
  #     if results.length > 0
  #       entry = results[0]
  #
  #       count = entry.get("likeCount")
  #       if count == null || count == undefined
  #         count = 0
  #       entry.set("likeCount", count - 1)
  #       entry.save(null,
  #         success: (result) ->
  #           console.log("entry saved with like count: " + (count - 1))
  #           # return response.success()
  #       )

  query = new Parse.Query("Activity")
  query.equalTo("actingUser", request.object.get("actingUser"))
  query.equalTo("entryActedOn", request.object.get("entry"))
  query.equalTo("action", "like")
  console.log("finding activities to destroy")
  query.find
    useMasterKey: true
    success: (results) ->
      for result in results
        console.log("destroying activity")
        result.destroy
          useMasterKey: true


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
