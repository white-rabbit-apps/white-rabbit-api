// Require Node Modules
var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    Parse = require('parse/node'),
    ParseServer = require('parse-server').ParseServer,
    S3Adapter = require('parse-server').S3Adapter,
    SNSAdapter = require('parse-server').SNSAdapter,
    connect_s4a = require('connect-s4a'),
    cors = require('cors');

if (!process.env.DATABASE_URI) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var ios_bundle_id = 'net.whiterabbitapps.WhiteRabbit-dev'
var apns_certificate = __dirname + '/certs/dev.p12'
var apns_production = false

if (process.env.ENV == 'production') {
  ios_bundle_id = 'net.whiterabbitapps.WhiteRabbit'
  apns_certificate = __dirname + '/certs/production.p12'
  apns_production = true
}

var api = new ParseServer({
  serverURL: process.env.DATABASE_URI || 'http://localhost:5000/api/',
  databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.PARSE_APP_ID,
  masterKey: process.env.PARSE_MASTER_KEY,
  clientKey: process.env.CLIENT_KEY,
  restAPIKEY: process.env.RESTAPI_KEY,
  fileKey: process.env.FILE_KEY,
  filesAdapter: new S3Adapter(
    process.env.AWS_ACCESS_KEY,
    process.env.AWS_SECRET_ACCESS_KEY,
    'whiterabbitapps',
    {directAccess: true}
  ),
  push: {
    ios: {
      pfx: apns_certificate,
      bundleId: ios_bundle_id,
      production: apns_production
    }
  }
});

// facebookAppIds : '417687371726647',

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

app.set("view engine", "jade");

app.use(cors());

// Host static files from public/
app.use(express.static(__dirname + '/public'));

app.use(connect_s4a("d3c44980d364f87184334d863759dbe7"));


app.get('/*', function(request, response, next) {
  if (request.url.includes('/api/')) return next();

  if (request.url.includes('/admin/')) {
    var un = 'bosskitteh';
  	var pw = '#inurwebz#';
    if(un == undefined && pw == undefined) { response.end(); return; }
    if(!request.headers['authorization']){
        response.writeHead(401, {'WWW-Authenticate': 'Basic realm="Secure Area"', 'Content-Type': 'text/plain'});
        response.end("You must have credentials for this page");
        return;
    }
    var header=request.headers['authorization']||'',        // get the header
        token = header.split(/\s+/).pop()||'',            // and the encoded auth token
        auth = new Buffer(token, 'base64').toString(),    // convert from base64
        parts = auth.split(/:/),                          // split on colon
        username = parts[0],
        password = parts[1];
    if(username != un || password != pw){
        response.statusCode = 401
		    response.end("Incorrect username or password");
    }
    else {
    	response.statusCode = 200;
    }
  }

  response.sendFile(__dirname + '/public/index.html');
});

// var auth = function (request, response, next) {
//   function unauthorized(res) {
//     response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
//     return response.send(401);
//   };
//
//   var user = basicAuth(req);
//
//   if (!user || !user.name || !user.pass) {
//     return unauthorized(res);
//   } else if (user.name === 'foo' && user.pass === 'bar') {
//     return next();
//   } else {
//     return unauthorized(res);
//   };
// };
//
// app.get('/admin/', auth, function (req, res) {
//   res.send(200, 'Authenticated');
// });

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
