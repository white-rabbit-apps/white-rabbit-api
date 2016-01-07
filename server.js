// Require Node Modules
var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    Parse = require('parse/node'),
    ParseCloud = require('parse-cloud-express'),
    // parseAdaptor = require('./cloud/prerender-parse.js'),
    // prerender = require("./cloud/prerenderio.js").setAdaptor(parseAdaptor(Parse)).set("prerenderToken", "2ymS1B3grxMTCzfud9D6"),
    connect_s4a = require('connect-s4a');

var app = express();

// Import your cloud code (which configures the routes)
require('./cloud/main.js');
// Mount the webhooks app to a specific path (must match what is used in scripts/register-webhooks.js)
app.use('/webhooks', ParseCloud.app);

app.set("view engine", "jade");

// // In our app.js configuration
// app.use(function(req, res, next) {
//   var fragment = req.query._escaped_fragment_;
//
//   // If there is no fragment in the query params
//   // then we're not serving a crawler
//   if (!fragment) return next();
//
//   // If the fragment is empty, serve the
//   // index page
//   if (fragment === "" || fragment === "/")
//     fragment = "/index.html";
//
//   // If fragment does not start with '/'
//   // prepend it to our fragment
//   if (fragment.charAt(0) !== "/")
//     fragment = '/' + fragment;
//
//   // If fragment does not end with '.html'
//   // append it to the fragment
//   if (fragment.indexOf('.html') == -1)
//     fragment += ".html";
//
//   // Serve the static html snapshot
//   try {
//     var file = __dirname + "/public" + fragment;
//     res.sendfile(file);
//   } catch (err) {
//     res.send(404);
//   }
// });

// Host static files from public/
app.use(express.static(__dirname + '/public'));

app.use(connect_s4a("d3c44980d364f87184334d863759dbe7"));
// app.use(prerender);

app.get('/*', function(request, response, next) {
  response.sendFile(__dirname + '/public/index.html');
});

// Catch all unknown routes.
app.all('/', function(request, response) {
  response.status(404).send('Page not found.');
});

/*
 * Launch the HTTP server
 */
var port = process.env.PORT || 5000;
var server = http.createServer(app);
server.listen(port, function() {
  console.log('Cloud Code Webhooks server running on port ' + port + '.');
});
