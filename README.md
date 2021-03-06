# sails-hook-user

Creates all the user's functionality for login and registration

Make sure you have a css stylesheet called login.css and that will be the only style for that page

## Routes created
```javascript
GET /register
POST /register

GET /login
POST /login

GET /logout
POST /logout

GET /request_password_reset
POST /request_password_reset

GET /resetPassword
POST /resetPassword
```

## How to Install

* 1) Install the module

```bash
npm i https://github.com/bxfsh/sails-hook-user.git --save
```
this will install all the EJS files and all the routes 

* 2) Then you need to override your /config/views.js

```javascript
/**
 * View Engine Configuration
 * (sails.config.views)
 *
 * This checks for the correct layout file and minimizes the HTML before sending to the front end
 *
 * http://sailsjs.org/#/documentation/concepts/Views
 */

var minify = require('html-minifier').minify;
var ejs = require('ejs-locals');

var parsing = function(path,options,fn) {

  var str;

  options.locals = options.locals || {};

  // finding the correct layout file
  // the path is relative 
  switch (options.view.path) {

    case ('faq') :
    case ('403') :
    case ('500') :
    case ('404') :
      options.locals._layoutFile = 'layout.ejs';
      break;
    default:
      options.locals._layoutFile = '../layout.ejs';
      break;
  }

  ejs(path, options, function(err, str) {
    try {
      // minimizing the HTML, you can skip this part by just return the str 
      // or check for the sails enviroment before doing so
      str = minify(str, {collapseWhitespace: true, removeComments: true});
    } catch (_) { }
    return fn(err, str);
  });
};

module.exports.views = {

  engine: {
    ext: 'ejs',
    fn: parsing
  },

  // set the default layout to false
  layout: false

};
```

* 3) Style

By default this hook does not generate any css, but to style it you only need to create a css file called login.css in the root stylesheet folder

you can find a sample here https://github.com/bxfsh/sails-hook-user/blob/master/sample/login.css
