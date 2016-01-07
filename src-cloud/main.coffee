require './cloud/app.js'
require './cloud/validations.js'

Parse = require('parse-cloud-express').Parse

# sendgrid = require("sendgrid")
# sendgrid.initialize("michaelbina", "m8E-gWK-tL6-zvu");
#
# Parse.Cloud.afterSave "AnimalTransfer", (request, response) ->
#   console.log 'attempting email for animal transfer'
#   sendgrid.sendEmail(
#     to: [ 'michaelbina@icloud.com' ]
#     from: 'support@whiterabbitapps.net'
#     subject: 'You\'ve been invited to take over'
#     text: 'Congratulations on your new family member!'
#     replyto: 'support@whiterabbitapps.net').then ((httpResponse) ->
#     console.log httpResponse
#   ), (httpResponse) ->
#     console.error httpResponse

Parse.Cloud.define "makeAdmin", (request, response) ->
  if(request.params["userId"])
    Parse.Cloud.useMasterKey()
    user = new Parse.User({id:request.params.userId})
    user.set("admin", true)
    user.save()

    return response.success()
  else
    return response.error()

Parse.Cloud.afterSave "Animal", (request, response) ->
  if request.object.get("birthDate")
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

Parse.Cloud.beforeSave "AnimalTimelineEntry", (request, response) ->
  if (!request.object.get("hasDocuments"))
    request.object.set("hasDocuments", false)
  if (!request.object.get("private"))
    if(request.object.get("type") == "medical")
      request.object.set("private", true)
    else
      request.object.set("private", false)
  return response.success()

# Cascading deletes
Parse.Cloud.afterDelete "Animal", (request, response) ->
  query = new Parse.Query("AnimalTimelineEntry")
  query.equalTo("animal", {
      "__type": "Pointer",
      "className": "Animal",
      "objectId": request.object.id
  })
  query.find
    success: (results) ->
      for result in results
        console.log("destroying entry")
        result.destroy()

Parse.Cloud.afterDelete "AnimalTimelineEntry", (request, response) ->
  query = new Parse.Query("Document")
  query.equalTo("entry", {
      "__type": "Pointer",
      "className": "AnimalTimelineEntry",
      "objectId": request.object.id
  })
  query.find
    success: (results) ->
      for result in results
        console.log("destroying document")
        result.destroy()

Parse.Cloud.afterDelete "Document", (request, response) ->
  query = new Parse.Query("DocumentPage")
  query.equalTo("document", {
      "__type": "Pointer",
      "className": "Document",
      "objectId": request.object.id
  })
  query.find
    success: (results) ->
      for result in results
        console.log("destroying page")
        result.destroy()
