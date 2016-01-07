var app, express, parseAdaptor;

express = require("express");

app = express();

parseAdaptor = require("./cloud/prerender-parse.js");

app.use(require("./cloud/prerenderio.js").setAdaptor(parseAdaptor(Parse)).set("prerenderToken", "2ymS1B3grxMTCzfud9D6"));

app.set("views", "cloud/views");

app.set("view engine", "jade");

app.use(express.bodyParser());

app.get('/*', function(req, res) {
  return res.render('src-public/index.jade');
});

app.listen();
