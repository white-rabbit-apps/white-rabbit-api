# require __dirname + '/app.js'
# require __dirname + '/../server.js'

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



Parse.Cloud.job "removeNewFromLocationTypes", (request, response) ->
  console.log('setting entries private')

  Parse.Cloud.useMasterKey()

  query = new Parse.Query("Location")
  query.whereKey("types", "_new")
  query.doesNotExist("name")
  query.find
    success: (results) ->
      for entry in results
        if(entry.get("name") == "")
          console.log("location with no name")
          # entry.set("private", false)
        else
          console.log("location with name")
          # entry.set("private", true)

        # entry.save
        #   success: () ->
        #     console.log("finished saving entry")
        #   error: () ->
        #     console.log("problem saving entry")
      response.success("Migration completed successfully.")
    error: (error) ->
      response.error("Uh oh, something went wrong.")
