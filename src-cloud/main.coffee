require __dirname + '/validations.js'
require __dirname + '/deletes.js'
require __dirname + '/activity.js'

lolspeak = require('lolspeak')

ig = require('instagram-node').instagram()
ig.use
  client_id: '09214a4e95494f70873ea3f8c7c82960'
  client_secret: '18c7f3e84ee54c429364ad48f8a00146'


Parse.Cloud.define 'translate', (request, response) ->
  console.log 'translating'

  message = request.params.message
  translated_message = lolspeak(message)

  return response.success(translated_message)


Parse.Cloud.define 'importInstagramPhotos', (request, response) ->
  console.log 'importing instagram photos'
  animalObjectId = request.params.animalObjectId
  instagramUsername = request.params.instagramUsername

  ig.user_search(instagramUsername, (err, users, remaining, limit) ->
    console.log 'finished searching users: ' + JSON.stringify(users)
    if(!err)
      console.log 'no error searching users'
      user = users[0]
      for u in users
        if u["username"] == instagramUsername
          user = u

      console.log 'user: ' + JSON.stringify(user)
      ig.user_media_recent(user["id"], {"count": 1000}, (err, medias, pagination, remaining, limit) ->
        if(err)
          console.log 'error searching media: ' + JSON.stringify(err)
          return

        console.log 'finished searching media: ' + JSON.stringify(medias)

        query = new Parse.Query("Animal")
        query.equalTo("objectId", animalObjectId)
        console.log("finding animal: " + animalObjectId)
        query.find
          useMasterKey: true
          success: (results) ->
            console.log("found animals: " + results)
            if results.length > 0
              animal = results[0]

              console.log 'found animal: ' + JSON.stringify(animal)
              console.log 'media size: ' + medias.length

              for media in medias
                media_id = media["id"]
                media_caption = media["caption"]["text"]
                media_date = new Date(parseInt(media["created_time"]) * 1000)
                media_url = media["images"]["standard_resolution"]["url"]
                console.log 'media: ' + JSON.stringify(media)

                timelineEntry = new Parse.Object("AnimalTimelineEntry")
                timelineEntry.set("instagramId", media_id)
                timelineEntry.set("text", media_caption)
                timelineEntry.set("type", "image")
                timelineEntry.set("date", media_date)
                timelineEntry.set("createdAt", media_date)
                timelineEntry.set("imageUrl", media_url)
                timelineEntry.set("animal", animal)

                timelineEntry.save(null,
                  useMasterKey: true
                  success: (result) ->
                    console.log("timeline entry saved: " + JSON.stringify(result))
                    return
                  error: (error) ->
                    console.log("error: " + JSON.stringify(error))
                    return
                )

              return response.success()
      )
  )


Parse.Cloud.beforeSave "AnimalTimelineEntry", (request, response) ->
  console.log("creating timeline entry: " + JSON.stringify(request))

  ## Check if there's already a timeline entry for that instagram photo
  if !request.object.existed() && request.object.get("instagramId")
    timelineEntryQuery = new Parse.Query("AnimalTimelineEntry")
    timelineEntryQuery.equalTo("instagramId", request.object.get("instagramId"))
    timelineEntryQuery.equalTo("animal", request.object.get("animal"))
    timelineEntryQuery.find
      useMasterKey: true
      success: (results) ->
        if results.length == 0
          console.log("found no timeline entries")
          return response.success()
        else
          console.log("already have a timeline entry for that photo")
          return response.error("Already have a timeline entry for that instagram photo")
  else
    return response.success()



# sendgrid = require("sendgrid")
# sendgrid.initialize("michaelbina", "m8E-gWK-tL6-zvu");


Parse.Cloud.afterSave "AnimalTransfer", (request, response) ->
  console.log 'attempting email for animal transfer'
  # sendgrid.sendEmail(
  #   to: [ 'michaelbina@icloud.com' ]
  #   from: 'support@whiterabbitapps.net'
  #   subject: 'You\'ve been invited to take over'
  #   text: 'Congratulations on your new family member!'
  #   replyto: 'support@whiterabbitapps.net').then ((httpResponse) ->
  #   console.log httpResponse
  # ), (httpResponse) ->
  #   console.error httpResponse


shareToFacebook = (forUser, message, link) ->
  console.log 'sharing to facebook'

  userQuery = new Parse.Query(Parse.User)
  userQuery.get(forUser.id,
    useMasterKey: true
  ).then((user) ->
    console.log 'User: ' + JSON.stringify(user)

    # if user.get('authData') && user.get('authData').facebook
    if Parse.FacebookUtils.isLinked(user)
      console.log 'token: ' + user.get('authData').facebook.access_token

      Parse.Cloud.httpRequest(
        method: 'POST'
        url: 'https://graph.facebook.com/me/feed'
        params:
          access_token: user.get('authData').facebook.access_token
          message: message
          link: link
      ).then ((httpResponse) ->
        console.log("back from http request")
      ), (error) ->
        console.log("error with http request: " + error.data.error.message)
        return response.error(error.data.error.message)
    else
      return Parse.Promise.error('user not linked to fb account')
  )


Parse.Cloud.afterSave "AnimalTimelineEntry", (request, response) ->
  console.log("timeline entry created: " + JSON.stringify(request))
  console.log("shareToFacebook: " + request.object.get("shareToFacebook"))
  console.log("shareToTwitter: " + request.object.get("shareToTwitter"))

  if(request.object.get("shareToFacebook"))
    console.log("sharing to Facebook for: " + request.object.get("createdBy").id)

    user = request.object.get("createdBy")
    entryText = request.object.get("text")

    entryId = request.object.id
    animal = request.object.get("animal")

    animalQuery = new Parse.Query("Animal")
    animalQuery.get(animal.id,
      useMasterKey: true
    ).then((animal) ->
      console.log 'Animal: ' + JSON.stringify(animal)

      username = animal.get("username")
      link = "http://www.whiterabbitapps.net/cat/" + username + "/" + entryId

      shareToFacebook(user, entryText, link)
    )

  if(request.object.get("shareToTwitter"))
    console.log("sharing to Twitter for: " + request.object.get("createdBy").id)

  return response.success()



Parse.Cloud.afterSave "AnimalTransfer", (request, response) ->
  console.log 'creating activity for animal transfer'

  if(request.object.get("status") == "accepted")
    console.log 'animal transfer has been accepted'

    if(request.object.get("type") == "Adopter")
      console.log 'animal transfer has been accepted for an adopter'

      entry = new Parse.Object("AnimalTimelineEntry")
      entry.set("type", "adopted")
      entry.set("animal", request.object.get("animal"))
      entry.set("text", "Adopted by")
      entry.set("actingUser", request.object.get("acceptedByUser"))
      entry.set("date", {
          "__type": "Date",
          "iso": (new Date()).toISOString()
      })
      console.log("saving entry")
      entry.save(null,
        useMasterKey: true
        success: (result) ->
          console.log("saved: " + result.id)
          return response.success()
        error: (error) ->
          return response.error(error.message)
      )

    if(request.object.get("type") == "Foster")
      console.log 'animal transfer has been accepted for an foster'

      entry = new Parse.Object("AnimalTimelineEntry")
      entry.set("type", "fostered")
      entry.set("animal", request.object.get("animal"))
      entry.set("text", "Started being fostered by")
      entry.set("actingUser", request.object.get("acceptedByUser"))
      entry.set("date", {
          "__type": "Date",
          "iso": (new Date()).toISOString()
      })
      console.log("saving entry")
      entry.save(null,
        useMasterKey: true
        success: (result) ->
          console.log("saved: " + result.id)
          return response.success()
        error: (error) ->
          return response.error(error.message)
      )


Parse.Cloud.afterSave "Animal", (request, response) ->
  console.log("afterSave: " + request.object.id)
  if request.object.get("birthDate")
    console.log("has birthday")
    query = new Parse.Query("AnimalTimelineEntry")
    query.equalTo("animal", {
        "__type": "Pointer",
        "className": "Animal",
        "objectId": request.object.id
    })
    query.equalTo("type", "birth")
    query.find
      useMasterKey: true
      success: (results) ->
        console.log("results: " + results)
        console.log("request: " + request.object.get("birthDate").toISOString())

        for result in results
          console.log("destroying entry")
          result.destroy
            useMasterKey: true

        entry = new Parse.Object("AnimalTimelineEntry")
        entry.set("type", "birth")
        entry.set("animal", {
            "__type": "Pointer",
            "className": "Animal",
            "objectId": request.object.id
        })
        entry.set("text", "Born")
        entry.set("date", {
            "__type": "Date",
            "iso": request.object.get("birthDate").toISOString()
        })
        console.log("saving entry")
        entry.save(null,
          useMasterKey: true
          success: (result) ->
            console.log("saved: " + result.id)
            return response.success()
          error: (error) ->
            return response.error(error.message)
        )
      error: (error) ->
        return response.error(error.message)



# After creating a like, increment the likeCount on the entry
Parse.Cloud.afterSave "Like", (request, response) ->
  console.log("new like - incrementing count")

  query = new Parse.Query("AnimalTimelineEntry")
  query.equalTo("objectId", request.object.get("entry").id)
  console.log("finding entry: " + request.object.get("entry").id)
  query.find
    useMasterKey: true
    success: (results) ->
      console.log("found - incrementing count: " + JSON.stringify(results))
      if results.length > 0
        entry = results[0]
        if entry.get("likeCount")
          likeCount = parseInt(entry.get("likeCount"), 10)
        else
          likeCount = 0

        console.log("likeCount before: " + likeCount)

        entry.set("likeCount", likeCount + 1)

        entry.save(null,
          useMasterKey: true
          success: (result) ->
            console.log("entry saved: " + result)
            return response.success()
        )
  return response.success()


# After deleting a like, decrement the likeCount on the entry
Parse.Cloud.afterDelete "Like", (request, response) ->
  console.log("deleted like - decrementing count")
  query = new Parse.Query("AnimalTimelineEntry")
  query.equalTo("objectId", request.object.get("entry").id)
  console.log("finding entry: " + request.object.get("entry").id)
  query.find
    useMasterKey: true
    success: (results) ->
      console.log("found - decrementing count: " + JSON.stringify(results))
      if results.length > 0
        entry = results[0]
        if entry.get("likeCount")
          likeCount = parseInt(entry.get("likeCount"), 10)
        else
          likeCount = 0

        console.log("likeCount before: " + likeCount)

        entry.set("likeCount", likeCount - 1)

        entry.save(null,
          useMasterKey: true
          success: (result) ->
            console.log("entry saved: " + result)
            return response.success()
        )
  return response.success()



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

        # ownerId = ""
        # if entry.get("createdBy")
        #   ownerId = entry.get("createdBy").id
        #
        # console.log("ownerId: " + ownerId)

        activity = new Parse.Object("Activity")
        activity.set("action", "comment")

        animalId = request.object.get("animal").id

        actedOnAnimalId = entry.get("animal").id

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

            # console.log("creating activity for owner: " + ownerId)

            actedOnAnimalQuery = new Parse.Query("Animal")
            actedOnAnimalQuery.get actedOnAnimalId,
              useMasterKey: true
              success: (actedOnAnimal) ->

                owners = []
                if actedOnAnimal.get("owners")
                  owners = actedOnAnimal.get("owners")
                else if actedOnAnimal.get("foster")
                  owners = [actedOnAnimal.get("foster")]

                console.log("owners: " + owners)

                for owner in owners

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
          error: (error) ->
            console.log 'ERROR: ' + error


  console.log("new comment - incrementing count")

  query = new Parse.Query("AnimalTimelineEntry")
  query.equalTo("objectId", request.object.get("entry").id)
  query.find
    useMasterKey: true
    success: (results) ->
      console.log("found - incrementing count: " + JSON.stringify(results))
      if results.length > 0
        entry = results[0]
        if entry.get("commentCount")
          likeCount = parseInt(entry.get("commentCount"), 10)
        else
          likeCount = 0

        entry.set("commentCount", likeCount + 1)

        entry.save(null,
          useMasterKey: true
          success: (result) ->
            console.log("entry saved: " + result)
            # return response.success()
        )
  # return response.success()


# After deleting a like, decrement the likeCount on the entry
Parse.Cloud.afterDelete "Comment", (request, response) ->
  console.log("deleted comment - decrementing count")
  query = new Parse.Query("AnimalTimelineEntry")
  query.equalTo("objectId", request.object.get("entry").id)
  console.log("finding entry: " + request.object.get("entry").id)
  query.find
    useMasterKey: true
    success: (results) ->
      console.log("found - decrementing count: " + JSON.stringify(results))
      if results.length > 0
        entry = results[0]
        if entry.get("commentCount")
          commentCount = parseInt(entry.get("commentCount"), 10)
        else
          commentCount = 0

        console.log("commentCount before: " + commentCount)

        entry.set("commentCount", commentCount - 1)

        entry.save(null,
          useMasterKey: true
          success: (result) ->
            console.log("entry saved: " + result)
            return response.success()
        )
  return response.success()
