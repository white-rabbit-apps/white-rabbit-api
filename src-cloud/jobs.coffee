# require __dirname + '/app.js'
# require __dirname + '/../server.js'

Parse.Cloud.define "setEntriesCommentCount", (request, response) ->
  console.log('setting entries comment counts')

  Parse.Cloud.useMasterKey()

  query = new Parse.Query("AnimalTimelineEntry")
  query.limit(1500)
  query.equalTo("type", "image")
  query.find
    useMasterKey: true
    success: (results) ->
      for entry in results
        likeQuery = new Parse.Query("Comment")
        likeQuery.equalTo("entry", entry)
        likeQuery.find
          success: (results) ->
            console.log("SETTING COMMENT COUNT TO: " + results.length)
            entry.set("commentCount", results.length)
            entry.save
              useMasterKey: true
              success: () ->
                console.log("finished saving entry")
              error: () ->
                console.log("problem saving entry")
      response.success("Comment count setting completed successfully.")
    error: (error) ->
      response.error("Uh oh, something went wrong.")

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
        likeQuery.find
          success: (results) ->
            console.log("SETTING LIKE COUNT FOR " + entry.id + " TO: " + results.length)
            entry.set("likeCount", results.length)
            entry.save
              useMasterKey: true
              success: () ->
                console.log("finished saving entry")
              error: () ->
                console.log("problem saving entry")
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
