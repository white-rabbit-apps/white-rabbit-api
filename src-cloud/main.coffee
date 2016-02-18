require __dirname + '/app.js'
require __dirname + '/validations.js'
require __dirname + '/deletes.js'
require __dirname + '/activity.js'

# sendgrid = require("sendgrid")
# sendgrid.initialize("michaelbina", "m8E-gWK-tL6-zvu");

Parse.Cloud.define 'shareToFacebook', (request, response) ->
  Parse.Cloud.useMasterKey()
  userObjectId = request.params.userObjectId
  entryText = request.params.entryText
  user = new Parse.Query(Parse.User)
  user.get(userObjectId).then((user) ->
    console.log 'UserID: ' + user.id
    if Parse.FacebookUtils.isLinked(user)
      console.log 'token:' + user.get('authData').facebook.access_token

      Parse.Cloud.httpRequest(
        method: 'POST'
        params:
          message: entryText + "\n\nCheck out Phoebe on White Rabbit Apps"
          link: "http://www.whiterabbitapps.net/cat/phoebe_the_bug"
          access_token: user.get('authData').facebook.access_token
        url: 'https://graph.facebook.com/me/feed').then ((result) ->
        Parse.Promise.as 'Post'
      ), (httpRequest) ->
        Parse.Promise.error httpRequest
    else
      return Parse.Promise.error('user not linked to fb account')
    return
  ).then ((result) ->
    console.log "result from post: " + JSON.stringify(result)
    return response.success 'Post'
  ), (error) ->
    console.log error
    console.error error
    return response.error("Error posting")
  return


Parse.Cloud.define 'shareToTwitter', (request, response) ->
  Parse.Cloud.useMasterKey()
  userObjectId = request.params.userObjectId
  entryText = request.params.entryText
  user = new Parse.Query(Parse.User)


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


Parse.Cloud.afterSave "AnimalTimelineEntry", (request, response) ->
  console.log("timeline entry created: " + JSON.stringify(request))
  console.log("shareToFacebook: " + request.object.get("shareToFacebook"))
  console.log("shareToTwitter: " + request.object.get("shareToTwitter"))

  if(request.object.get("shareToFacebook"))
    console.log("sharing to Facebook for: " + request.object.get("createdBy").id)
    Parse.Cloud.run('shareToFacebook',
      userObjectId: request.object.get("createdBy").id
      entryText: request.object.get("text")
    ).then ((result) ->
      console.log 'result :' + JSON.stringify(result)
    ), (error) ->
      # error

  if(request.object.get("shareToTwitter"))
    console.log("sharing to Twitter for: " + request.object.get("createdBy").id)
    Parse.Cloud.run('shareToTwitter',
      userObjectId: request.object.get("createdBy").id
      entryText: request.object.get("text")
    ).then ((result) ->
      console.log 'result :' + JSON.stringify(result)
      return
    ), (error) ->
      # error
      return


Parse.Cloud.afterSave "Animal", (request, response) ->
  Parse.Cloud.useMasterKey()
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
      success: (results) ->
        console.log("results: " + results)
        console.log("request: " + request.object.get("birthDate").toISOString())

        for result in results
          console.log("destroying entry")
          result.destroy()

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
          success: (result) ->
            console.log("saved: " + result)
            return response.success()
        )
