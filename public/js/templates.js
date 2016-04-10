angular.module("app.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("animal.html","<script>if (entryId)\n  console.log(\'has entry id\')\nelse\n  console.log(\'no entry id\')\n  \n  </script><div class=\"animal cat\"><div class=\"header\"><div class=\"cover-container\"><img ng-src=\"{{animal.coverPhoto.url || \'/img/blank_cover.png\'}}\" class=\"cover-photo\"></div><div class=\"profile-col\"><div class=\"profile-photo\"><img ng-src=\"{{animal.profilePhoto.url || \'/img/avatar_blank.png\'}}\" class=\"profile\"></div><div class=\"share\"><div id=\"share-dropdown\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\" class=\"btn dropdown-toggle\"><img src=\"/img/share_white.png\"><ul aria-labelledby=\"share-dropdown\" class=\"dropdown-menu\"><li><a href=\"https://www.facebook.com/sharer/sharer.php?u={{serverDomain}}/cat/{{animal.username}}\" target=\"_blank\" class=\"fb-share\"><i class=\"fa fa-facebook\"></i>Share on Facebook</a></li><li><a href=\"http://twitter.com/share?text={{animal.name}}%20on%20%40WhiteRabbitApps%20http%3A%2F%2Fwww.whiterabbitapps.net/cat/{{animal.username}}&amp;amp;url=&quot;&quot;\" class=\"fb-share\"><i class=\"fa fa-twitter\"></i>Share on Twitter</a></li></ul></div></div></div><div class=\"info\"><h1>{{animal.name}}</h1><div class=\"username\">@{{animal.username}}</div><div class=\"gender\">{{animal.gender}}</div><div class=\"age\">{{animal.age()}}</div><div class=\"breed\">{{animal.breed.name}}</div><div class=\"adoptable\">{{animal.shelter ? (animal.adoptable ? \'Adoptable through \' : \'Adopted through \') : \'\'}}</div><div class=\"shelter\"><a href=\"/location/{{animal.shelter.short_name}}\">{{animal.shelter.name}}</a></div></div></div><div ng-repeat=\"entry in entries\" class=\"entries\"><div id=\"{{entry.objectId}}\" class=\"entry\"><div class=\"date\">{{prettyDate(entry.date.iso)}}</div><img ng-src=\"{{entry.image.url}}\" ng-show=\"entry.image\" style=\"width:400px; margin: 0 auto;\"><div class=\"type {{entry.type}}\"></div><p ng-bind-html=\"entry.text | hashtagFilter\"></p><div ng-show=\"entry.shelter\" class=\"shelter\"><a href=\"/location/{{entry.shelter.short_name}}\">{{entry.shelter.name}}</a></div></div></div><div style=\"display:none;\" file-dropzone=\"[image/png, image/jpeg, image/gif]\" file=\"newEntry.image.file\" file-name=\"newEntry.image.filename\" data-max-file-size=\"3\" class=\"timeline-drop\"><img ng-src=\"{{newEntry.image.file || newEntry.image.url}}\" style=\"width:100px;height:100px;\"><div ng-click=\"addEntry()\" ng-show=\"newEntry.image.file\" class=\"button add\"></div></div></div>");
$templateCache.put("animals.html","<h1>Animals<div ng-click=\"addAnimal()\" class=\"button add\"></div></h1><select id=\"group-select\" name=\"group\" ng-model=\"selectedGroup\" ng-change=\"fetchAnimals()\" ng-options=\"group for group in [\'Mine\', \'Featured\', \'Adoptable\', \'Kittens\', \'New\']\"></select><select id=\"shelter-select\" name=\"shelter\" ng-model=\"selectedShelter\" ng-change=\"fetchAnimals()\" ng-show=\"selectedGroup == \'Adoptable\'\" ng-options=\"shelter.name for shelter in shelters track by shelter.objectId\"></select><div class=\"animals\"><div ng-repeat=\"animal in animals\" class=\"animal\"><div ng-hide=\"animal.editing\" class=\"not-editing\"><div class=\"header\"><div class=\"cover-container\"><img ng-src=\"{{animal.coverPhoto.url || \'/img/blank_cover.png\'}}\" class=\"cover-photo\"></div><div class=\"profile-col\"><div class=\"profile-photo\"><img ng-src=\"{{animal.profilePhoto.file || animal.profilePhoto.url || \'/img/avatar_blank.png\'}}\" class=\"profile\"></div></div><div class=\"info\"><a ng-href=\"/cat/{{animal.username}}\"><h1>{{animal.name}}</h1></a><a ng-href=\"whiterabbit://kitteh/feed\"><div class=\"app\">App Link</div></a><div class=\"gender\">{{animal.gender}}</div><div class=\"age\">{{animal.age()}}</div><div class=\"breed\">{{animal.breed.name}}</div><div class=\"adoptable\">{{animal.shelter ? (animal.adoptable ? \'Adoptable through \' : \'Adopted through \') : \'\'}}</div><div class=\"shelter\"><a href=\"/location/{{animal.shelter.short_name}}\">{{animal.shelter.name}}</a></div></div><div style=\"float:right;top:-180px;right:20px;position:relative;\" class=\"actions\"><div ng-click=\"editingAnimal(animal)\" class=\"button edit\"></div><div ng-click=\"removeAnimal(animal)\" class=\"button close\"></div><div class=\"clear\"></div></div><div class=\"clear\"></div></div></div><div ng-hide=\"!animal.editing\" class=\"editing\"><div file-dropzone=\"[image/png, image/jpeg, image/gif]\" file=\"animal.profilePhoto.file\" file-name=\"animal.profilePhoto.filename\" data-max-file-size=\"3\" style=\"width:100px;height:100px;\" class=\"profile-photo\"><img ng-src=\"{{animal.profilePhoto.file || animal.profilePhoto.url || \'/img/avatar_blank.png\'}}\" class=\"profile\"></div><input ng-model=\"animal.name\" placeholder=\"Name\" class=\"form-control name\"><input ng-model=\"animal.username\" placeholder=\"@username\" class=\"form-control username\"><div class=\"form-control gender\"><div class=\"label\">Gender</div><select id=\"gender-select\" name=\"gender\" ng-model=\"animal.gender\" ng-options=\"gender for gender in [\'Male\', \'Female\']\"></select></div><div class=\"form-control breed\"><div class=\"label\">Breed</div><select id=\"breed-select\" name=\"breed\" ng-model=\"animal.breed\" ng-options=\"breed.name for breed in breeds track by breed.objectId\"></select></div><div class=\"form-control featured\"><div class=\"label\">Featured?</div><input type=\"checkbox\" ng-model=\"animal.featured\"></div><div class=\"form-control adoptable\"><div class=\"label\">Adoptable?</div><input type=\"checkbox\" ng-model=\"animal.adoptable\"></div><div class=\"form-control shelter\"><div class=\"label\">Shelter</div><select id=\"shelter-select\" name=\"shelter\" ng-model=\"animal.shelter\" ng-options=\"shelter.name for shelter in shelters track by shelter.objectId\"></select></div><input ng-model=\"animal.originalSourceLink\" placeholder=\"Source Url\" class=\"form-control sourceLink\"><input ng-model=\"animal.birthDate\" type=\"date\" placeholder=\"Birth Date\" class=\"form-control birthDate\"><div style=\"float:right;margin-top: 20px; margin-bottom: 50px;\" class=\"actions\"><div ng-click=\"editAnimal(animal)\" ng-hide=\"animal.saving\" class=\"button save\"></div><div ng-click=\"cancelEditing(animal)\" class=\"button close\"></div><div class=\"clear\"></div></div><div class=\"clear\"></div></div></div></div>");
$templateCache.put("breeds.html","<h1>Breeds ({{breeds.length}})</h1><div class=\"breeds\"><div ng-repeat=\"breed in breeds\" class=\"breed\"><form ng-hide=\"breed.editing\"><div class=\"input-group\"><span class=\"input-group-addon\">{{ breed.random }}<img ng-src=\"{{breed.image.file || breed.image.url || \'/img/avatar_blank.png\'}}\" class=\"image\"></span><input ng-model=\"breed.name\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control name\"><div class=\"entry\"><label>Country of Origin</label><input ng-model=\"breed.originCountry\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control origin\"></div><div class=\"entry\"><label>Origin Type</label><input ng-model=\"breed.type\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control type\"></div><div class=\"entry\"><label>Coat</label><input ng-model=\"breed.coat\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control coat\"></div><div class=\"entry\"><label>Grooming Needs</label><input ng-model=\"breed.groomingFrequency\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control groomingFrequency\"></div><div class=\"entry\"><label>Shedding Frequency</label><input ng-model=\"breed.sheddingFrequency\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control sheddingFrequency\"></div><div class=\"entry\"><label>Attention Needed</label><input ng-model=\"breed.attentionNeed\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control attentionNeed\"></div><div class=\"entry\"><label>Activity</label><input ng-model=\"breed.activity\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control activity\"></div><div class=\"entry\"><label>Vocalization</label><input ng-model=\"breed.vocalization\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control vocalization\"></div><div class=\"entry\"><label>Lap Cat</label><input ng-model=\"breed.lapCat\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control lapCat\"></div><div class=\"entry\"><label>Hypoallergenic</label><input ng-model=\"breed.hypoallergenic\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control hypoallergenic\"></div><div class=\"entry\"><label>Min Life Expectancy</label><input ng-model=\"breed.minLifeExpectancy\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control minLifeExpectancy\"></div><div class=\"entry\"><label>Max Life Expectancy</label><input ng-model=\"breed.maxLifeExpectancy\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control maxLifeExpectancy\"></div><div class=\"entry\"><label>Min Weight</label><input ng-model=\"breed.minWeightLbs\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control minWeightLbs\"></div><div class=\"entry\"><label>Max Weight</label><input ng-model=\"breed.maxWeightLbs\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control maxWeightLbs\"></div><div class=\"entry\"><label>Wikipedia URL</label><input ng-model=\"breed.wikipediaUrl\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control hypoallergenic\"></div><textarea ng-model=\"breed.description\" ng-dblclick=\"editingBreed(breed)\" readonly class=\"form-control description\"></textarea><span style=\"width: 70px;\" class=\"input-group-btn\"><div ng-click=\"editingBreed(breed)\" class=\"button edit\"></div><div ng-click=\"removeBreed(breed)\" class=\"button close\"></div></span></div></form><form ng-submit=\"editBreed(breed)\" ng-show=\"breed.editing\"><div class=\"input-group\"><div class=\"input-group-addon\"><div file-dropzone=\"[image/png, image/jpeg, image/gif]\" file=\"breed.image.file\" file-name=\"breed.image.filename\" data-max-file-size=\"3\" style=\"width:150px;height:150px;\" class=\"image\"><img ng-src=\"{{breed.image.file || breed.image.url || \'/img/avatar_blank.png\'}}\" class=\"image\"></div></div><input ng-model=\"breed.name\" class=\"form-control\"><div class=\"entry\"><label>Country of Origin</label><input ng-model=\"breed.originCountry\" placeholder=\"Country of Origin\" class=\"form-control\"></div><div class=\"entry\"><label>Origin Type</label><input ng-model=\"breed.type\" placeholder=\"Type\" class=\"form-control type\"></div><div class=\"entry\"><label>Coat</label><input ng-model=\"breed.coat\" placeholder=\"Coat\" class=\"form-control coat\"></div><div class=\"entry\"><label>Grooming Needs</label><input ng-model=\"breed.groomingFrequency\" placeholder=\"Grooming Frequency\" class=\"form-control groomingFrequency\"></div><div class=\"entry\"><label>Shedding Frequency</label><input ng-model=\"breed.sheddingFrequency\" placeholder=\"Shedding Frequency\" class=\"form-control sheddingFrequency\"></div><div class=\"entry\"><label>Attention Needed</label><input ng-model=\"breed.attentionNeed\" placeholder=\"Attention Needed\" class=\"form-control attentionNeed\"></div><div class=\"entry\"><label>Activity</label><input ng-model=\"breed.activity\" placeholder=\"Activity\" class=\"form-control activity\"></div><div class=\"entry\"><label>Vocalization</label><input ng-model=\"breed.vocalization\" placeholder=\"Vocalization\" class=\"form-control vocalization\"></div><div class=\"entry\"><label>Lap Cat</label><input ng-model=\"breed.lapCat\" type=\"checkbox\" class=\"form-control lapCat\"></div><div class=\"entry\"><label>Hypoallergenic</label><input ng-model=\"breed.hypoallergenic\" type=\"checkbox\" class=\"form-control hypoallergenic\"></div><div class=\"entry\"><label>Min Life Expectancy</label><input ng-model=\"breed.minLifeExpectancy\" type=\"number\" class=\"form-control minLifeExpectancy\"></div><div class=\"entry\"><label>Max Life Expectancy</label><input ng-model=\"breed.maxLifeExpectancy\" type=\"number\" class=\"form-control maxLifeExpectancy\"></div><div class=\"entry\"><label>Min Weight</label><input ng-model=\"breed.minWeightLbs\" type=\"number\" class=\"form-control minWeightLbs\"></div><div class=\"entry\"><label>Max Weight</label><input ng-model=\"breed.maxWeightLbs\" type=\"number\" class=\"form-control maxWeightLbs\"></div><div class=\"entry\"><label>Wikipedia URL</label><input ng-model=\"breed.wikipediaUrl\" placeholder=\"Url\" class=\"form-control wikipediaUrl\"></div><textarea ng-model=\"breed.description\" placeholder=\"Description\" class=\"form-control description\"></textarea><span style=\"width: 70px;\" class=\"input-group-btn\"><div ng-click=\"editBreed(breed)\" class=\"button save\"></div><div ng-click=\"cancelEditing(breed)\" class=\"button close\"></div></span></div></form></div></div><form role=\"form\" ng-submit=\"addBreed()\"><div class=\"input-group\"><input type=\"text\" ng-model=\"newBreed.name\" autofocus class=\"form-control\"><span class=\"input-group-btn\"><div type=\"submit\" class=\"button add\"></div></span></div></form>");
$templateCache.put("hashtag.html","<div class=\"hashtag\"><div class=\"header\"><h2>&#x23{{hashtag}}</h2></div><div ng-repeat=\"entry in entries\" class=\"entries\"><div class=\"entry\"><div class=\"date\">{{prettyDate(entry.date.iso)}}</div><img ng-src=\"{{entry.image.url}}\" ng-show=\"entry.image\" style=\"width:400px; margin: 0 auto;\"><div class=\"type {{entry.type}}\"></div><p ng-bind-html=\"entry.text | hashtagFilter\"></p><div ng-show=\"entry.shelter\" class=\"shelter\"><a href=\"/location/{{entry.shelter.short_name}}\">{{entry.shelter.name}}</a></div></div></div></div>");
$templateCache.put("landing.html","<div class=\"main\"><div id=\"gif_background\"></div><video id=\"video_background\" preload=\"auto\" loop=\"loop\" autoplay=\"true\"><source src=\"/video/kittens1.mp4\" type=\"video/mp4\"><source src=\"/video/kittens1.webm\" type=\"video/webm\">Video not supported</video><div data-color=\"black\" class=\"cover black\"></div><!-- You can change the black color for the filter with those colors: blue, green, red, orange--><div class=\"container\"><h1 class=\"logo\">White Rabbit Apps</h1><div class=\"content\"><h4 class=\"motto\">Hooman, meet kitteh.</h4><div ng-show=\"betaConfirm\" class=\"subscribe\"><div class=\"info-text\"><b>Pawesome! One more thing...</b></div><div class=\"row\"><div class=\"col-md-4 col-md-offset-4 col-sm6-6\">Puuulease confirm your email address by clicking the link in the email we\'re sending right meow!<br>Bat it, claw it, click it.  Whatever works...</div></div></div><div ng-show=\"betaSubscribed\" class=\"subscribe\"><div class=\"info-text\"><b>Meow!</b></div><div class=\"row\"><div class=\"col-md-4 col-md-offset-4 col-sm6-6\">You\'re all set.  We\'ll meow-mail you when we have more information about the beta for you...</div></div></div><div ng-hide=\"betaConfirm || betaSubscribed\" class=\"subscribe\"><div class=\"info-text\"><b>Wanna beta?</b><div class=\"sub\">Sign up and we\'ll meow when we\'re ready for ya.</div></div><div class=\"row\"><div class=\"col-md-4 col-md-offset-4 col-sm6-6\"><form role=\"form\" action=\"http://whiterabbitapps.us10.list-manage.com/subscribe/post\" method=\"POST\" class=\"form-inline\"><input type=\"hidden\" name=\"u\" value=\"d20d913e91337e167e12a139d\"><input type=\"hidden\" name=\"id\" value=\"330df4fbbf\"><input type=\"hidden\" name=\"orig-lang\" value=\"1\"><input type=\"text\" name=\"b_d20d913e91337e167e12a139d_330df4fbbf\" tabindex=\"-1\" value=\"\" style=\"display:none;\"><input type=\"email\" name=\"MERGE0\" placeholder=\"Your email address\" autocapitalize=\"off\" autocorrect=\"off\" size=\"25\" value=\"\"><input type=\"submit\" name=\"submit\" value=\"Sign Up\" class=\"signup\"></form></div></div></div><ul class=\"social\"><li><a href=\"https://www.facebook.com/WhiteRabbitApps\" target=\"_new\"><i class=\"fa fa-facebook\"></i></a></li><li><a href=\"https://twitter.com/WhiteRabbitApps\" target=\"_new\"><i class=\"fa fa-twitter\"></i></a></li><li><a href=\"http://instagram.com/whiterabbitapps/\" target=\"_new\"><i class=\"fa fa-instagram\"></i></a></li><li><a href=\"http://whiterabbitapps.tumblr.com/\" target=\"_new\"><i class=\"fa fa-tumblr\"></i></a></li><li><a href=\"https://www.pinterest.com/whiterabbitapps/\" target=\"_new\"><i class=\"fa fa-pinterest\"></i></a></li><li><a href=\"https://www.youtube.com/channel/UCYwspK10EATMXENmW-txECA\" target=\"_new\"><i class=\"fa fa-youtube-play\"></i></a></li><li><a href=\"https://vine.co/u/1290362136836866048\" target=\"_new\"><i class=\"fa fa-vine\"></i></a></li><div class=\"clear\"></div></ul></div></div><div class=\"footer\"><div class=\"container\"></div></div></div><script src=\"js/jquery-1.10.2.js\" type=\"text/javascript\"></script><script src=\"js/bootstrap.min.js\" type=\"text/javascript\"></script>");
$templateCache.put("location.html","<div class=\"location\"><div class=\"location-header\"><img ng-src=\"{{location.logo.file || location.logo.url || \'/img/avatar_blank.png\'}}\" class=\"logo\"><div class=\"info\"><div class=\"name\">{{location.name}}</div><div class=\"address1\">{{location.address}}</div><div class=\"address2\">{{location.city}}, {{location.state}} {{location.zip}}</div><div class=\"phone\">{{location.phone}}</div><div class=\"email\"><a href=\"mailto:{{location.email}}\">{{location.email}}</a></div><div class=\"links\"><a ng-href=\"{{location.youtubeUrl}}\" target=\"_blank\" ng-show=\"location.youtubeUrl\"><img src=\"/img/youtube.png\"></a><a ng-href=\"{{location.instagramUrl}}\" target=\"_blank\" ng-show=\"location.instagramUrl\"><img src=\"/img/instagram.png\"></a><a ng-href=\"{{location.twitterUrl}}\" target=\"_blank\" ng-show=\"location.twitterUrl\"><img src=\"/img/twitter.png\"></a><a ng-href=\"{{location.fbUrl}}\" target=\"_blank\" ng-show=\"location.fbUrl\"><img src=\"/img/facebook.png\"></a><a ng-href=\"{{location.yelpUrl}}\" target=\"_blank\" ng-show=\"location.yelpUrl\"><img src=\"/img/yelp.png\"></a><a ng-href=\"{{location.website}}\" target=\"_blank\" ng-show=\"location.website\"><img src=\"/img/web.png\"></a></div></div><div class=\"clear\"></div></div><div class=\"animals\"><h4>Adoptable</h4><div ng-repeat=\"animal in animals\" class=\"animal\"><div class=\"header\"><div class=\"cover-container\"><img ng-src=\"{{animal.coverPhoto.url || \'/img/blank_cover.png\'}}\" class=\"cover-photo\"></div><div class=\"profile-col\"><div class=\"profile-photo\"><img ng-src=\"{{animal.profilePhoto.file || animal.profilePhoto.url || \'/img/avatar_blank.png\'}}\" class=\"profile\"></div></div><div class=\"info\"><a ng-href=\"/cat/{{animal.username}}\"><h1>{{animal.name}}</h1></a><div class=\"gender\">{{animal.gender}}</div><div ng-show=\"animal.birthDate\" class=\"age\">{{animal.age()}}</div><div class=\"breed\">{{animal.breed.name}}</div></div></div></div><h4 ng-show=\"alumni.length &gt; 0\">Alumni</h4><div ng-repeat=\"animal in alumni\" class=\"animal alumni\"><div class=\"header\"><div class=\"cover-container\"><img ng-src=\"{{animal.coverPhoto.url || \'/img/blank_cover.png\'}}\" class=\"cover-photo\"></div><div class=\"profile-col\"><div class=\"profile-photo\"><img ng-src=\"{{animal.profilePhoto.file || animal.profilePhoto.url || \'/img/avatar_blank.png\'}}\" class=\"profile\"></div></div><div class=\"info\"><a ng-href=\"/cat/{{animal.username}}\"><h1>{{animal.name}}</h1></a><div class=\"gender\">{{animal.gender}}</div><div ng-show=\"animal.birthDate\" class=\"age\">{{animal.age()}}</div><div class=\"breed\">{{animal.breed.name}}</div></div></div></div></div></div>");
$templateCache.put("locations.html","<h1>Locations</h1><div ng-click=\"addLocation()\" class=\"button add\"></div><select id=\"type-select\" name=\"type\" ng-model=\"selectedType\" ng-change=\"fetchLocations()\"><option value=\"{{type}}\" ng-repeat=\"type in types\">{{type}}</option></select><div ng-repeat=\"location in locations\" class=\"location\"><div ng-hide=\"location.editing\" class=\"not-editing\"><img ng-src=\"{{location.logo.file || location.logo.url || \'/img/avatar_blank.png\'}}\" class=\"logo\"><div class=\"info\"><div class=\"name\"><a href=\"/location/{{location.short_name}}\">{{location.name}}</a></div><div class=\"address1\">{{location.address}}</div><div class=\"address2\">{{location.city}}, {{location.state}} {{location.zip}}</div><div class=\"geo\">{{location.geo.latitude}},{{location.geo.longitude}}</div><div class=\"phone\">{{location.phone}}</div><div class=\"email\">{{location.email}}</div><div class=\"web\"><a ng-href=\"{{location.website}}\" target=\"_blank\">{{location.website}}</a></div><div class=\"fbUrl\"><a ng-href=\"{{location.fbUrl}}\" target=\"_blank\">{{location.fbUrl}}</a></div><div class=\"twitterUrl\"><a ng-href=\"{{location.twitterUrl}}\" target=\"_blank\">{{location.twitterUrl}}</a></div><div class=\"instagramUrl\"><a ng-href=\"{{location.instagramUrl}}\" target=\"_blank\">{{location.instagramUrl}}</a></div><div class=\"yelpUrl\"><a ng-href=\"{{location.yelpUrl}}\" target=\"_blank\">{{location.yelpUrl}}</a></div><div class=\"youtubeUrl\"><a ng-href=\"{{location.youtubeUrl}}\" target=\"_blank\">{{location.youtubeUrl}}</a></div></div><div class=\"actions\"><div ng-click=\"editingLocation(location)\" class=\"button edit\"></div><div ng-click=\"removeLocation(location)\" class=\"button close\"></div><div class=\"clear\"></div></div><div class=\"clear\"></div></div><div ng-hide=\"!location.editing\" class=\"edit\"><div file-dropzone=\"[image/png, image/jpeg, image/gif]\" file=\"location.logo.file\" file-name=\"location.logo.filename\" data-max-file-size=\"3\" style=\"width:100px;height:100px;\"><img ng-src=\"{{location.logo.file || location.logo.url || \'/img/avatar_blank.png\'}}\" class=\"logo\"></div><select name=\"type\" ng-model=\"location.type\"><option value=\"{{type}}\" ng-repeat=\"type in types\">{{type}}</option></select><input ng-model=\"location.name\" placeholder=\"Name\" class=\"form-control name\"><input ng-model=\"location.short_name\" placeholder=\"short_name\" class=\"form-control name\"><input ng-model=\"location.address\" placeholder=\"Address\" class=\"form-control address\"><input ng-model=\"location.city\" placeholder=\"City\" class=\"form-control city\"><input ng-model=\"location.state\" placeholder=\"State\" class=\"form-control state\"><input ng-model=\"location.zip\" placeholder=\"Zip\" class=\"form-control zip\"><input ng-model=\"location.geo.latitude\" class=\"form-control latitude\"><input ng-model=\"location.geo.longitude\" class=\"form-control longitude\"><input ng-model=\"location.email\" placeholder=\"Email\" class=\"form-control email\"><input ng-model=\"location.phone\" placeholder=\"Phone\" class=\"form-control phone\"><input ng-model=\"location.website\" placeholder=\"Website\" class=\"form-control website\"><input ng-model=\"location.fbUrl\" placeholder=\"Facebook Url\" class=\"form-control fbUrl\"><input ng-model=\"location.twitterUrl\" placeholder=\"Twitter Url\" class=\"form-control twitterUrl\"><input ng-model=\"location.instagramUrl\" placeholder=\"Instagram Url\" class=\"form-control instagramUrl\"><input ng-model=\"location.yelpUrl\" placeholder=\"Yelp Url\" class=\"form-control yelpUrl\"><input ng-model=\"location.youtubeUrl\" placeholder=\"Youtube Url\" class=\"form-control youtubeUrl\"><div class=\"actions\"><div ng-click=\"editLocation(location)\" class=\"button save\"></div><div ng-click=\"cancelEditing(location)\" class=\"button close\"></div></div></div></div>");
$templateCache.put("products.html","<h1>Products ({{products.length}})</h1><div class=\"products\"><div ng-repeat=\"product in products\" class=\"product\"><form ng-hide=\"product.editing\"><div class=\"input-group\"><span class=\"input-group-addon\">{{ product.random }}<img ng-src=\"{{product.mainPhoto.file || product.mainPhoto.url || \'/img/avatar_blank.png\'}}\" class=\"image\"></span><input ng-model=\"product.name\" ng-dblclick=\"editingProduct(product)\" readonly class=\"form-control name\"><textarea ng-model=\"product.description\" ng-dblclick=\"editingProduct(product)\" readonly class=\"form-control description\"></textarea><div class=\"entry\"><label>Price</label><input ng-model=\"product.price\" ng-dblclick=\"editingProduct(product)\" readonly class=\"form-control\"></div><div class=\"entry\"><label>Active</label><input ng-model=\"product.active\" ng-dblclick=\"editingProduct(product)\" readonly class=\"form-control\"></div><div class=\"entry\"><label>Manufacturer Name</label><input ng-model=\"product.manufacturerName\" ng-dblclick=\"editingProduct(product)\" readonly class=\"form-control\"></div><div class=\"entry\"><label>Manufacturer URL</label><input ng-model=\"product.manufacturerUrl\" ng-dblclick=\"editingProduct(product)\" readonly class=\"form-control\"></div><div class=\"entry\"><label>Supplier Part Name</label><input ng-model=\"product.supplierPartName\" ng-dblclick=\"editingProduct(product)\" readonly class=\"form-control\"></div><div class=\"entry\"><label>Supplier URL</label><input ng-model=\"product.supplierUrl\" ng-dblclick=\"editingProduct(product)\" readonly class=\"form-control\"></div><div class=\"entry\"><label>Amazon URL</label><input ng-model=\"product.amazonUrl\" ng-dblclick=\"editingProduct(product)\" readonly class=\"form-control\"></div><span style=\"width: 70px;\" class=\"input-group-btn\"><div ng-click=\"editingProduct(product)\" class=\"button edit\"></div><div ng-click=\"removeProduct(product)\" class=\"button close\"></div></span></div></form><form ng-submit=\"editProduct(product)\" ng-show=\"product.editing\"><div class=\"input-group\"><div class=\"input-group-addon\"><div file-dropzone=\"[image/png, image/jpeg, image/gif]\" file=\"product.mainPhoto.file\" file-name=\"product.mainPhoto.filename\" data-max-file-size=\"5\" style=\"width:150px;height:150px;\" class=\"image\"><img ng-src=\"{{product.mainPhoto.file || product.mainPhoto.url || \'/img/avatar_blank.png\'}}\" class=\"image\"></div></div><input ng-model=\"product.name\" class=\"form-control\"><textarea ng-model=\"product.description\" placeholder=\"Description\" class=\"form-control description\"></textarea><div class=\"entry\"><label>Price</label><input ng-model=\"product.price\" type=\"number\" class=\"form-control\"></div><div class=\"entry\"><label>Active</label><input ng-model=\"product.active\" type=\"checkbox\" class=\"form-control\"></div><div class=\"entry\"><label>Manufacturer Name</label><input ng-model=\"product.manufacturerName\" placeholder=\"Name\" class=\"form-control\"></div><div class=\"entry\"><label>Manufacturer URL</label><input ng-model=\"product.manufacturerUrl\" placeholder=\"Url\" class=\"form-control\"></div><div class=\"entry\"><label>Supplier Part Name</label><input ng-model=\"product.supplierPartName\" placeholder=\"Part Name\" class=\"form-control\"></div><div class=\"entry\"><label>Supplier URL</label><input ng-model=\"product.supplierUrl\" placeholder=\"Url\" class=\"form-control\"></div><div class=\"entry\"><label>Amazon URL</label><input ng-model=\"product.amazonUrl\" placeholder=\"Url\" class=\"form-control\"></div><span style=\"width: 70px;\" class=\"input-group-btn\"><div ng-click=\"editProduct(product)\" class=\"button save\"></div><div ng-click=\"cancelEditing(product)\" class=\"button close\"></div></span></div></form></div></div><form role=\"form\" ng-submit=\"addProduct()\"><div class=\"input-group\"><input type=\"text\" ng-model=\"newProduct.name\" autofocus class=\"form-control\"><span class=\"input-group-btn\"><div type=\"submit\" class=\"button add\"></div></span></div></form>");
$templateCache.put("trait.html","<h1>Traits ({{traits.length}})</h1><div ng-repeat=\"trait in traits\"><form ng-hide=\"trait.editing\"><div class=\"input-group\"><h3 ng-dblclick=\"editingTrait(trait)\" readonly class=\"form-control\">{{trait.name}}</h3><span style=\"width:70px;\" class=\"input-group-btn\"><div ng-click=\"editingTrait(trait)\" class=\"button edit\"></div><div ng-click=\"removeTrait(trait)\" class=\"button close\"></div></span></div></form><form ng-submit=\"editTrait(trait)\" ng-show=\"trait.editing\"><div class=\"input-group\"><input ng-model=\"trait.name\" class=\"form-control\"><span class=\"input-group-btn\"><div ng-click=\"cancelEditing(trait)\" class=\"button close\"></div></span></div></form></div><form role=\"form\" ng-submit=\"addTrait()\"><div class=\"input-group\"><input type=\"text\" ng-model=\"newTrait.name\" autofocus class=\"form-control\"><span class=\"input-group-btn\"><div type=\"submit\" class=\"button add\"></div></span></div></form>");
$templateCache.put("users.html","<h1>Users</h1><table id=\"users\" role=\"grid\" aria-describedby=\"dataTables-users\" class=\"table dataTable no-footer\"><thead><tr role=\"row\"><th tabindex=\"0\" aria-controls=\"dataTables-example\" rowspan=\"1\" colspan=\"1\" style=\"width: 60px;\" class=\"sorting\"></th><th tabindex=\"0\" aria-controls=\"dataTables-example\" rowspan=\"1\" colspan=\"1\" aria-sort=\"ascending\" aria-label=\"Rendering engine: activate to sort column descending\" style=\"width: 154px;\" class=\"sorting_asc\">First Name</th><th tabindex=\"0\" aria-controls=\"dataTables-example\" rowspan=\"1\" colspan=\"1\" aria-label=\"Browser: activate to sort column ascending\" style=\"width: 189px;\" class=\"sorting\">Last Name</th><th tabindex=\"0\" aria-controls=\"dataTables-example\" rowspan=\"1\" colspan=\"1\" aria-label=\"Platform(s): activate to sort column ascending\" style=\"width: 175px;\" class=\"sorting\">Email</th><th tabindex=\"0\" aria-controls=\"dataTables-example\" rowspan=\"1\" colspan=\"1\" aria-label=\"Engine version: activate to sort column ascending\" style=\"width: 131px;\" class=\"sorting\">Admin</th><th tabindex=\"0\" aria-controls=\"dataTables-example\" rowspan=\"1\" colspan=\"1\" aria-label=\"Engine version: activate to sort column ascending\" style=\"width: 131px;\" class=\"sorting\">Shelter</th><th tabindex=\"0\" aria-controls=\"dataTables-example\" rowspan=\"1\" colspan=\"1\" aria-label=\"Engine version: activate to sort column ascending\" style=\"width: 131px;\" class=\"sorting\"></th></tr></thead><tbody><tr role=\"row\" ng-repeat=\"user in users\" class=\"gradeA user odd\"><td><img ng-src=\"{{user.profilePhoto.url}}\" class=\"profile\"></td><td>{{user.firstName}}</td><td>{{user.lastName}}</td><td>{{user.email}}</td><td>{{user.admin}}</td><td>{{user.shelter.name}}</td><td><a ng-click=\"makeAdmin(user)\">Make Admin</a></td></tr></tbody></table>");}]);