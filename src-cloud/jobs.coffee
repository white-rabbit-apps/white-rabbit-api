# require __dirname + '/app.js'
# require __dirname + '/../server.js'

Parse.Cloud.define "setEntriesPrivate", (request, response) ->
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



Parse.Cloud.define "removeNewFromLocationTypes", (request, response) ->
  console.log('setting entries private')

  Parse.Cloud.useMasterKey()

  query = new Parse.Query("Location")
  query.contains("types", "_new")
  query.exists("name")
  query.limit(100)
  query.find
    success: (results) ->
      for entry in results
        if(!entry.get("name"))
          console.log("location with no name")
          # entry.set("private", false)
        else
          console.log("location with name: " + entry.get("name"))
          entry.remove("types", "_new")

          entry.save
            success: () ->
              console.log("finished saving entry")
            error: () ->
              console.log("problem saving entry")
      response.success("Migration completed successfully.")
    error: (error) ->
      response.error("Uh oh, something went wrong.")
