// Require Node Modules
var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    Parse = require('parse/node'),
    ParseCloud = require('parse-cloud-express'),
    parseAdaptor = require("./cloud/prerender-parse.js"),
    rewriter = require('express-rewrite');



var app = express();

// app.use(rewriter);
//
// app.get('/cat/:name', rewriter.rewrite('/#/cat/$1'));

// Import your cloud code (which configures the routes)
require('./cloud/main.js');
// Mount the webhooks app to a specific path (must match what is used in scripts/register-webhooks.js)
app.use('/webhooks', ParseCloud.app);
app.use(require("./cloud/prerenderio.js").setAdaptor(parseAdaptor(Parse)).set("prerenderToken", "2ymS1B3grxMTCzfud9D6"));

app.set("view engine", "jade");

// app.get(/(?:^|[^#])\/cat\/(.*)$/, rewrite('\/#\/$2'));
// app.get(/^\/cats\/(.*)$/, rewrite('/#/cat/$1'));
// app.use(rewrite('/js/*', '/public/assets/js/$1'));

  // app.get('/*', function (req, res) {
  //     res.render('./index');
  // });

app.get('/cat/*', function(request, response, next) {
  response.sendfile(__dirname + '/public/index.html');
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
