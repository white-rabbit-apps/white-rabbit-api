White Rabbit Web App
===============================


# Technologies

## Languages
- [Coffeescript](http://coffeescript.org/)
- [Jade](http://jade-lang.com/)
- [Less](http://www.lesscss.org/)

## Framework|Tools
- [AngularJS](http://angularjs.org/)
- [Bootstrap3](http://getbootstrap.com/)
- [Gulp](http://gulpjs.com/)
- Livereload

# Requirements

- [NodeJS](http://nodejs.org/)

# Installation

  `npm install`

# Asset export

  [Install Sketchtool](http://www.sketchapp.com/tool/)

  `sketchtool export slices "../../design/iPhone.sketch" --output="src-public/assets/img/"`

  `sketchtool export slices "../../design/Web.sketch" --output="src-public/assets/img/"`

# Configuration

Edit the [config/global.json](./config/global.json) file to write the configuration of your Parse.com project in order to use the Parse's CLI.
Edit the [src-public/app.coffee](./src-public/app.coffee) file to replace the ParseProvider keys.

Enjoy!

# Development server

  `npm run-script watch`

Access to the application at this address: http://127.0.0.1:8008
The livereload update your browser each time you change source files.

The Frontend source files are into the [src-public](./src-public) directory and compile to the public directory.
The Backend source files are into the [src-cloud](./src-cloud) directory and compile to the cloud directory.

# Deploy on Parse Cloud

  `npm run-script deploy-parse`


## Heroku details

Set up the necessary details in your Heroku config and deploy:

```
heroku config:set HOOKS_URL=yourherokuurl
heroku config:set PARSE_APP_ID=yourappid
heroku config:set PARSE_MASTER_KEY=yourmasterkey
heroku config:set PARSE_WEBHOOK_KEY=yourkeyhere

git push heroku master
```

A post-install script (`scripts/register-webhooks.js`) will enumerate your webhooks and register them with Parse.

### Caveats

Cloud Code required you to use `cloud/` as a prefix for all other .js files, even though they were in the same folder.  That doesn't apply here, so you'll need to update any require statements in files under `cloud/` to reference just `./` instead.

The first-party modules hosted by Parse will not be available (sendgrid, mailgun, stripe, image, etc.) and you'll need to update your code to use the official modules available via npm.

The base mount path is set in both `server.js` and `scripts/register-webhooks.js` and must be equal.
