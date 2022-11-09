'use strict';

angular.module('listnride', [

  /* app_core_start */
  'bikeCard',
  'user',
  'bike',
  'booking',
  'requests',
  'message',
  'list',
  'infinite-scroll',
  'invoices',
  'autocomplete',
  'confirmation',
  'listings',
  'listingCard',
  'rating',
  'listingABike',
  'rentingABike',
  'multiBooking',
  'static',
  'listnride.constant',
  'metaTags',
  'receipt',
  'lnr-support',
  'inputRange',
  'addressInput',
  'lnrMetaRobots',
  'categoryFilter',
  'bikeCountFilter',
  'accessoriesFilter',
  'creditCardInput',
  'statusLabels',
  'bookingCalendar',
  'paypalCheckoutButton',
  'breadcrumbs',
  'bikeCardsList',

  /* app_core_end */

  /* app_extras_start */
  'home',
  'seoGrid',
  'search',
  'header',
  'footer',
  'invite',
  'inviteLanding',
  'settings',
  'invest',
  'businessCommunity',
  'jobs',
  'seoLanding',
  'cityLanding',
  'countryLanding',
  'categoryLanding',
  'filter',
  'bikeSorter',
  'cardgrid',
  'privacyBar',
  'faq',
  'brands',
  /* BRANDS_PAGE */
  'ampler-integration',
  'bonvelo-integration',
  'brompton-integration',
  'cocomatIntegration',
  'leaosIntegration',
  'moeveIntegration',
  'motoparilla-integration',
  'muli-integration',
  'rethinkIntegration',
  'swytchIntegration',
  'vanmoofIntegration',
  'veletage-integration',
  'vello-integration',
  'veloheldIntegration',
  'votec-integration',
  'whyteIntegration',
  'feltIntegration',
  'unimokeIntegration',
  'bzenIntegration',
  'urwahnIntegration',
  'cowboybikesIntegration',
  'argon18Integration',
  'rossignolIntegration',
  'yubaIntegration',
  'matebikesIntegration',
  /* EVENTS_PAGE */
  'event',
  'capeArgus',
  'constanceSpin',
  'crossride',
  'pushnpost',
  'kuchenundraketen',
  'depart',
  'eroicaGaiole',
  'inVeloVeritas',
  'mcbw',
  'raphaSuperCross',
  'supercrossMunich',
  'velosoph',
  'coffeespin',
  /* app_extras_end */

  /* external_modules_start */
  'ngAnimate',
  'ngMaterial',
  'ngMessages',
  'pascalprecht.translate',
  'ui.router',
  'internationalPhoneNumber',
  'ngStorage',
  'ezfb',
  'ngMap',
  'luegg.directives',
  'ngFileUpload',
  'ngImgCrop',
  'ngSanitize',
  'angular-input-stars',
  'ngMeta',
  'infinite-scroll',
  'slickCarousel',
  'angulartics',
  'angulartics.google.analytics',
  'angulartics.facebook.pixel',
  '720kb.socialshare',
  'angularMoment',
  'credit-cards',
  /* external_modules_end */
])
.config(['$translateProvider', '$localStorageProvider', '$translatePartialLoaderProvider', 'ezfbProvider', '$mdAriaProvider', '$locationProvider', '$compileProvider', 'ngMetaProvider', 'ENV', 'socialshareConfProvider',
  function (
    $translateProvider,
    $localStorageProvider,
    $translatePartialLoaderProvider,
    ezfbProvider,
    $mdAriaProvider,
    $locationProvider,
    $compileProvider,
    ngMetaProvider,
    ENV,
    socialshareConfProvider
  ) {

    $mdAriaProvider.disableWarnings();
    $compileProvider.debugInfoEnabled(false);

    ezfbProvider.setInitParams({
      appId: ENV.facebookPlatformKey,
      // Module default is `v2.6`.
      // If you want to use Facebook platform `v2.3`, you'll have to add the following parameter.
      // https://developers.facebook.com/docs/javascript/reference/FB.init
      version: 'v2.8'
    });

    socialshareConfProvider.configure([
    {
      'provider': 'facebook',
      'conf': {
        'trigger': 'click',
        'popupHeight': 800,
        'popupWidth': 400
      }
    }
    ]);

    // cause to fail the route reload
    // when you are some route like /renting-a-bike or any
    // other then refreshing page fails
    // whoever worked on it fix it then enable it
    $locationProvider.html5Mode({
      enabled: ENV.html5Mode,
      requireBase: false
    });

    // use partial loader
    $translatePartialLoaderProvider.addPart(ENV.defaultTranslation);
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: 'app/i18n/{part}/{lang}.json'
    });

    // use cached translation
    $translateProvider.useLoaderCache(true);

    // Retrieves locale from subdomain if valid, otherwise sets the default.
    var retrieveLocale = function () {
      // default and available languages
      var defaultLanguage = "en";
      var availableLanguages = ["de", "en", "nl", "it", "es", "fr"];
      var specialDomains = { at: "de" };

      // host and domains
      var host = window.location.host;
      var domain = host.split(".");
      // top level domain, will be used in future
      var topLevelDomain = domain[domain.length - 1];
      var retrievedLanguage = "";

      // using localhost
      if (host.indexOf("localhost") >= 0 || host[0].match('localhost')) {
        retrievedLanguage = $localStorageProvider.get('selectedLanguage') ? $localStorageProvider.get('selectedLanguage') : defaultLanguage;
      }
      // staging or production
      else {
        // select the language
        // either get from top domain or select the english version
        if (availableLanguages.indexOf(topLevelDomain) >= 0) retrievedLanguage = topLevelDomain;
        else retrievedLanguage = specialDomains[topLevelDomain] || defaultLanguage;
      }

      return retrievedLanguage;
    };

    $translateProvider.preferredLanguage(retrieveLocale());
    $translateProvider.useSanitizeValueStrategy(['escapeParameters']);
    ngMetaProvider.setDefaultTitle('listnride');
    // These default tags below are also set in ngMeta.js to be used if disableUpdate is true
    ngMetaProvider.setDefaultTag('prerender-status-code', '200');
    ngMetaProvider.setDefaultTag('og:image', 'http://www.listnride.com/app/assets/ui_images/opengraph/lnr_standard.jpg');
  }
])
.run(function(
  $translate,
  ngMeta,
  $rootScope,
  $location,
  authentication,
  api,
  $state
) {
  // load partial translations based on the language selected
  $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
    $translate.refresh();
  });
  $rootScope.location = $location;
  $rootScope.lang = $translate.preferredLanguage();
  ngMeta.init();

  // TODO: check why we call this function here
  if (authentication.loggedIn && !_.isEmpty(authentication.userId())) {
    api.get('/users/' + authentication.userId()).then(
      function (success) {
        var user = success.data;
        authentication.setCredentials(user);
      },
      function (error) {
      }
    );
  }

  // on route change we ask if users token is still valid
  $rootScope.$on("$locationChangeStart", function (event, next, current) {
    authentication.checkTokenExpiration();
    $state.params.hideCoview ? coview('hideChatButton') : coview('showChatButton');
  });
});
