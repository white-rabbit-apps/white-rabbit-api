// Require Node Modules
var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    Parse = require('parse/node'),
    ParseCloud = require('parse-cloud-express'),
    parseAdaptor = require("./cloud/prerender-parse.js");



var app = express();

// Import your cloud code (which configures the routes)
require('./cloud/main.js');
// Mount the webhooks app to a specific path (must match what is used in scripts/register-webhooks.js)
app.use('/webhooks', ParseCloud.app);
app.use(require("./cloud/prerenderio.js").setAdaptor(parseAdaptor(Parse)).set("prerenderToken", "2ymS1B3grxMTCzfud9D6"));

app.set("view engine", "jade");

app.get('/*', function(req, res) {
  return res.render('public/index.jade');
});

// Host static files from public/
app.use(express.static(__dirname + '/public'));

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
