# require './cloud/app.js'

Parse = require('parse-cloud-express').Parse

Parse.Cloud.job "setEntriesPrivate", (request, response) ->
  console.log('setting entries private')

  Parse.Cloud.useMasterKey()

  query = new Parse.Query("AnimalTimelineEntry")
  query.find
    success: (results) ->
      for entry in results
        if(entry.get("type") == "image" || entry.get("type") == "birth")
          entry.set("private", false)
        else
          console.log('setting true')
          entry.set("private", true)
        entry.save
          success: () ->
            console.log("finished saving entry")
          error: () ->
            console.log("problem saving entry")
      response.success("Migration completed successfully.")
    error: (error) ->
      response.error("Uh oh, something went wrong.")
