app.factory 'Animal', (Parse) ->
  class Animal extends Parse.Model
    @configure "Animal", "owner", "shelter", "name", "breed", "adoptable", "originalSourceLink", "birthDate", "gender", "profilePhoto", "coverPhoto", "username", "instagramUsername", "youtubeUsername", "twitterUsername"

    age: () ->
      console.log("getting age")
      if(!this.birthDate)
        return "Age Unknown"
      if(this.deceasedDate)
        birthDate = new Date(this.birthDate.iso)
        deceasedDate = new Date(this.deceasedDate.iso)
        return birthDate.getUTCFullYear() + " - " + deceasedDate.getUTCFullYear()
      ageDifMs = Date.now() - new Date(this.birthDate.iso).getTime()
      ageDate = new Date(ageDifMs)
      age = Math.abs(ageDate.getUTCFullYear() - 1970)
      if(age <= 1)
        months = Math.abs(ageDate.getUTCMonth())
        if months == 0
          months = 12
        age = months + " month old"
      else
        age = age + " year old"

      return age
