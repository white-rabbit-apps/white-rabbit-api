'use strict';
var app;

app = angular.module('white-rabbit', ['ng', 'ngResource', 'ui.router', 'ui.bootstrap', 'app.templates', 'Parse', 'angulartics', 'angulartics.google.analytics', 'ngFileUpload']);

app.config(function($locationProvider, $stateProvider, $urlRouterProvider, ParseProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  $locationProvider.hashPrefix('!');
  $stateProvider.state('home', {
    url: '/',
    controller: 'HomeCtrl',
    templateUrl: 'landing.html'
  }).state('beta', {
    url: '/beta/:status',
    controller: 'BetaCtrl',
    templateUrl: 'landing.html'
  }).state('animal', {
    url: '/cat/:username',
    controller: 'AnimalCtrl',
    templateUrl: 'animal.html'
  }).state('location', {
    url: '/location/:short_name',
    controller: 'LocationCtrl',
    templateUrl: 'location.html'
  }).state('shelter', {
    url: '/shelter/:short_name',
    controller: 'LocationCtrl',
    templateUrl: 'location.html'
  }).state('hashtag', {
    url: '/hashtag/:hashtag',
    controller: 'HashtagCtrl',
    templateUrl: 'hashtag.html'
  }).state('trait', {
    url: '/admin/traits',
    controller: 'TraitCtrl',
    templateUrl: 'trait.html'
  }).state('animals', {
    url: '/admin/animals',
    controller: 'AnimalsCtrl',
    templateUrl: 'animals.html'
  }).state('locations', {
    url: '/admin/locations',
    controller: 'LocationsCtrl',
    templateUrl: 'locations.html'
  }).state('users', {
    url: '/admin/users',
    controller: 'UsersCtrl',
    templateUrl: 'users.html'
  }).state('breeds', {
    url: '/admin/breeds',
    controller: 'BreedsCtrl',
    templateUrl: 'breeds.html'
  }).state('products', {
    url: '/admin/products',
    controller: 'ProductsCtrl',
    templateUrl: 'products.html'
  });
  $urlRouterProvider.otherwise('/');
  Parse.initialize("IWr9xzTirLbjXH80mbTCtT9lWB73ggQe3PhA6nPg", "8iUoJovKQkhCcpOaMPZ3r9Ii3thLsuvLfHViXLrK");
  return Parse.serverURL = "http://www.whiterabbitapps.net/api";
});

app.filter('unsafe', function($sce) {
  return $sce.trustAsHtml;
});

app.filter('hashtagFilter', function($sce) {
  var hashtagPattern, mentionPattern;
  hashtagPattern = /(^|\s)(#([a-z\d-]+))/ig;
  mentionPattern = /(^|\s)(@([a-z0-9_-]+))/ig;
  return function(text) {
    var newText;
    newText = text.replace(hashtagPattern, '$1<a href="/hashtag/$3">$&</a>');
    newText = newText.replace(mentionPattern, '$1<a href="/cat/$3">$&</a>');
    return $sce.trustAsHtml(newText);
  };
});

app.directive('fileDropzone', function() {
  return {
    restrict: 'A',
    scope: {
      file: '=',
      fileName: '='
    },
    link: function(scope, element, attrs) {
      var checkSize, isTypeValid, processDragOverOrEnter, validMimeTypes;
      processDragOverOrEnter = function(event) {
        if (event != null) {
          event.preventDefault();
        }
        event.dataTransfer.effectAllowed = 'copy';
        return false;
      };
      validMimeTypes = attrs.fileDropzone;
      checkSize = function(size) {
        var _ref;
        if (((_ref = attrs.maxFileSize) === (void 0) || _ref === '') || (size / 1024) / 1024 < attrs.maxFileSize) {
          return true;
        } else {
          alert("File must be smaller than " + attrs.maxFileSize + " MB");
          return false;
        }
      };
      isTypeValid = function(type) {
        if ((validMimeTypes === (void 0) || validMimeTypes === '') || validMimeTypes.indexOf(type) > -1) {
          return true;
        } else {
          alert("Invalid file type.  File must be one of following types " + validMimeTypes);
          return false;
        }
      };
      element.bind('dragover', processDragOverOrEnter);
      element.bind('dragenter', processDragOverOrEnter);
      return element.bind('drop', function(event) {
        var file, name, reader, size, type;
        if (event != null) {
          event.preventDefault();
        }
        reader = new FileReader();
        reader.onload = function(evt) {
          if (checkSize(size) && isTypeValid(type)) {
            return scope.$apply(function() {
              scope.file = evt.target.result;
              if (angular.isString(scope.fileName)) {
                return scope.fileName = name;
              }
            });
          }
        };
        file = event.dataTransfer.files[0];
        name = file.name;
        type = file.type;
        size = file.size;
        reader.readAsDataURL(file);
        return false;
      });
    }
  };
});

app.run(function($rootScope, $state, $location) {
  $rootScope.$state = $state;
  $rootScope.hideNavigation = false;
  $rootScope.bodyClass = 'with-nav';
  $rootScope.title = 'White Rabbit Apps';
  $rootScope.description = 'Follow the white rabbit...';
  $rootScope.serverDomain = 'http://www.whiterabbitapps.net';
  $rootScope.url = $location.url();
  $rootScope.mainImage = 'http://files.parsetfss.com/76b6cc17-92eb-4048-be57-afbc6cb6e77d/tfss-64d0f007-06e1-4c7f-b2a2-6d558b87361f-file';
  $rootScope.currentUser = Parse.User.current();
  $(function() {
    var iOS, keenClient, p;
    $('.fb-share').click(function(e) {
      e.preventDefault();
      window.open($(this).attr('href'), 'fbShareWindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
      return false;
    });
    keenClient = new Keen({
      projectId: '5696d7a296773d0613e2abfe',
      writeKey: '238c8ba5674ad10606e769f23128ee11276aa2fcfc13704485edb8e68d4ec82c5a48ebe35b07fb535a36b66a967a48728aacad7f1e2c46768e6e1836ab8d7deadf8fe2b024dfd3116385ad05e2ad941b294d1cf4e61cce913aea0485f3cb4335'
    });
    keenClient.addEvent('pageview', {
      key: 'value'
    });
    iOS = false;
    p = navigator.platform;
    if (p === 'iPad' || p === 'iPhone' || p === 'iPod') {
      iOS = true;
    }
    if (iOS) {
      $('#gif_background').show();
      return $('#video_background').hide();
    }
  });
  $rootScope.signUp = function(form) {
    var user;
    user = new Parse.User;
    user.set('email', form.email);
    user.set('username', form.username);
    user.set('password', form.password);
    user.signUp(null, {
      success: function(user) {
        $scope.currentUser = user;
        $scope.$apply();
      },
      error: function(user, error) {
        alert('Unable to sign up:  ' + error.code + ' ' + error.message);
      }
    });
  };
  $rootScope.logIn = function(form) {
    Parse.User.logIn(form.username, form.password, {
      success: function(user) {
        $scope.currentUser = user;
        $scope.$apply();
      },
      error: function(user, error) {
        alert('Unable to log in: ' + error.code + ' ' + error.message);
      }
    });
  };
  return $rootScope.logOut = function(form) {
    Parse.User.logOut();
    $scope.currentUser = null;
  };
});

app.controller('AnimalCtrl', function($scope, Animal, AnimalTimelineEntry, $stateParams, $rootScope) {
  $scope.isAlive = true;
  $scope.username = $stateParams.username;
  $rootScope.hideNavigation = false;
  $rootScope.bodyClass = 'no-nav';
  $scope.createNewEntry = function() {
    return $scope.newEntry = new AnimalTimelineEntry({
      "animal": {
        "__type": "Pointer",
        "className": "Animal",
        "objectId": $scope.animal.objectId
      },
      "type": "image",
      "date": {
        "__type": "Date",
        "iso": new Date()
      }
    });
  };
  $scope.addEntry = function() {
    var file, imageBase64, name;
    if (($scope.newEntry != null) && ($scope.newEntry.image != null)) {
      name = $scope.newEntry.filename || 'timeline.jpg';
      imageBase64 = $scope.newEntry.image.file.replace(/^data:image\/(png|jpeg);base64,/, "");
      file = new Parse.File(name, {
        base64: imageBase64
      }, "image/jpeg");
      return file.save().then(function(file) {
        console.log("image uploaded: " + file);
        $scope.newEntry.image = file;
        return $scope.newEntry.save().then(function(entry) {
          console.log("saved entry");
          $scope.fetchEntries();
          return $scope.createNewEntry();
        }, function(error) {
          return console.log("error saving entry");
        });
      });
    } else {
      return $scope.newEntry.save().then(function(entry) {
        $scope.fetchEntries();
        return $scope.createNewEntry();
      });
    }
  };
  $scope.fetchAnimal = function() {
    return Animal.query({
      where: {
        username: $stateParams.username
      },
      include: 'breed,shelter'
    }).then(function(animals) {
      $scope.animal = animals[0];
      console.log($scope.animal.deceasedDate);
      if ($scope.animal.deceasedDate) {
        $scope.isAlive = false;
      }
      $rootScope.title = $scope.animal.name + ' on ' + $rootScope.title;
      $rootScope.description = 'Check out ' + $scope.animal.name + '\'s profile on White Rabbit Apps';
      $rootScope.mainImage = $scope.animal.profilePhoto.url;
      $scope.createNewEntry();
      return $scope.fetchEntries();
    });
  };
  $scope.fetchEntries = function() {
    return AnimalTimelineEntry.query({
      where: {
        animal: {
          __type: 'Pointer',
          className: 'Animal',
          objectId: $scope.animal.objectId
        }
      },
      include: 'shelter',
      orderBy: 'date DESC'
    }).then(function(entries) {
      if ($scope.isAlive) {
        return $scope.entries = entries.reverse();
      } else {
        return $scope.entries = entries;
      }
    });
  };
  $scope.prettyDate = function(iso) {
    var date, dateString, day, monthIndex, monthNames, year;
    monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    date = new Date(iso);
    day = date.getDate();
    monthIndex = date.getMonth();
    year = date.getFullYear();
    dateString = day + ' ' + monthNames[monthIndex] + ' ' + year;
    return dateString;
  };
  return $scope.fetchAnimal();
});

app.controller('AnimalsCtrl', function($scope, Animal, Breed, Location, $stateParams) {
  $scope.addAnimal = function() {
    $scope.newAnimal.save().then(function(animal) {
      return $scope.fetchAnimals();
    });
    return $scope.newAnimal = new Animal;
  };
  $scope.removeAnimal = function(animal) {
    if (confirm("Are you sure?  All data will be lost.")) {
      return animal.destroy().then(function() {
        return _.remove($scope.animals, function(animal) {
          return animal.objectId === null;
        });
      });
    }
  };
  $scope.editingAnimal = function(animal) {
    return animal.editing = true;
  };
  $scope.editAnimal = function(animal) {
    var file, imageBase64, name;
    if ((animal.breed != null)) {
      animal.breed = new Breed(animal.breed);
    }
    if ((animal.shelter != null)) {
      animal.shelter = new Location(animal.shelter);
    }
    if ((animal.profilePhoto != null) && (animal.profilePhoto.file != null)) {
      name = animal.profilePhoto.filename || 'profile.jpg';
      imageBase64 = animal.profilePhoto.file.replace(/^data:image\/(png|jpeg);base64,/, "");
      file = new Parse.File(name, {
        base64: imageBase64
      }, "image/jpeg");
      animal.saving = true;
      return file.save().then(function(file) {
        console.log("image uploaded: " + file);
        animal.profilePhoto = file;
        return animal.save().then(function(object) {
          console.log("saved animal");
          animal.saving = false;
          return animal.editing = false;
        }, function(error) {
          return console.log("error saving animal");
        });
      });
    } else {
      animal.save();
      return animal.editing = false;
    }
  };
  $scope.cancelEditing = function(animal) {
    animal.name = animal._cache.name;
    return animal.editing = false;
  };
  $scope.fetchBreeds = function() {
    return Breed.query().then(function(breeds) {
      return $scope.breeds = breeds;
    });
  };
  $scope.fetchAnimals = function() {
    var query;
    query = Animal.query({
      include: "breed,shelter"
    });
    if ($scope.selectedGroup === 'Mine') {
      query = Animal.query({
        where: {
          owner: {
            __type: 'Pointer',
            className: '_User',
            objectId: 'KSZuBHXIyE'
          }
        },
        include: "breed,shelter"
      });
    }
    if ($scope.selectedGroup === 'Featured') {
      query = Animal.query({
        where: {
          featured: true,
          adoptable: false
        },
        include: "breed,shelter"
      });
    }
    if ($scope.selectedGroup === 'New') {
      query = Animal.query({
        where: {
          name: null
        },
        include: "breed,shelter"
      });
    }
    if ($scope.selectedGroup === 'Kittens') {
      query = Animal.query({
        include: "breed,shelter"
      });
    }
    if ($scope.selectedGroup === 'Adoptable') {
      query = Animal.query({
        where: {
          adoptable: true,
          featured: true
        },
        include: "breed,shelter"
      });
      if (($scope.selectedShelter != null)) {
        query = Animal.query({
          where: {
            adoptable: true,
            shelter: {
              __type: 'Pointer',
              className: 'Location',
              objectId: $scope.selectedShelter.objectId
            }
          },
          include: "breed,shelter"
        });
      }
    }
    return query.then(function(animals) {
      console.log(animals);
      return $scope.animals = animals;
    });
  };
  $scope.fetchShelters = function() {
    return Location.query({
      where: {
        type: "shelter"
      }
    }).then(function(locations) {
      return $scope.shelters = locations;
    });
  };
  $scope.selectedGroup = 'Mine';
  $scope.fetchBreeds();
  $scope.fetchShelters();
  $scope.fetchAnimals();
  return $scope.newAnimal = new Animal;
});

app.controller('BetaCtrl', function($scope, $rootScope, $stateParams) {
  $scope.status = $stateParams.status;
  $rootScope.status = $stateParams.status;
  $rootScope.hideNavigation = true;
  $rootScope.bodyClass = 'no-nav';
  $rootScope.betaConfirm = false;
  $rootScope.betaSubscribed = false;
  if ($scope.status === 'confirm') {
    $rootScope.betaConfirm = true;
  }
  if ($scope.status === 'subscribed') {
    return $rootScope.betaSubscribed = true;
  }
});

app.controller('BreedsCtrl', function($scope, Breed) {
  $scope.addBreed = function() {
    $scope.newBreed.save().then(function(breed) {
      return $scope.fetchBreeds();
    });
    return $scope.newBreed = new Breed;
  };
  $scope.removeBreed = function(breed) {
    if (confirm("Are you sure?  All data will be lost.")) {
      return breed.destroy().then(function() {
        return _.remove($scope.breeds, function(breed) {
          return breed.objectId === null;
        });
      });
    }
  };
  $scope.editingBreed = function(breed) {
    return breed.editing = true;
  };
  $scope.editBreed = function(breed) {
    var file, imageBase64, name;
    if ((breed.image != null) && (breed.image.file != null)) {
      name = breed.image.filename || 'image.jpg';
      imageBase64 = breed.image.file.replace(/^data:image\/(png|jpeg);base64,/, "");
      file = new Parse.File(name, {
        base64: imageBase64
      }, "image/jpeg");
      breed.saving = true;
      file.save().then(function(file) {
        console.log("image uploaded: " + file);
        breed.image = file;
        return breed.save().then(function(object) {
          console.log("saved breed");
          breed.saving = false;
          return breed.editing = false;
        }, function(error) {
          return console.log("error saving breed");
        });
      });
    } else {
      breed.save();
      breed.editing = false;
    }
    breed.save();
    return breed.editing = false;
  };
  $scope.cancelEditing = function(breed) {
    breed.title = breed._cache.title;
    return breed.editing = false;
  };
  $scope.fetchBreeds = function() {
    return Breed.query().then(function(breeds) {
      return $scope.breeds = breeds;
    });
  };
  $scope.fetchBreeds();
  return $scope.newBreed = new Breed;
});

app.controller('HashtagCtrl', function($scope, AnimalTimelineEntry, $stateParams, $rootScope) {
  $scope.hashtag = $stateParams.hashtag;
  $rootScope.title = '#' + $scope.hashtag + ' on ' + $rootScope.title;
  $rootScope.description = 'Check out posts tagged #' + $scope.hashtag + ' on White Rabbit Apps';
  $rootScope.hideNavigation = false;
  $rootScope.bodyClass = 'no-nav';
  $scope.fetchEntries = function() {
    return AnimalTimelineEntry.query({
      where: {
        text: {
          "$regex": '\\Q\#' + $scope.hashtag + '\\E',
          "$options": "i"
        }
      },
      include: 'shelter',
      orderBy: 'createdAt DESC'
    }).then(function(entries) {
      return $scope.entries = entries.reverse();
    });
  };
  $scope.prettyDate = function(iso) {
    var date, dateString, day, monthIndex, monthNames, year;
    monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    date = new Date(iso);
    day = date.getDate();
    monthIndex = date.getMonth();
    year = date.getFullYear();
    dateString = day + ' ' + monthNames[monthIndex] + ' ' + year;
    return dateString;
  };
  return $scope.fetchEntries();
});

app.controller('HomeCtrl', function($scope, $rootScope) {
  $rootScope.hideNavigation = true;
  $rootScope.bodyClass = 'no-nav';
  $rootScope.betaConfirm = false;
  $rootScope.betaSubscribed = false;
  return $scope.home = function() {};
});

app.controller('LocationCtrl', function($scope, $rootScope, $stateParams, Location, Animal) {
  $scope.short_name = $stateParams.short_name;
  $rootScope.hideNavigation = false;
  $rootScope.bodyClass = 'no-nav';
  $scope.fetchLocation = function() {
    return Location.query({
      where: {
        short_name: $stateParams.short_name
      }
    }).then(function(locations) {
      $scope.location = locations[0];
      console.log($scope.location);
      $rootScope.title = $scope.location.name + ' on ' + $rootScope.title;
      $rootScope.description = 'Check out ' + $scope.location.name + ' on White Rabbit Apps';
      $rootScope.mainImage = $scope.location.logo.url;
      $scope.fetchAnimals();
      return $scope.fetchAlumni();
    });
  };
  $scope.fetchAnimals = function() {
    return Animal.query({
      where: {
        adoptable: true,
        shelter: {
          __type: 'Pointer',
          className: 'Location',
          objectId: $scope.location.objectId
        }
      },
      include: 'breed'
    }).then(function(animals) {
      return $scope.animals = animals;
    });
  };
  $scope.fetchAlumni = function() {
    return Animal.query({
      where: {
        adoptable: false,
        shelter: {
          __type: 'Pointer',
          className: 'Location',
          objectId: $scope.location.objectId
        }
      },
      include: 'breed'
    }).then(function(animals) {
      return $scope.alumni = animals;
    });
  };
  return $scope.fetchLocation();
});

app.controller('LocationsCtrl', function($scope, Location, Upload) {
  $scope.addLocation = function() {
    $scope.newLocation.save().then(function(location) {
      return $scope.fetchLocations();
    });
    $scope.newLocation = new Location;
    return $scope.newLocation.type = "_new";
  };
  $scope.removeLocation = function(location) {
    if (confirm("Are you sure?  All data will be lost.")) {
      return location.destroy().then(function() {
        return _.remove($scope.locations, function(location) {
          return location.objectId === null;
        });
      });
    }
  };
  $scope.editingLocation = function(location) {
    return location.editing = true;
  };
  $scope.editLocation = function(location) {
    var file, imageBase64, name;
    console.log("saving location");
    if ((location.geo != null)) {
      location.geo = {
        "__type": "GeoPoint",
        "latitude": parseFloat(location.geo.latitude),
        "longitude": parseFloat(location.geo.longitude)
      };
    }
    if ((location.logo != null) && (location.logo.file != null)) {
      name = location.logo.filename || 'logo.jpg';
      imageBase64 = location.logo.file.replace(/^data:image\/(png|jpeg);base64,/, "");
      file = new Parse.File(name, {
        base64: imageBase64
      }, "image/jpeg");
      location.saving = true;
      file.save().then(function(file) {
        console.log("image uploaded: " + file);
        location.logo = file;
        return location.save().then(function(object) {
          console.log("saved location");
          location.saving = false;
          return location.editing = false;
        }, function(error) {
          return console.log("error saving location");
        });
      });
    } else {
      location.save().then(function(object) {
        console.log("saved location");
        return location.editing = false;
      }, function(error) {
        return console.log("error saving location");
      });
    }
    location.save();
    return location.editing = false;
  };
  $scope.cancelEditing = function(location) {
    location.title = location._cache.title;
    return location.editing = false;
  };
  $scope.selectType = function(type) {
    $scope.selectedType = type;
    return $scope.fetchLocations();
  };
  $scope.fetchLocations = function() {
    return Location.query({
      where: {
        type: $scope.selectedType
      }
    }).then(function(locations) {
      return $scope.locations = locations;
    });
  };
  $scope.types = ["vet", "shelter", "supplies", "grooming", "_new"];
  $scope.selectedType = $scope.types[0];
  $scope.fetchLocations();
  return $scope.newLocation = new Location;
});

app.controller('ProductsCtrl', function($scope, Product) {
  $scope.addProduct = function() {
    $scope.newProduct.save().then(function(product) {
      return $scope.fetchProducts();
    });
    return $scope.newProduct = new Product;
  };
  $scope.removeProduct = function(product) {
    if (confirm("Are you sure?  All data will be lost.")) {
      return product.destroy().then(function() {
        return _.remove($scope.products, function(product) {
          return product.objectId === null;
        });
      });
    }
  };
  $scope.editingProduct = function(product) {
    return product.editing = true;
  };
  $scope.editProduct = function(product) {
    var file, imageBase64, name;
    if ((product.image != null) && (product.image.file != null)) {
      name = product.image.filename || 'image.jpg';
      imageBase64 = product.image.file.replace(/^data:image\/(png|jpeg);base64,/, "");
      file = new Parse.File(name, {
        base64: imageBase64
      }, "image/jpeg");
      product.saving = true;
      file.save().then(function(file) {
        console.log("image uploaded: " + file);
        product.image = file;
        return product.save().then(function(object) {
          console.log("saved product");
          product.saving = false;
          return product.editing = false;
        }, function(error) {
          return console.log("error saving product");
        });
      });
    } else {
      product.save();
      product.editing = false;
    }
    product.save();
    return product.editing = false;
  };
  $scope.cancelEditing = function(product) {
    product.title = product._cache.title;
    return product.editing = false;
  };
  $scope.fetchProducts = function() {
    return Product.query().then(function(products) {
      return $scope.products = products;
    });
  };
  $scope.fetchProducts();
  return $scope.newProduct = new Product;
});

app.controller('TraitCtrl', function($scope, Trait) {
  $scope.addTrait = function() {
    $scope.newTrait.save().then(function(trait) {
      return $scope.fetchTraits();
    });
    return $scope.newTrait = new Trait;
  };
  $scope.removeTrait = function(trait) {
    return trait.destroy().then(function() {
      return _.remove($scope.traits, function(trait) {
        return trait.objectId === null;
      });
    });
  };
  $scope.editingTrait = function(trait) {
    return trait.editing = true;
  };
  $scope.editTrait = function(trait) {
    trait.save();
    return trait.editing = false;
  };
  $scope.cancelEditing = function(trait) {
    trait.title = trait._cache.title;
    return trait.editing = false;
  };
  $scope.fetchTraits = function() {
    return Trait.query().then(function(traits) {
      return $scope.traits = traits;
    });
  };
  $scope.fetchTraits();
  return $scope.newTrait = new Trait;
});

app.controller('UsersCtrl', function($scope, User) {
  $scope.addUser = function() {
    $scope.newUser.save().then(function(user) {
      return $scope.fetchUsers();
    });
    return $scope.newUser = new User;
  };
  $scope.removeUser = function(user) {
    return user.destroy().then(function() {
      return _.remove($scope.users, function(user) {
        return user.objectId === null;
      });
    });
  };
  $scope.makeAdmin = function(user) {
    console.log("make admin");
    return Parse.Cloud.run("makeAdmin", {
      userId: user.objectId
    });
  };
  $scope.editingUser = function(user) {
    return user.editing = true;
  };
  $scope.editUser = function(user) {
    user.save();
    return user.editing = false;
  };
  $scope.cancelEditing = function(user) {
    user.title = user._cache.title;
    return user.editing = false;
  };
  $scope.fetchUsers = function() {
    return User.query({
      include: 'shelter'
    }).then(function(users) {
      return $scope.users = users;
    });
  };
  $scope.fetchUsers();
  return $scope.newUser = new User;
});

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app.factory('Animal', function(Parse) {
  var Animal;
  return Animal = (function(_super) {
    __extends(Animal, _super);

    function Animal() {
      return Animal.__super__.constructor.apply(this, arguments);
    }

    Animal.configure("Animal", "owner", "shelter", "name", "breed", "adoptable", "originalSourceLink", "birthDate", "gender", "profilePhoto", "coverPhoto", "username", "instagramUsername", "youtubeUsername", "twitterUsername");

    Animal.prototype.age = function() {
      var age, ageDate, ageDifMs, birthDate, deceasedDate, months;
      console.log("getting age");
      if (!this.birthDate) {
        return "Age Unknown";
      }
      if (this.deceasedDate) {
        birthDate = new Date(this.birthDate.iso);
        deceasedDate = new Date(this.deceasedDate.iso);
        return birthDate.getUTCFullYear() + " - " + deceasedDate.getUTCFullYear();
      }
      ageDifMs = Date.now() - new Date(this.birthDate.iso).getTime();
      ageDate = new Date(ageDifMs);
      age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age <= 1) {
        months = Math.abs(ageDate.getUTCMonth());
        if (months === 0) {
          months = 12;
        }
        age = months + " months old";
      } else {
        age = age + " years old";
      }
      return age;
    };

    return Animal;

  })(Parse.Model);
});

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app.factory('AnimalTimelineEntry', function(Parse) {
  var AnimalTimelineEntry;
  return AnimalTimelineEntry = (function(_super) {
    __extends(AnimalTimelineEntry, _super);

    function AnimalTimelineEntry() {
      return AnimalTimelineEntry.__super__.constructor.apply(this, arguments);
    }

    AnimalTimelineEntry.configure("AnimalTimelineEntry", "animal", "date", "kind", "image", "text", "type");

    return AnimalTimelineEntry;

  })(Parse.Model);
});

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app.factory('Breed', function(Parse) {
  var Breed;
  return Breed = (function(_super) {
    __extends(Breed, _super);

    function Breed() {
      return Breed.__super__.constructor.apply(this, arguments);
    }

    Breed.configure("Breed", "name", "image", "description", "originCountry", "type", "coat", "groomingFrequency", "sheddingFrequency", "attentionNeed", "activity", "vocalization", "minLifeExpectancy", "maxLifeExpectancy", "minWeightLbs", "maxWeightLbs");

    return Breed;

  })(Parse.Model);
});

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app.factory('Location', function(Parse) {
  var Location;
  return Location = (function(_super) {
    __extends(Location, _super);

    function Location() {
      return Location.__super__.constructor.apply(this, arguments);
    }

    Location.configure("Location", "type", "name", "short_name", "email", "address", "city", "state", "zip", "geo", "phone", "website", "fbUrl", "twitterUrl", "instagramUrl", "youtubeUrl", "fbUrl", "yelpUrl", "logo");

    return Location;

  })(Parse.Model);
});

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app.factory('Product', function(Parse) {
  var Product;
  return Product = (function(_super) {
    __extends(Product, _super);

    function Product() {
      return Product.__super__.constructor.apply(this, arguments);
    }

    Product.configure("Product", "name", "active", "price", "description", "mainPhoto", "amazonUrl", "manufacturerName", "manufacturerUrl", "supplierPartName", "supplierUrl");

    return Product;

  })(Parse.Model);
});

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app.factory('Trait', function(Parse) {
  var Trait;
  return Trait = (function(_super) {
    __extends(Trait, _super);

    function Trait() {
      return Trait.__super__.constructor.apply(this, arguments);
    }

    Trait.configure("Trait", "name");

    return Trait;

  })(Parse.Model);
});

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app.factory('User', function(Parse) {
  var User;
  return User = (function(_super) {
    __extends(User, _super);

    function User() {
      return User.__super__.constructor.apply(this, arguments);
    }

    User.configure("User", "firstName", "lastName", "email", "username", "profilePhoto", "admin", "shelter");

    return User;

  })(Parse.User);
});
