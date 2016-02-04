// Require Node Modules
var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    Parse = require('parse/node'),
    ParseCloud = require('parse-cloud-express'),
    ParseServer = require('parse-server').ParseServer,
    // parseAdaptor = require('./cloud/prerender-parse.js'),
    // prerender = require("./cloud/prerenderio.js").setAdaptor(parseAdaptor(Parse)).set("prerenderToken", "2ymS1B3grxMTCzfud9D6"),
    connect_s4a = require('connect-s4a');


if (!process.env.DATABASE_URI) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: 'myAppId',
  masterKey: 'myMasterKey',
  fileKey: 'http://files.parsetfss.com/76b6cc17-92eb-4048-be57-afbc6cb6e77d/'
});


var app = express();

// Import your cloud code (which configures the routes)
// require('./cloud/main.js');
// Mount the webhooks app to a specific path (must match what is used in scripts/register-webhooks.js)
// app.use('/webhooks', ParseCloud.app);

app.set("view engine", "jade");

// Host static files from public/
app.use(express.static(__dirname + '/public'));

app.use(connect_s4a("d3c44980d364f87184334d863759dbe7"));
// app.use(prerender);

app.get('/*', function(request, response, next) {
  response.sendFile(__dirname + '/public/index.html');
});

var mountPath = process.env.PARSE_MOUNT || '/api';
app.use(mountPath, api);

// Catch all unknown routes.
// app.all('/', function(request, response) {
//   response.status(404).send('Page not found.');
// });

/*
 * Launch the HTTP server
 */
var port = process.env.PORT || 5000;
var server = http.createServer(app);
server.listen(port, function() {
  console.log('Cloud Code Webhooks server running on port ' + port + '.');
});
