// Require Node Modules
var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    Parse = require('parse/node'),
    ParseServer = require('parse-server').ParseServer,
    S3Adapter = require('parse-server').S3Adapter,
    SNSAdapter = require('parse-server').SNSAdapter,
    // parseAdaptor = require('./cloud/prerender-parse.js'),
    // prerender = require("./cloud/prerenderio.js").setAdaptor(parseAdaptor(Parse)).set("prerenderToken", "2ymS1B3grxMTCzfud9D6"),
    connect_s4a = require('connect-s4a');

if (!process.env.DATABASE_URI) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  serverURL: 'http://www.whiterabbitapps.net/api/',
  databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.PARSE_APP_ID || 'IWr9xzTirLbjXH80mbTCtT9lWB73ggQe3PhA6nPg',
  masterKey: process.env.PARSE_MASTER_KEY || 'OAfKo4xeECdDiUHFXHgctp8HZv7teJT0fUkqMnwQ',
  clientKey: process.env.CLIENT_KEY || 'Yxdst3hz76abMoAwG7FLh0NwDmPvYHFDUPao9WJJ',
  restAPIKEY: process.env.RESTAPI_KEY || 'SkDTdS8SBGzO9BkRHR3H8kwxCLJSvKsAe1jeOTnW',
  fileKey: process.env.FILE_KEY || '76b6cc17-92eb-4048-be57-afbc6cb6e77d',
  facebookAppIds : '417687371726647',
  // filesAdapter: new S3Adapter(
  //   process.env.AWS_ACCESS_KEY,
  //   process.env.AWS_SECRET_ACCESS_KEY,
  //   'whiterabbitapps',
  //   {directAccess: true}
  // ),
  push: {
    ios: {
      pfx: __dirname + '/certs/Certificates.p12',
      bundleId: 'net.whiterabbitapps.WhiteRabbit',
      production: true
    }
  }
});

// filesAdapter: new S3Adapter(
//   process.env.AWS_ACCESS_KEY,
//   process.env.AWS_SECRET_ACCESS_KEY,
//   {bucket: process.env.AWS_BUCKET_NAME, bucketPrefix: "", directAccess: true}
// )
// pushAdapter: new SNSAdapter(
//   process.env.AWS_ACCESS_KEY,
//   process.env.AWS_SECRET_ACCESS_KEY,
//   {region: "us-east-1"}
// )

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
  if (request.url.includes('/api/')) return next();
  response.sendFile(__dirname + '/public/index.html');
});

// app.all('/api/*', function(req, res, next){
//     console.log('General Validations');
//     next();
// });

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
