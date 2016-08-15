# require __dirname + '/app.js'
# require __dirname + '/../server.js'

Parse.Cloud.define "setEntriesLikeCount", (request, response) ->
  console.log('setting entries like counts')

  Parse.Cloud.useMasterKey()

  query = new Parse.Query("AnimalTimelineEntry")
  query.limit(1500)
  query.equalTo("type", "image")
  query.find
    useMasterKey: true
    success: (results) ->
      for entry in results
        likeQuery = new Parse.Query("Like")
        likeQuery.equalTo("entry", entry)

        commentQuery = new Parse.Query("Comment")
        commentQuery.equalTo("entry", entry)

        ((lockedInEntry) ->
          likeQuery.find
            success: (results) ->
              console.log("SETTING LIKE COUNT FOR " + lockedInEntry.id + " TO: " + results.length)
              lockedInEntry.set("likeCount", results.length)
              lockedInEntry.save
                useMasterKey: true
                success: () ->
                  console.log("finished saving entry")
                error: (error) ->
                  console.log("problem saving entry: " + error.message)

          commentQuery.find
            success: (results) ->
              console.log("SETTING COMMENT COUNT FOR " + lockedInEntry.id + " TO: " + results.length)
              lockedInEntry.set("commentCount", results.length)
              lockedInEntry.save
                useMasterKey: true
                success: () ->
                  console.log("finished saving entry")
                error: () ->
                  console.log("problem saving entry: " + error.message)

        )(entry)

      response.success("Like count setting completed successfully.")
    error: (error) ->
      response.error("Uh oh, something went wrong.")

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
