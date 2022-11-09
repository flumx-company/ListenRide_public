"use strict";

var middleware = {
  helmet: require('helmet'),
  express: require('express'),
  expressEnforcesSSL: require('express-enforces-ssl')
};
/*
 * file and dirertory for index and index-shop template files
 */
var staticServe = {
  "dir": "/listnride/dist",
  "prod": { "file": "index.html", "dir": "/listnride/dist" },
  "shop": { "file": "index-shop.html", "dir": "/listnride/dist" }
};

// express app & servings
middleware.app =  middleware.express();

// by default serve production environment
staticServe.options = { index: staticServe.shop.file };

var retrieveTld = function (hostname) {
  return hostname.replace(/^(.*?)\listnride/, "");
};

var determineHostname = function (subdomains, hostname) {
  var domainPrefix = "www.";
  var domainEnding = retrieveTld(hostname);
  for (var i = 0; i < subdomains.length; i++) {
    switch (subdomains[i]) {
      case "de":
        domainEnding = ".de";
        break;
      case "nl":
        domainEnding = ".nl";
        break;
      case "it":
        domainEnding = ".it";
        break;
      case "es":
        domainEnding = ".es";
        break;
      case "fr":
        domainEnding = ".fr";
        break;
      case "en":
        domainEnding = ".com";
        break;
    }
    if (subdomains[i] === "staging") {
      domainPrefix = "www.staging.";
    }
  }
  return domainPrefix + "listnride" + domainEnding;
};
var stripTrailingSlash = function (url) {
  return url;
};
/*
 * returns boolean for either redirection should be used or not
 * redirection is only used for production and staging
 */
var shouldRedirect = function (host) {
  return host.includes("listnride.com") ||
         host.includes("listnride.de")  ||
         host.includes("listnride.nl")  ||
         host.includes("listnride.it")  ||
         host.includes("listnride.fr")  ||
         host.includes("listnride.es");
};
/*
 * force https redirect for staging and production
 * not used for local host and heroku review apps
 */
var enableHttps = function () {
  // prerender
  var prerender = require('prerender-node').set('prerenderToken', 'W8S4Xn73eAaf8GssvVEw');
  prerender.crawlerUserAgents.push('googlebot');
  prerender.crawlerUserAgents.push('bingbot');
  prerender.crawlerUserAgents.push('yandex');
  middleware.app.use(prerender);
  // middleware.app.use(require('prerender-node').set('prerenderToken', 'W8S4Xn73eAaf8GssvVEw'));
  // setting proper http headers
  middleware.app.use(middleware.helmet());
  // redirect to https
  middleware.app.enable('trust proxy');
  middleware.app.use(middleware.expressEnforcesSSL());
};
/*
 * refirect to proper domain on staging and production
 * should not redirect for local host and heroku review apps
 */
var redirectToProperDomain = function (req, res, next) {
  if (shouldRedirect(req.headers.host)) {
    var host = stripTrailingSlash(determineHostname(req.subdomains, req.hostname));
    var url = stripTrailingSlash(req.originalUrl);
    if (req.hostname !== host || req.originalUrl !== url) {
      res.redirect(301, "https://" + host + url);
      return;
    }
  }
  next();
};

/*
 * log the request
 * no functional use, only for debugging
 */
var logger = function (req) {
  console.log("full url: ", req.protocol + '://' + req.get('host') + req.originalUrl);
};
/*
 *
 */
var isShopEnvironment = function (req) {
  // get the full url
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  // excluded folders (local folders)
  var foldersToExclude = ["app/assets/", ".png", ".jpg", ".min.js", ".json"];
  var includesAssets = fullUrl.includes(foldersToExclude[0]) || fullUrl.includes(foldersToExclude[1]) || fullUrl.includes(foldersToExclude[2]);
  var includesJs = fullUrl.includes(foldersToExclude[3]) || fullUrl.includes(foldersToExclude[4]);

  // if url contains any of the local static files
  if (includesAssets || includesJs) { return undefined; }

  // if url contains shop param
  else if (req.query.shop >= 0 && fullUrl.includes("/booking")) { return true; }

  // by default
  return false;
};
/* enable_https_start */
//removeIf(middleware)
enableHttps();
//endRemoveIf(middleware)
/* enable_https_end */

/*
 * proper redirects
 * app.get and app.use --> https://goo.gl/gUZ764
 */
middleware.app.use(function (req, res, next) {
  redirectToProperDomain(req, res, next);
});

/*
 * redirect to new brandpage urls
 * (from /rent-ampler-bikes to /brands/ampler)
 */
middleware.app.use('/rent-\*-bikes', function (req, res, next) {
  var brandName = req.originalUrl.split('-')[1];
  res.redirect(301, "/brands/" + brandName);
});

/*
 * intercept each call and check environment
 */
middleware.app.use('/*', function (req, res, next) {
  // is shop flag
  var isShopEnv = isShopEnvironment(req);

  // serve build based on environment
  if (isShopEnv === true) {
    staticServe.options.index = staticServe.shop.file;
  } else if (isShopEnv === false) {
    staticServe.options.index = staticServe.prod.file;
  }

  // propagate
  next();
});
/*
 * by default serves index.html
 * http://expressjs.com/en/4x/api.html#express.static
 */
middleware.app.use(middleware.express.static(__dirname.concat(staticServe.dir), staticServe.options));
/*
  intercept each request
  log the request props
*/
middleware.app.use('/*', function (req, res) {
  res.sendFile(__dirname.concat(staticServe.dir, "/", staticServe.options.index));
});
/*
 * start middleware
 */
middleware.app.set('port', (process.env.PORT || 9003));
middleware.app.listen(middleware.app.get('port'));