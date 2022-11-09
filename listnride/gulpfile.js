"use strict";

var del = require('del');
var gulp = require('gulp');
var config = require('./gulp.config.js')();
var rev = require('gulp-rev');
var gulpIf = require('gulp-if');
var es = require('event-stream');
var postcss = require('postcss');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var useref = require('gulp-useref');
var inject = require('gulp-inject');
var replace = require('gulp-replace');
var remove = require('gulp-remove-code');
var rename = require("gulp-rename");
var uglify = require('gulp-uglifyjs');
var purifyCss = require('gulp-purifycss');
var imagemin = require('gulp-imagemin');
var htmlmin = require('gulp-htmlmin');
var stylish = require('jshint-stylish');
var minifyCss = require('gulp-clean-css');
var runSequence = require('run-sequence');
var jsonminify = require('gulp-jsonminify');
var revReplace = require('gulp-rev-replace');
var ngAnnotate = require('gulp-ng-annotate');
var ngConstant = require('gulp-ng-constant');
var templateCache = require('gulp-angular-templatecache');
var htmlReplace = require('gulp-html-replace');
var request = require('request');
var scope;
var scopeSelector;
var path = config.path;
var environments = config.environments;
var processEnv = process.env.ENVIRONMENT;
var argvEnv = ('local' === processEnv || 'staging' === processEnv || 'production' === processEnv) ? processEnv : 'local';
var env = environments[argvEnv];
var _ = require('lodash/core')

// linter and code checking
gulp.task('lint', lint);

// html cache related tasks
gulp.task('inject-templates', injectTemplates);
gulp.task('cache-module-templates', cacheModuleTemplates);
gulp.task('cache-service-templates', cacheServiceTemplates);

// translations, fonts and app constant
gulp.task('copy-downloadables', copyDownloadables);
gulp.task('copy-index-dist', copyIndexDist);
gulp.task('copy-index-tmp', copyIndexTmp);
gulp.task('copy-index-app', copyIndexApp);
gulp.task('minify-i18n', minifyI18n);
gulp.task('html-minify', htmlMinify);
gulp.task('constants', appConstants);
gulp.task('translation-constants', translationConstants);
gulp.task('copy-i18n', copyI18n);

// listnride and vendor scripts
gulp.task('scripts', scripts);
gulp.task('scripts-production', scriptsProduction);
gulp.task('scripts-shop-trim', scriptsShopTrim);
gulp.task('scripts-shop', scriptsShop);
gulp.task('scripts-minify', scriptsMinify);
gulp.task('base-tag', baseTag);

// images and fonts
gulp.task('images-png', imagesPng);
gulp.task('images-svg', imagesSvg);
gulp.task('copy-fonts', copyFonts);
gulp.task('images', ['images-png', 'images-svg']);

// remove the caches, clean extra folders after running scripts
gulp.task('clean', clean);
gulp.task('clean-extra', cleanExtras);
gulp.task('clean-extra-local', cleanExtrasLocal);
gulp.task('changes-in-index', changesInIndex);
gulp.task('watch', watch);

// append revisions to invalidate cache after deployment
gulp.task('revisions', revisions);
gulp.task('revisions-index', revisionsIndex);
gulp.task('revisions-index-shop', revisionsIndexShop);

// shop integration related tasks
gulp.task('resources-lnr-shop-integration', resourcesLnrShopIntegration);
gulp.task('minify-lnr-shop-integration', minifyLnrShopIntegration);
gulp.task('clean-lnr-shop-integration', cleanLnrShopIntegration);
gulp.task('deploy-lnr-shop-integration', deployLnrShopIntegration);

// shop solution related tasks
gulp.task('resources-lnr-shop-solution', resourcesLnrShopSolution);
gulp.task('concat-lnr-shop-solution', concatLnrShopSolution);
gulp.task('minify-lnr-shop-solution', minifyLnrShopSolution);
gulp.task('clean-lnr-shop-solution', cleanLnrShopSolution);
gulp.task('deploy-lnr-shop-solution', deployLnrShopSolution);
gulp.task('clean-lnr-shop', cleanLnrShop);

// gulp major tasks
gulp.task('disable-https', disableHttps);
gulp.task('default', ['local']);
gulp.task('deploy', deploy);
gulp.task('local', local);

// create the sitemap
gulp.task('generate-sitemap', generateSitemap);

/**
 * create two new variables for translation provider
 * @returns {gulp} for chaining
 */
function translationConstants() {
    return ngConstant({
            wrap: false,
            constants: env.constants,
            name: env.context.name + '.constant',
            stream: true,
        })
        .pipe(rename(path.app.constant))
        .pipe(gulp.dest(path.app.root));
}
/**
 * helper method for lnrPrefixCss
 */
scope = postcss(function (css) {
    css.walkRules(function (rule) {
        rule.selectors = rule.selectors.map(function (selector) {
            if (selector.trim().toLowerCase() === 'body') {
                return scopeSelector;
            } else if (selector.trim() === 'from' || selector.trim() === 'to' || !isNaN(+selector[0])) {
                return selector;
            } else {
                return scopeSelector + ' ' + selector;
            }
        });
    });
});
/**
 * prefixes the styles with
 * prefixer is be used to avoid styles global leakage
 * @param {object} scopeSelectorOption options for prefixes
 * @returns {callback} callback
 */
function lnrPrefixCss(scopeSelectorOption) {
    scopeSelector = scopeSelectorOption;
    return es.map(function (file, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isBuffer()) {
            file.contents = new Buffer(scope.process(file.contents).css);
        }
        if (file.isStream()) {
            var through = es.through();
            var wait = es.wait(function (err, contents) {
                through.write(scope.process(contents).css);
                through.end();
            });
            file.contents.pipe(wait);
            file.contents = through;
        }
        return callback(null, file);
    });
}
/**
 * eslint through all js files
 * @returns {gulp} for chaining
 */
function lint() {
    return gulp.src(path.js)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
}
/**
 * inject template cache files in index.html
 * modules.tpl.min.js and services.tpl.min.js reference in index
 * @returns {gulp} for chaining
 */
function injectTemplates() {
    // production
    gulp.src(path.dist.index)
        .pipe(inject(gulp.src(path.dist.templatesCache, { read: false }), { relative: true, removeTags: true }))
        .pipe(gulp.dest(path.dist.root));
    // shop
    return gulp.src(path.dist.indexShop)
        .pipe(inject(gulp.src(path.dist.templatesCache, { read: false }), { relative: true, removeTags: true }))
        .pipe(gulp.dest(path.dist.root));
}
/**
 * create templates.js file to serve all html files
 * js cache of html from module folder
 * @returns {gulp} for chaining
 */
function cacheModuleTemplates() {
    return gulp.src(path.app.templates)
        .pipe(templateCache('modules.tpl.min.js', {
            root: 'app/modules/',
            module: 'listnride'
        }))
        .pipe(gulp.dest(path.dist.root));
}
/**
 * create templates.js file to serve all html files
 * js cache of html from services folder
 * @returns {gulp} for chaining
 */
function cacheServiceTemplates() {
    return gulp.src(path.app.serviceTemplate)
        .pipe(templateCache('services.tpl.min.js', {
            root: 'app/services/',
            module: 'listnride'
        }))
        .pipe(gulp.dest(path.dist.root));
}
/**
 * copy original index file to tmp folder
 * preserves the original file
 * @returns {gulp} for chaining
 */
function copyIndexTmp() {
    return gulp.src(path.index)
        .pipe(gulp.dest('.tmp'));
}
/**
 * copy original index file back to app
 * restore original index from .tmp
 * @returns {gulp} for chaining
 */
function copyIndexApp() {
    return gulp.src('.tmp/index.html')
        .pipe(gulp.dest('./'));
}
/**
 * copy all files from downloads folder to root for deployment
 * mostly sitemap.xml files
 * @returns {gulp} for chaining
 */
function copyDownloadables() {
    return gulp.src(path.app.downloadables)
        .pipe(gulp.dest(path.dist.root));
}
/**
 * concat all vendors files, js and css
 * minify and uglify vendors files
 * @returns {gulp} for chaining
 */
function scriptsProduction() {
    return gulp.src(path.app.index)
        .pipe(useref())
        .pipe(gulpIf(path.app.js, uglify()))
        .pipe(gulpIf(path.nodeModules, uglify()))
        .pipe(gulpIf('*.css', minifyCss()))
        .pipe(gulp.dest(path.dist.root));
}
/**
 * copy app-core as app-shop
 * copy index as index-shop
 * @returns {gulp} for chaining
 */
function scriptsShop() {
    return gulp.src(path.app.indexShop)
        .pipe(useref())
        .pipe(gulpIf(path.app.js, uglify()))
        .pipe(gulpIf(path.nodeModules, uglify()))
        .pipe(gulpIf('*.css', minifyCss()))
        .pipe(gulp.dest(path.dist.root));
}
function scriptsShopTrim() {
    // javascript
    gulp.src(path.dist.appShop)
        .pipe(remove({ shop: true }))
        .pipe(gulp.dest(path.dist.root));
    // html
    return gulp.src(path.dist.indexShop)
        .pipe(remove({ shop: true }))
        .pipe(gulp.dest(path.dist.root));
}
/**
 * concat all development js files - local
 * minify and uglify development files
 * @returns {gulp} for chaining
 */
function scriptsMinify() {
    // production scripts
    gulp.src(path.dist.app)
        .pipe(concat(path.dist.source))
        .pipe(ngAnnotate())
        .pipe(gulp.dest(path.dist.root))
        .pipe(uglify(path.dist.source))
        .pipe(gulp.dest(path.dist.root));
    // shop scripts
    gulp.src(path.dist.appShop)
        .pipe(concat(path.dist.sourceShop))
        .pipe(ngAnnotate())
        .pipe(gulp.dest(path.dist.root))
        .pipe(uglify(path.dist.sourceShop))
        .pipe(gulp.dest(path.dist.root));
    // vendor
    return gulp.src(path.dist.vendors)
        .pipe(uglify(path.dist.sourceVendors))
        .pipe(gulp.dest(path.dist.root));
}
/**
 * reflect changes on dist/index
 * @param {clean~cleanCallback} cb - The callback that handles the response.
 * @returns {gulp} for chaining
 */
function scripts(cb) {
    return runSequence(
        'scripts-production',
        'scripts-shop',
        'scripts-shop-trim',
        cb
    );
}
function htmlMinify() {
    // production
    gulp.src(path.dist.index)
    .pipe(htmlmin(path.htmlMinifyOptions))
    .pipe(gulp.dest(path.dist.root));
    // shop
    return gulp.src(path.dist.indexShop)
    .pipe(htmlmin(path.htmlMinifyOptions))
    .pipe(gulp.dest(path.dist.root));
}
/**
 * copy new referenced index file to dist
 * index file with new references to dist folder
 * @returns {gulp} for chaining
 */
function copyIndexDist() {
    return gulp.src('./app/index.html')
        .pipe(gulp.dest(path.dist.root));
}
/**
 * base tag for deployment
 * used in production so that `/#/` needs not to be used with url
 * @returns {gulp} for chaining
 */
function baseTag() {
    return gulp.src(path.dist.index)
        .pipe(htmlReplace({
            'base': path.app.base
        }))
        .pipe(gulp.dest(path.dist.root));
}
/**
 * disable https for local and review apps
 * @returns {gulp} for chaining
 */
function disableHttps() {
    // do not disable https for staging and production
    if ('staging' === processEnv || 'production' === processEnv) { return; }
    // remove enableHttps method from middleware
    return gulp.src(path.middleware.file)
        .pipe(remove({ middleware: true }))
        .pipe(gulp.dest(path.middleware.root));
}
/**
 * copy i18n translations to dist folder
 * @returns {gulp} for chaining
 */
function copyI18n() {

    // copy and minify angular local source file
    gulp.src(path.app.i18nJs)
        .pipe(gulp.dest(path.dist.i18n))
        .pipe(uglify(path.dist.i18nJs))
        .pipe(gulp.dest(path.dist.i18n));

    // copy and minify translation files
    return gulp.src(path.app.i18n)
        .pipe(gulp.dest(path.dist.i18n))
        .pipe(jsonminify())
        .pipe(gulp.dest(path.dist.i18n));
}
/**
 * minify i18n translations
 * @returns {gulp} for chaining
 */
function minifyI18n() {
    return gulp.src(path.dist.i18nFiles)
        .pipe(jsonminify())
        .pipe(gulp.dest(path.dist.i18n));
}
/**
 * copy fonts to dist folder
 * @returns {gulp} for chaining
 */
function copyFonts() {
    return gulp.src(path.app.fonts)
        .pipe(gulp.dest(path.dist.fonts));
}
/**
 * copy sitemapindex.xml to dist folder
 * @returns {gulp} for chaining
 */
function copySitemapIndex() {
    return gulp.src(path.app.downloads + 'sitemapindex.xml')
        .pipe(gulp.dest(path.dist.root));
}
/**
 * copy sitemapindex.xml to dist folder
 * @returns {gulp} for chaining
 */
function copyRobotTxt() {
    return gulp.src(path.app.downloads + 'robots.txt')
        .pipe(gulp.dest(path.dist.root));
}
/**
 * optimize png images
 * loseless compression
 * @returns {gulp} for chaining
 */
function imagesPng() {
    return gulp.src(path.app.images)
        .pipe(imagemin({
            progressive: true,
            plugins: [imagemin.optipng(env.imageOptions)]
        }))
        .pipe(gulp.dest(path.dist.images));
}
/**
 * optimize svg images
 * lose-less compression
 * @returns {gulp} for chaining
 */
function imagesSvg() {
    return gulp.src(path.app.icons)
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            plugins: [imagemin.svgo()]
        }))
        .pipe(gulp.dest(path.dist.icons));
}
/**
 * generates sitemap from local template and remote seo pages
 * before every deployment for up-to-date seo info
 * @returns {gulp} for chaining
 */
function generateSitemap(language) {
    var tlds = ['com', 'de', 'nl', 'es', 'it'];
    var date = new Date().toISOString();
    var endpoint = environments.production.constants.ENV.apiEndpoint + '/seo_pages';
    request(endpoint, function (error, response, body) {
        var result = JSON.parse(body).all_cities;
        _.each(tlds, function (tld) {
            // Generating sitemap for listnride for different languages
            var xmlString = "";
            for(var i = 0; i < result.length; i++) {
                xmlString += "<url>\n";
                xmlString += "\t<loc>https://www.listnride." + tld + "/" + encodeURI(result[i]) + "</loc>\n";
                xmlString += "\t<lastmod>" + date + "</lastmod>\n";
                xmlString += "\t<changefreq>always</changefreq>\n";
                xmlString += "</url>\n";
            }
            gulp.src([path.app.downloads + 'sitemap.xml'])
            .pipe(replace('<!-- GULP INSERT CURRENT DATE -->', date))
            .pipe(replace('<!-- GULP INSERT SEO PAGES -->', xmlString))
            .pipe(replace('com', tld))
            .pipe(rename('sitemap-' + tld + '.xml'))
            .pipe(gulp.dest(path.dist.root));
        });
    });
    copySitemapIndex();
    copyRobotTxt();
}
/**
 * clean dist folder
 * before every deployment
 * @param {clean~cleanCallback} cb - The callback that handles the response.
 * @returns {gulp} for chaining
 */
function clean(cb) {
    var cleanFiles = [path.dist.root, 'app/app.min.js'];
    return del(cleanFiles, cb);
}
/**
 * clean extra folders
 * with every deployment - files with revisions are used instead
 * @returns {gulp} for chaining
 * @param {cleanExtras~cleanExtrasCallback} cb - The callback that handles the response.
 */
function cleanExtras(cb) {
    return del(path.filesToBeCleaned, cb);
}
/**
 * generate the angular constant
 * with respect to environments
 * local, staging, production
 * @returns {gulp} for chaining
 */
function appConstants() {
    return ngConstant({
            wrap: false,
            constants: env.constants,
            name: env.context.name + '.constant',
            stream: true,
        })
        .pipe(rename(path.app.constant))
        .pipe(gulp.dest(path.app.root));
}
/**
 * after every deploy
 * @returns {gulp} for chaining
 * @param {cleanExtrasLocal~cleanExtrasLocalCallback} cb - The callback that handles the response.
 */
function cleanExtrasLocal(cb) {
    var cleanFiles = 'local' === argvEnv ? [] : path.filesToBeCleanedProduction;
    return del(cleanFiles, cb);
}
/**
 * required for deploy
 * because app.min.js is at same level with index.html in deployment
 * while in local env, app.min.js and index are at d/f levels
 * TODO: app.min.js and index.html should be at same level in local env
 * @returns {gulp} for chaining
 */
function changesInIndex() {
    return gulp.src([path.dist.index])
        .pipe(replace(path.app.appjs, path.dist.source))
        .pipe(gulp.dest(path.dist.root));
}
/**
 * watch changes in js files, used for local development
 * @returns {gulp} for chaining
 */
function watch() {
    gulp.watch(path.alljs, path.watchers);
}
/**
 * generate revisions of js files
 * to invalidate browser cache on deployment
 * @returns {gulp} for chaining
 */
function revisions() {
    return gulp.src([path.dist.js, path.dist.css])
        .pipe(gulp.dest(path.dist.root))
        .pipe(rev())
        .pipe(gulp.dest(path.dist.root))
        .pipe(rev.manifest())
        .pipe(gulp.dest(path.dist.root));
}
/**
 * replace revision in index file
 * replace js files references in index with revisions
 * @returns {gulp} for chaining
 */
function revisionsIndex() {
    var manifest = gulp.src(path.dist.manifest);
    return gulp.src(path.dist.index)
        .pipe(revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest(path.dist.root));
}
function revisionsIndexShop() {
    var manifest = gulp.src(path.dist.manifest);
    return gulp.src(path.dist.indexShop)
        .pipe(revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest(path.dist.root));
}
/**
 * prefix lnr shop integration and vendors styles
 * with listnride id to avoid leakage of styles
 * other option is to used iframe
 * @returns {gulp} for chaining
 */
function resourcesLnrShopIntegration() {
    return gulp.src(path.lnrShopIntegration.css)
        // concat lnr and vendor css files
        .pipe(concat(path.lnrShopIntegration.dist.css))
        // remove unused styles from css files
        .pipe(purifyCss([path.lnrShopIntegration.jsGlob]))
        // prefix style with #listnride
        .pipe(lnrPrefixCss(path.lnrShopIntegration.prefix))
        // minify concatinated css
        .pipe(minifyCss(path.lnrShopIntegration.dist.css))
        // save to dist folder
        .pipe(gulp.dest(path.lnrShopIntegration.dist.root));
}
/**
 * minify -- shop integration
 * @returns {gulp} for chaining
 */
function minifyLnrShopIntegration() {

    // copy template to dist folder
    gulp.src(path.lnrShopIntegration.html)
        .pipe(gulp.dest(path.lnrShopIntegration.dist.root));

    // minify source for shop integration
    // copy to dist folder of shop integration
    return gulp.src(path.lnrShopIntegration.js)
        .pipe(concat(path.lnrShopIntegration.dist.source))
        .pipe(gulp.dest(path.lnrShopIntegration.dist.root))
        .pipe(uglify(path.lnrShopIntegration.dist.source))
        .pipe(gulp.dest(path.lnrShopIntegration.dist.root));
}
/**
 * clean dist folder -- shop integration
 * @param {Callback} cb for chaining
 * @returns {Callback} callback from del
 */
function cleanLnrShopIntegration(cb) {
    var cleanFiles = [path.lnrShopIntegration.dist.root];
    return del(cleanFiles, cb);
}
/**
 * minification and clean -- shop integration
 * @param {Callback} cb for chaining
 * @returns {void}
 */
function deployLnrShopIntegration(cb) {
    runSequence(
        'clean-lnr-shop-integration',
        'minify-lnr-shop-integration',
        'resources-lnr-shop-integration',
        cb
    );
}
/**
 * copy template to tmp folder
 * @returns {Object} gulp object for chaining
 */
function resourcesLnrShopSolution() {
    return gulp.src(path.lnrShopSolution.resource)
        .pipe(gulp.dest(path.lnrShopSolution.dist.root));
}
/**
 * get build tags from template
 * generate concatenated source and style
 * save results in dist folder
 * @returns {gulp} chaining
 */
function concatLnrShopSolution() {
    return gulp.src(path.lnrShopSolution.html)
        .pipe(useref())
        .pipe(gulpIf(path.lnrShopSolution.source, uglify()))
        .pipe(gulpIf(path.lnrShopSolution.style, minifyCss()))
        .pipe(gulp.dest(path.lnrShopSolution.dist.root));
}
/**
 * get build tags from template
 * generate minified source and style
 * save results in dist folder
 * @returns {Object} gulp object for chaining
 */
function minifyLnrShopSolution() {
    gulp.src(path.lnrShopSolution.dist.source)
        .pipe(uglify(path.lnrShopSolution.dist.js))
        .pipe(gulp.dest(path.lnrShopSolution.dist.root));

    return gulp.src(path.lnrShopSolution.dist.style)
        .pipe(concat(path.lnrShopSolution.dist.css))
        .pipe(gulp.dest(path.lnrShopSolution.dist.root))
        .pipe(minifyCss(path.lnrShopSolution.dist.css))
        .pipe(gulp.dest(path.lnrShopSolution.dist.root));
}
/**
 * clean dist folder -- shop solution
 * @param {Callback} cb for chaining
 * @returns {Callback} callback from del
 */
function cleanLnrShopSolution(cb) {
    var cleanFiles = [path.lnrShopSolution.dist.root];
    return del(cleanFiles, cb);
}
/**
 * run all shop solution tasks [clean, resource, concat, minify]
 * sequential tasks
 * @param {Callback} cb for chaining
 * @returns {void}
 */
function deployLnrShopSolution(cb) {
    runSequence(
        'clean-lnr-shop-solution',
        'resources-lnr-shop-solution',
        'concat-lnr-shop-solution',
        'minify-lnr-shop-solution',
        cb
    );
}
/**
 * clean dist folder -- shop solution
 * @param {Callback} cb for chaining
 * @returns {Callback} callback from del
 */
function cleanLnrShop(cb) {
    var cleanFiles = [path.lnrShopSolution.dist.root, path.lnrShopIntegration.dist.root];
    return del(cleanFiles, cb);
}
/**
 * tasks for local development
 * @returns {gulp} for chaining
 * @param {local~localCallback} cb - The callback that handles the response.
 */
function local(cb) {
    runSequence(
        'lint',
        'clean',
        'scripts-local',
        'images',
        'watch',
        cb);
}
/**
 * tasks for deployment
 *
 * DO NOT CHANGE THE SEQUENCE - SYNCHRONOUS COMMANDS
 * CHANGING THE SEQUENCE WILL MAKE YOU SLEEPLESS
 * DO NOT RUN IN LOCAL ENVIRONMENT
 *
 * @returns {gulp} for chaining
 * @param {deploy~deployCallback} cb - The callback that handles the response.
 */
function deploy(cb) {
    runSequence(
        'clean',
        'constants',
        'copy-index-tmp',
        'cache-module-templates',
        'cache-service-templates',
        'images',
        'copy-fonts',
        'scripts',
        'scripts-minify',
        'inject-templates',
        'copy-index-app',
        'copy-i18n',
        'minify-i18n',
        'changes-in-index',
        'revisions',
        'revisions-index',
        'revisions-index-shop',
        'base-tag',
        'html-minify',
        'generate-sitemap',
        'copy-downloadables',
        'clean-extra',
        'clean-extra-local',
        'disable-https',
        cb);
}