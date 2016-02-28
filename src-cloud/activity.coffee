# require __dirname + '/app.js'
# require __dirname + '/../server.js'

# Parse.Cloud.afterSave Parse.Installation, (request, response) ->
#   console.log("new installation: " + JSON.stringify(request))
#
#   query = new Parse.Query(Parse.Installation)
#   # query.notEqualTo "id", request.object.objectId
#
#   query.equalTo("user", request.object.get("user"))
#   query.find
#     success: (results) ->
#       console.log("found: " + results.length)
#       for result in results
#         console.log("destroying previous installation")
#         result.destroy()

generateActivityString = (action, info) ->
  activityString = "Made a new #{action}"

  switch action
    when "follow"
      activityString = "#{info['actingUserName']} started following #{info['animalActedOnName']}"
    when "like"
      activityString = "#{info['actingUserName']} liked your photo"
      switch info['likeAction']
        when "meow"
          activityString = "#{info['actingUserName']} meowed at your photo"
        when "purr"
          activityString = "#{info['actingUserName']} purred at your photo"
        when "lick"
          activityString = "#{info['actingUserName']} licked your photo"
        when "bump"
          activityString = "#{info['actingUserName']} head bumped your photo"
        when "hiss"
          activityString = "#{info['actingUserName']} hissed at your photo"
    when "comment"
      activityString = "#{info['actingAnimalName']} commented on your photo: #{info['commentMadeText']}"

  return activityString



Parse.Cloud.afterSave "Activity", (request, response) ->
  console.log("new activity")

  targetUser = new Parse.User()
  targetUser.id = request.object.get("forUser").id

  pushQuery = new Parse.Query(Parse.Installation)
  pushQuery.equalTo 'user', targetUser

  action = request.object.get("action")

  info =
    'actingUserName': request.object.get('actingUserName')
    'actingAnimalName': request.object.get('actingAnimalName')
    'animalActedOnName': request.object.get('animalActedOnName')
    'commentMadeText': request.object.get('commentMadeText')
    'likeAction': request.object.get('likeAction')

  soundFilename = 'meow1.caf'
  switch info['likeAction']
    when "meow"
      soundFilename = 'meow1.caf'
    when "purr"
      soundFilename = 'purr1.caf'
    when "hiss"
      soundFilename = 'hiss1.caf'
    when "bump"
      soundFilename = 'bump1.caf'
    when "lick"
      soundFilename = 'lick1.caf'

  Parse.Push.send {
    where: pushQuery
    data:
      alert: generateActivityString(action, info)
      sound: soundFilename
  },
    useMasterKey: true
    success: ->
      console.log("notification sent!")
      # return response.success()
    error: (error) ->
      console.log("error sending notification")
      # return response.error(error)



Parse.Cloud.afterSave "Follow", (request, response) ->
  console.log("new follow")

  query = new Parse.Query("Animal")
  query.equalTo("objectId", request.object.get("following").id)
  query.include("owners")
  query.include("foster")
  console.log("finding animal: " + request.object.get("following").id)
  query.find
    useMasterKey: true
    success: (results) ->
      console.log("found: " + results)
      if results.length > 0
        animal = results[0]

        owners = []
        if animal.get("owners")
          owners = animal.get("owners")
        else if animal.get("foster")
          owners = [animal.get("foster")]

        console.log("owners: " + owners)

        for owner in owners

          activity = new Parse.Object("Activity")
          activity.set("action", "follow")

          userId = request.object.get("follower").id
          activity.set("actingUser", {
            "__type": "Pointer",
            "className": "_User",
            "objectId": userId
          })

          userQuery = new Parse.Query("_User")
          userQuery.get userId,
            useMasterKey: true
            success: (user) ->

              activity.set("actingUserName", user.get('username'))

              animalId = request.object.get("following").id
              activity.set("animalActedOn", {
                "__type": "Pointer",
                "className": "Animal",
                "objectId": animalId
              })

              animalQuery = new Parse.Query("Animal")
              animalQuery.get animalId,
                useMasterKey: true
                success: (animal) ->
                  console.log("CCCC animal: " + JSON.stringify(animal))

                  activity.set("animalActedOnName", animal.get('username'))

                  activity.set("forUser", {
                    "__type": "Pointer",
                    "className": "_User",
                    "objectId": owner.id
                  })

                  console.log("saving activity")
                  activity.save(null,
                    useMasterKey: true
                    success: (result) ->
                      console.log("activity saved: " + result)
                      # return response.success()
                  )


Parse.Cloud.afterSave "Like", (request, response) ->
  console.log("new like")

  query = new Parse.Query("AnimalTimelineEntry")
  query.equalTo("objectId", request.object.get("entry").id)
  query.include("createdBy")
  query.include("animal")
  console.log("finding entry: " + request.object.get("entry").id)
  query.find
    useMasterKey: true
    success: (results) ->
      console.log("found: " + JSON.stringify(results))
      if results.length > 0
        entry = results[0]
        animal = entry.get("animal")

        ownerId = ""
        if animal.get("owner")
          ownerId = animal.get("owner").id
        else if animal.get("foster")
          ownerId = animal.get("foster").id

        console.log("ownerId: " + ownerId)

        if ownerId != request.object.get("actingUser").id
          activity = new Parse.Object("Activity")
          activity.set("action", "like")
          activity.set("likeAction", request.object.get("action"))

          userId = request.object.get("actingUser").id
          activity.set("actingUser", {
            "__type": "Pointer",
            "className": "_User",
            "objectId": userId
          })

          userQuery = new Parse.Query("_User")
          userQuery.get userId,
            useMasterKey: true
            success: (user) ->

              activity.set("actingUserName", user.get('username'))

              activity.set("entryActedOn", {
                "__type": "Pointer",
                "className": "AnimalTimelineEntry",
                "objectId": request.object.get("entry").id
              })

              activity.set("forUser", {
                "__type": "Pointer",
                "className": "_User",
                "objectId": ownerId
              })

              console.log("saving activity")
              activity.save(null,
                useMasterKey: true
                success: (result) ->
                  console.log("activity saved: " + result)
                  # return response.success()
              )



Parse.Cloud.afterSave "Comment", (request, response) ->
  console.log("new comment")

  query = new Parse.Query("AnimalTimelineEntry")
  query.equalTo("objectId", request.object.get("entry").id)
  query.include("createdBy")
  query.include("animal")
  query.find
    useMasterKey: true
    success: (results) ->
      console.log("found: " + results)
      if results.length > 0
        entry = results[0]

        console.log("entry: " + JSON.stringify(entry))

        ownerId = ""
        if entry.get("createdBy")
          ownerId = entry.get("createdBy").id

        console.log("ownerId: " + ownerId)

        activity = new Parse.Object("Activity")
        activity.set("action", "comment")

        animalId = request.object.get("animal").id

        activity.set("actingAnimal", {
          "__type": "Pointer",
          "className": "Animal",
          "objectId": animalId
        })

        animalQuery = new Parse.Query("Animal")
        animalQuery.get animalId,
          useMasterKey: true
          success: (animal) ->
            activity.set("actingAnimalName", animal.get('username'))

            activity.set("entryActedOn", {
              "__type": "Pointer",
              "className": "AnimalTimelineEntry",
              "objectId": request.object.get("entry").id
            })

            activity.set("commentMade", request.object)
            activity.set("commentMadeText", request.object.get("text"))

            activity.set("forUser", {
              "__type": "Pointer",
              "className": "_User",
              "objectId": ownerId
            })

            console.log("saving activity")
            activity.save(null,
              useMasterKey: true
              success: (result) ->
                console.log("activity saved: " + result)
                # return response.success()
            )

          error: (error) ->
            console.log 'ERROR: ' + error
