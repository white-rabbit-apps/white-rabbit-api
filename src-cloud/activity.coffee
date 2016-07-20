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
          activityString = "#{info['actingUserName']} meowed at your photo 😺"
        when "purr"
          activityString = "#{info['actingUserName']} purred at your photo 😻"
        when "lick"
          activityString = "#{info['actingUserName']} licked your photo 😽"
        when "bump"
          activityString = "#{info['actingUserName']} head bumped your photo 😸"
        when "hiss"
          activityString = "#{info['actingUserName']} hissed at your photo 😼"
    when "poke"
      activityString = "#{info['actingUserName']} poked you"
      switch info['likeAction']
        when "meow"
          activityString = "#{info['actingUserName']} meowed at you 😺"
        when "purr"
          activityString = "#{info['actingUserName']} purred at you 😻"
        when "lick"
          activityString = "#{info['actingUserName']} licked you 😽"
        when "bump"
          activityString = "#{info['actingUserName']} head bumped you 😸"
        when "hiss"
          activityString = "#{info['actingUserName']} hissed at you! 😼"
    when "comment"
      activityString = "#{info['actingAnimalName']} commented on your photo: #{info['commentMadeText']}"

  return activityString


sendPushNotification = (userToSendTo, message, sound) ->
  console.log("Sending push notification")

  pushQuery = new Parse.Query(Parse.Installation)
  pushQuery.equalTo 'user', userToSendTo

  soundsDirectory = 'sound/'
  soundFilename = 'meow1.caf'
  switch sound
    when "meow"
      soundFilename = 'meow1.caf'
    when "purr"
      soundFilename = 'purr1.caf'
    when "hiss"
      soundFilename = 'hiss1.caf'
    when "bump"
      soundFilename = 'chirp1.caf'
    when "lick"
      soundFilename = 'lick2.caf'

  uriPrefix = "communikitty-dev://"
  if (process.env.ENV == 'production')
    uriPrefix = "communikitty://"

  Parse.Push.send {
    where: pushQuery
    data:
      alert: message
      sound: soundFilename
      uri: uriPrefix + "notifications"
      # content-available: 1
      # badge: "Increment"
  },
    useMasterKey: true
    success: ->
      console.log("notification sent!")
    error: (error) ->
      console.log("error sending notification")



Parse.Cloud.afterSave "Activity", (request, response) ->
  console.log("new activity")

  targetUser = request.object.get("forUser")

  action = request.object.get("action")
  info =
    'actingUserName': request.object.get('actingUserName')
    'actingAnimalName': request.object.get('actingAnimalName')
    'animalActedOnName': request.object.get('animalActedOnName')
    'commentMadeText': request.object.get('commentMadeText')
    'likeAction': request.object.get('likeAction')

  message = generateActivityString(action, info)
  sound = info['likeAction']

  sendPushNotification(targetUser, message, sound)

Parse.Cloud.afterSave "Poke", (request, response) ->
  console.log("new poke")

  console.log("finding user: " + request.object.get("userActedOn").id)

  userQuery = new Parse.Query("_User")
  userQuery.get request.object.get("userActedOn").id,
    useMasterKey: true
    success: (user) ->
      activity = new Parse.Object("Activity")

      activity.set("actingUserName", request.object.get("actingUserName"))
      activity.set("action", "poke")
      activity.set("likeAction", request.object.get("action"))

      activity.set("actingUser", {
        "__type": "Pointer",
        "className": "_User",
        "objectId": request.object.get("actingUser").id
      })

      activity.set("forUser", {
        "__type": "Pointer",
        "className": "_User",
        "objectId": request.object.get("userActedOn").id
      })

      console.log("saving activity")
      activity.save(null,
        useMasterKey: true
        success: (result) ->
          console.log("activity saved: " + result)
          # return response.success()
      )


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

          console.log("creating activity for owner: " + owner.id)

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


# Parse.Cloud.afterSave "Like", (request, response) ->


# Parse.Cloud.afterSave "Comment", (request, response) ->
