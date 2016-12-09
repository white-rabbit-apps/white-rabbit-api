// Require Node Modules
var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    Parse = require('parse/node'),
    ParseServer = require('parse-server').ParseServer,
    S3Adapter = require('parse-server').S3Adapter,
    SNSAdapter = require('parse-server').SNSAdapter,
    cors = require('cors'),
    SimpleSendGridAdapter = require('parse-server-sendgrid-adapter');


var api = new ParseServer({
  appName: 'CommuniKitty',
  verifyUserEmails: true,
  publicServerURL: process.env.PUBLIC_SERVER_URL,
  serverURL: process.env.SERVER_API_URL || 'http://127.0.0.1:8008',
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
    process.env.AWS_BUCKET_NAME,
    {directAccess: true}
  ),
  emailAdapter: SimpleSendGridAdapter({
    // The address that your emails come from
    fromAddress: 'meow@communikitty.com',
    // Your domain from mailgun.com
    domain: 'communikitty.com',
    // Your API key from mailgun.com
    apiKey: process.env.SENDGRID_KEY,
  }),
  push: {
    ios: [
      {
        pfx: __dirname + '/certs/dev.p12',
        bundleId: 'net.whiterabbitapps.communikitty',
        production: false
      },{
        pfx: __dirname + '/certs/prod.p12',
        bundleId: 'net.whiterabbitapps.communikitty',
        production: true
      }
    ]
  }
});

var app = express();

var mountPath = '/'; //process.env.PARSE_MOUNT || '/api';
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
