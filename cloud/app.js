var app, express;

express = require("express");

app = express();

app.set("views", "cloud/views");

app.set("view engine", "jade");

app.use(express.bodyParser());

app.listen();
