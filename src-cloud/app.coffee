
# These two lines are required to initialize Express in Cloud Code.
express = require("express")
app = express()
# parseAdaptor = require("cloud/prerender-parse.js")
# app.use require("cloud/prerenderio.js").setAdaptor(parseAdaptor(Parse)).set("prerenderToken", "2ymS1B3grxMTCzfud9D6")

# Global app configuration section
app.set "views", "cloud/views" # Specify the folder to find templates
app.set "view engine", "jade" # Set the template engine
# app.use express.bodyParser() # Middleware for reading request body

# app.get '/*', (req, res) ->
#   res.render 'src-public/index.jade'

# app.use(express.static(__dirname + '/public'))
#
# app.get '/*', (request, response, next) ->
#   response.sendfile __dirname + '/public/index.html'

# Attach the Express app to Cloud Code.
app.listen()


# app.use((req, res, next) ->
#   res.set('Location', '/#!' + req.path).status(301).send()
# )

# app.get('*', (req, res) ->
#   res.render("/#/cat/pishi")
# )


# // Example reading from the request query string of an HTTP get request.
# app.get('/test', function(req, res) {
#   // GET http://example.parseapp.com/test?message=hello
#   res.send(req.query.message);
# });

# // Example reading from the request body of an HTTP post request.
# app.post('/test', function(req, res) {
#   // POST http://example.parseapp.com/test (with request body "message=hello")
#   res.send(req.body.message);
# });
