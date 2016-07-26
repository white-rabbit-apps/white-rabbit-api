Parse.Cloud.define("setEntriesPrivate", function(request, response) {
  var query;
  console.log('setting entries private');
  Parse.Cloud.useMasterKey();
  query = new Parse.Query("AnimalTimelineEntry");
  return query.find({
    success: function(results) {
      var entry, _i, _len;
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        entry = results[_i];
        if (entry.get("type") === "image" || entry.get("type") === "birth") {
          entry.set("private", false);
        } else {
          console.log('setting true');
          entry.set("private", true);
        }
        entry.save({
          success: function() {
            return console.log("finished saving entry");
          },
          error: function() {
            return console.log("problem saving entry");
          }
        });
      }
      return response.success("Migration completed successfully.");
    },
    error: function(error) {
      return response.error("Uh oh, something went wrong.");
    }
  });
});

Parse.Cloud.define("removeNewFromLocationTypes", function(request, response) {
  var query;
  console.log('setting entries private');
  Parse.Cloud.useMasterKey();
  query = new Parse.Query("Location");
  query.contains("types", "_new");
  query.exists("name");
  query.limit(100);
  return query.find({
    success: function(results) {
      var entry, _i, _len;
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        entry = results[_i];
        if (!entry.get("name")) {
          console.log("location with no name");
        } else {
          console.log("location with name: " + entry.get("name"));
          entry.remove("types", "_new");
          entry.save({
            success: function() {
              return console.log("finished saving entry");
            },
            error: function() {
              return console.log("problem saving entry");
            }
          });
        }
      }
      return response.success("Migration completed successfully.");
    },
    error: function(error) {
      return response.error("Uh oh, something went wrong.");
    }
  });
});
