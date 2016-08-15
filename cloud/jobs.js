Parse.Cloud.define("setEntriesLikeCount", function(request, response) {
  var query;
  console.log('setting entries like counts');
  Parse.Cloud.useMasterKey();
  query = new Parse.Query("AnimalTimelineEntry");
  query.limit(500);
  query.equalTo("type", "image");
  return query.find({
    useMasterKey: true,
    success: function(results) {
      var commentQuery, entry, likeQuery, _fn, _i, _len;
      _fn = function(lockedInEntry) {
        likeQuery.find({
          success: function(results) {
            console.log("SETTING LIKE COUNT FOR " + lockedInEntry.id + " TO: " + results.length);
            lockedInEntry.set("likeCount", results.length);
            return lockedInEntry.save({
              useMasterKey: true,
              success: function() {
                return console.log("finished saving entry");
              },
              error: function(error) {
                return console.log("problem saving entry: " + error);
              }
            });
          }
        });
        return commentQuery.find({
          success: function(results) {
            console.log("SETTING COMMENT COUNT FOR " + lockedInEntry.id + " TO: " + results.length);
            lockedInEntry.set("commentCount", results.length);
            return lockedInEntry.save({
              useMasterKey: true,
              success: function() {
                return console.log("finished saving entry");
              },
              error: function() {
                return console.log("problem saving entry");
              }
            });
          }
        });
      };
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        entry = results[_i];
        likeQuery = new Parse.Query("Like");
        likeQuery.equalTo("entry", entry);
        commentQuery = new Parse.Query("Comment");
        commentQuery.equalTo("entry", entry);
        _fn(entry);
      }
      return response.success("Like count setting completed successfully.");
    },
    error: function(error) {
      return response.error("Uh oh, something went wrong.");
    }
  });
});

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
