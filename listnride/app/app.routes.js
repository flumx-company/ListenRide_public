/*
 * This page defines the routes for the frontend application
 *
 * IMPORTANT! When adding new routes make sure to set the "noindex"
 * meta tag to false to let search engines index our page.
 * Depening if a resolve is needed or not, do it like in the
 * home state (with resolve) or in the user state (without resolve)
 *
 * Contents
 *
 * LNR_PAGES ........... site pages
 * EVENT_PAGES ......... pages with events
 * BRANDS_PAGES ........ pages with brands
 * CITY_PAGES .......... page for cities (auto generated)
 * 404_PAGE ............ 404 page and redirect rule
 */

(function () {
  'use strict';
  angular.
  module('listnride').
  config(['$stateProvider', '$urlRouterProvider', '$urlServiceProvider',

    function ($stateProvider, $urlRouterProvider, $urlServiceProvider) {

      // Custom type
      $urlServiceProvider.config.type('underscoreEncodedSpaces', {
        pattern: /[^\/]+/,
        encode: function (location) {
          return location.replace(/ /g, '_');
        },
        decode: function (location) {
          return location.replace(/_/g, ' ');
        },
        equals: function (left, right) {
          return left === right;
        },
        is: function (value) {
          return typeof value === 'string';
        }
      });

      /* ------------------------------------ */
      /* LNR_PAGES */
      /* ------------------------------------ */

      // home
      $stateProvider.state({
        name: 'home',
        url: '/',
        template: '<home></home>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["home.meta-title", "home.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["home.meta-title"]);
                ngMeta.setTag("description", translations["home.meta-description"]);
                ngMeta.setTag("noindex", false);
                // Below is how to set the OG:IMAGE if disableUpdate is true
                // ngMeta.setTag("og:image", "imageurl.jpg");
              })
          }]
        },
        meta: {
          disableUpdate: true
          // Below is how to set the OG:IMAGE if disableUpate is false
          // 'og:image': 'imageurl.jpg'
        }
      });

      // home/verify
      $stateProvider.state({
        name: 'verify',
        url: '/verify',
        template: '<home></home>'
      });

      // home/confirm
      $stateProvider.state({
        name: 'confirm',
        url: '/confirm/{userId:int}/{confirmationCode:string}',
        template: '<home></home>'
      });

      // home/change_password
      $stateProvider.state({
        name: 'change_password',
        url: '/change_password/{userId:int}/{passwordChangeToken:string}',
        template: '<home></home>'
      });

      // home/change_password
      $stateProvider.state({
        name: 'authorise3d',
        url: '/authorise3d/{requestId:int}?succeed',
        template: '<home></home>'
      });

      // home/business-signup
      $stateProvider.state({
        name: 'businessSignup',
        url: '/business-signup',
        template: '<home></home>'
      });

      // bikes/{id}
      $stateProvider.state({
        name: 'bike',
        url: '/bikes/{bikeId:int}?start_date&duration&size&frame_size',
        template: '<bike></bike>',
        reloadOnSearch: false,
        params: {
          date: {
            value: "",
            squash: true
          },
          duration: {
            value: "",
            squash: true
          },
          size: {
            value: "",
            squash: true
          },
          frame_size: {
            value: "",
            squash: true
          }
        },
        resolve: {
          data: ['ngMeta', function (ngMeta) {
            ngMeta.setTag("noindex", true);
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // booking
      $stateProvider.state({
        name: 'booking',
        url: '/booking?bikeId&size&frame_size&startDate&endDate&shop',
        template: '<booking></booking>',
        reloadOnSearch: false,
        params: {
          hideFooter: false,
          hideHeader: false
        },
        resolve: {
          data: ['ngMeta', function (ngMeta) {
            ngMeta.setTag("noindex", true);
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // list-view
      $stateProvider.state({
        name: 'list-view',
        url: '/list-view',
        template: '<bike-list-view></bike-list-view>'
      });

      // search
      $stateProvider.state({
        name: 'search',
        url: '/search/{location}?start_date&duration&sizes&categories&brand&lat&lng&ne&sw',
        template: '<search></search>',
        reloadOnSearch: false,
        params: {
          hideFooter: true,
          brand: {
            value: "",
            squash: true
          },
          start_date: {
            value: "",
            squash: true
          },
          duration: {
            value: "",
            squash: true
          },
          sizes: {
            value: "",
            squash: true
          },
          categories: {
            value: "",
            squash: true
          },
          lat: {
            value: "",
            squash: true
          },
          lng: {
            value: "",
            squash: true
          },
          ne: {
            value: "",
            squash: true
          },
          sw: {
            value: "",
            squash: true
          }
        },
        resolve: {
          data: ['ngMeta', function (ngMeta) {
            ngMeta.setTag("noindex", true);
          }]
        }
      });

      // user/{id}
      $stateProvider.state({
        name: 'user',
        url: '/users/{userId:int}',
        template: '<user></user>',
        resolve: {
          data: ['ngMeta', function (ngMeta) {
            ngMeta.setTag("noindex", true);
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // requests/{id}
      $stateProvider.state({
        name: 'requests',
        url: '/requests/?requestId',
        reloadOnSearch: false,
        params: {
          hideCoview: true,
          hideFooter: true,
          requestId: {
            squash: true,
            value: null
          }
        },
        template: '<requests></requests>',
        resolve: {
          data: ['ngMeta', function (ngMeta) {
            ngMeta.setTag("noindex", true);
            coview('hideChatButton');
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // list-a-bike
      $stateProvider.state({
        name: 'list',
        url: '/list-bike',
        template: '<list heading="\'list.list-bike\'" is-list-mode=true discount-field-editable=true></list>',
        resolve: {
          data: ['ngMeta', function (ngMeta) {
            ngMeta.setTag("noindex", false);
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // listings
      $stateProvider.state({
        name: 'listings',
        url: '/listings?page&q',
        template: '<listings></listings>',
        reloadOnSearch: false,
        params: {
          q: {
            value: "",
            squash: true
          },
          page: {
            value: "",
            squash: true
          }
        },
        resolve: {
          data: ['ngMeta', function (ngMeta) {
            ngMeta.setTag("noindex", true);
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // invoices
      $stateProvider.state({
        name: 'invoices',
        url: '/invoices',
        template: '<invoices></invoices>',
        resolve: {
          data: ['ngMeta', function (ngMeta) {
            ngMeta.setTag("noindex", true);
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // edit-bike/{id}
      $stateProvider.state({
        name: 'edit',
        url: '/edit-bike/{bikeId:int}',
        template: '<list heading="\'list.edit-bike\'" is-list-mode=false discount-field-editable=true></list>',
        resolve: {
          data: ['ngMeta', function (ngMeta) {
            ngMeta.setTag("noindex", true);
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // settings
      $stateProvider.state({
        name: 'settings',
        url: '/settings',
        template: '<settings></settings>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["settings.meta-title", "settings.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["settings.meta-title"]);
                ngMeta.setTag("description", translations["settings.meta-description"]);
                ngMeta.setTag("noindex", true);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // listing-a-bike
      $stateProvider.state({
        name: 'listingABike',
        url: '/listing-a-bike',
        template: '<listing-a-bike></listing-a-bike>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["list-a-bike.meta-title", "list-a-bike.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["list-a-bike.meta-title"]);
                ngMeta.setTag("description", translations["list-a-bike.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // renting-a-bike
      $stateProvider.state({
        name: 'rentingABike',
        url: '/renting-a-bike',
        template: '<renting-a-bike></renting-a-bike>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["rent-a-bike.meta-title", "rent-a-bike.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["rent-a-bike.meta-title"]);
                ngMeta.setTag("description", translations["rent-a-bike.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // about
      $stateProvider.state({
        name: 'about',
        url: '/about',
        templateUrl: 'app/modules/static/about.template.html',
        controller: 'StaticController',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.about-us.meta-title", "meta.about-us.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.about-us.meta-title"]);
                ngMeta.setTag("description", translations["meta.about-us.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // invest
      $stateProvider.state({
        name: 'invest',
        url: '/invest',
        template: '<invest></invest>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.invest.meta-title", "meta.invest.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.invest.meta-title"]);
                ngMeta.setTag("description", translations["meta.invest.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // trust-and-safety
      $stateProvider.state({
        name: 'trustAndSafety',
        url: '/trust-and-safety',
        templateUrl: 'app/modules/static/trust-and-safety.template.html',
        controller: 'StaticController',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.trust-and-safety.meta-title", "meta.trust-and-safety.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.trust-and-safety.meta-title"]);
                ngMeta.setTag("description", translations["meta.trust-and-safety.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // terms
      $stateProvider.state({
        name: 'terms',
        url: '/terms',
        templateUrl: 'app/modules/static/terms.template.html',
        controller: 'StaticController',
        resolve: {
              data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
                  $translate(["meta.terms-and-conditions.meta-title", "meta.terms-and-conditions.meta-description"])
                      .then(function (translations) {
                          ngMeta.setTitle(translations["meta.terms-and-conditions.meta-title"]);
                          ngMeta.setTag("description", translations["meta.terms-and-conditions.meta-description"]);
                          ngMeta.setTag("noindex", false);
                      })
              }]
          },
          meta: {
              disableUpdate: true
          }
      });

      // help
      $stateProvider.state({
        name: 'help',
        url: '/help',
        templateUrl: 'app/modules/static/help.template.html',
        controller: 'StaticController',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.contact-and-help.meta-title", "meta.contact-and-help.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.contact-and-help.meta-title"]);
                ngMeta.setTag("description", translations["meta.contact-and-help.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // jobs
      $stateProvider.state({
        name: 'jobs',
        url: '/jobs?position',
        template: '<jobs></jobs>',
        reloadOnSearch: false,
        params: {
          position: {
            value: "",
            squash: true
          }
        },
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.jobs.meta-title", "meta.jobs.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.jobs.meta-title"]);
                ngMeta.setTag("description", translations["meta.jobs.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // press
      $stateProvider.state({
        name: 'press',
        url: '/press',
        templateUrl: 'app/modules/static/press.template.html',
        controller: 'StaticController',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.press.meta-title", "meta.press.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.press.meta-title"]);
                ngMeta.setTag("description", translations["meta.press.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // imprint
      $stateProvider.state({
        name: 'imprint',
        url: '/imprint',
        templateUrl: 'app/modules/static/imprint.template.html',
        controller: 'StaticController',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.imprint.meta-title", "meta.imprint.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.imprint.meta-title"]);
                ngMeta.setTag("description", translations["meta.imprint.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // privacy
      $stateProvider.state({
        name: 'privacy',
        url: '/privacy',
        templateUrl: 'app/modules/static/privacy.template.html',
        controller: 'StaticController',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.privacy.meta-title", "meta.privacy.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.privacy.meta-title"]);
                ngMeta.setTag("description", translations["meta.privacy.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // how-it-works
      $stateProvider.state({
        name: 'howItWorks',
        url: '/how-it-works',
        templateUrl: 'app/modules/static/how-it-works.template.html',
        controller: 'StaticController',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.how-it-works.meta-title", "meta.how-it-works.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.how-it-works.meta-title"]);
                ngMeta.setTag("description", translations["meta.how-it-works.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // bikeshop
      $stateProvider.state({
        name: 'shopLanding',
        url: '/bikeshop',
        templateUrl: 'app/modules/static/shop-landing.template.html',
        controller: 'StaticController',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.shop-landing.meta-title", "meta.shop-landing.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.shop-landing.meta-title"]);
                ngMeta.setTag("description", translations["meta.shop-landing.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // business-community
      $stateProvider.state({
        name: 'businessCommunity',
        url: '/business-community',
        template: '<business-community></business-community>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.business-community.meta-title", "meta.business-community.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.business-community.meta-title"]);
                ngMeta.setTag("description", translations["meta.business-community.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // brands
      $stateProvider.state({
        name: 'brands',
        url: '/brands?view',
        template: '<brands></brands>',
        reloadOnSearch: false,
        params: {
          view: {
            value: "",
            squash: true
          }
        },
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.brands.meta-title", "meta.brands.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.brands.meta-title"]);
                ngMeta.setTag("description", translations["meta.brands.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // how-to-shoot-bike-photos
      $stateProvider.state({
        name: 'how-to-shoot-bike-photos',
        url: '/how-to-shoot-bike-photos',
        templateUrl: 'app/modules/static/how-to-shoot-bike-photos.template.html',
        controller: 'StaticController',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
              $translate(["meta.events.common.meta-title", "meta.events.common.meta-description"])
                  .then(function () {
                      ngMeta.setTitle("");
                      ngMeta.setTag("description", "");
                      ngMeta.setTag("noindex", false);
                  })
          }]
      },
      meta: {
          disableUpdate: true
      }
      });

      // invite-friends
      $stateProvider.state({
        name: 'invite',
        url: '/invite-friends',
        template: '<invite></invite>',
        resolve: {
          data: ['ngMeta', function (ngMeta) {
            ngMeta.setTag("noindex", false);
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // invitation/{invideCode}
      $stateProvider.state({
        name: 'inviteLanding',
        url: '/invitation?inviteCode',
        template: '<invite-landing></invite-landing>',
        resolve: {
          data: ['ngMeta', function (ngMeta) {
            ngMeta.setTag("noindex", false);
          }]
        },
        meta: {
          disableUpdate: true
        },
        params: {
          inviteCode: {
            value: "",
            squash: true
          },
        }
      });

      // insurance
      $stateProvider.state({
        name: 'insurance',
        url: '/insurance',
        templateUrl: 'app/modules/static/insurance.template.html',
        controller: 'StaticController',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["insurance.meta-title", "insurance.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["insurance.meta-title"]);
                ngMeta.setTag("description", translations["insurance.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // multi-booking
      $stateProvider.state({
        name: 'multiBooking',
        url: '/multi-booking?location',
        template: '<multi-booking></multi-booking>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["multi-booking.meta-title", "multi-booking.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["multi-booking.meta-title"]);
                ngMeta.setTag("description", translations["multi-booking.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        },
        params: {
          location: {
            value: "",
            squash: true
          },
        }
      });

      $stateProvider.state({
        name: 'longTerm',
        url: '/long-term?location',
        template: '<multi-booking></multi-booking>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["long-term.meta-title", "long-term.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["long-term.meta-title"]);
                  ngMeta.setTag("description", translations["long-term.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        },
        params: {
          location: {
            value: "",
            squash: true
          },
          type: {
            value: "long-term",
            squash: true
          }
        }
      });

      // faq
      $stateProvider.state({
        name: 'faq',
        url: '/faq?group',
        template: '<faq></faq>',
        reloadOnSearch: false,
        params: {
          position: {
            value: "",
            squash: true
          }
        },
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["faq.meta-title", "faq.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["faq.meta-title"]);
                ngMeta.setTag("description", translations["faq.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      // booking calendar
      $stateProvider.state({
        name: 'bookingCalendar',
        url: '/booking-calendar?goToDate',
        template: '<booking-calendar></booking-calendar>',
        reloadOnSearch: false,
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["booking-calendar.meta-title", "booking-calendar.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["booking-calendar.meta-title"]);
                ngMeta.setTag("description", translations["booking-calendar.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      /* ------------------------------------ */
      /* EVENT_PAGES */
      /* ------------------------------------ */

      $stateProvider.state({
        name: 'event',
        url: '/events/{event_name}',
        template: '<event></event>',
        resolve: {
          data: function ($translate, ngMeta, $stateParams) {
            $translate(["events." + $stateParams.event_name + ".meta-title", "events." + $stateParams.event_name + ".meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["events." + $stateParams.event_name + ".meta-title"]);
                  ngMeta.setTag("description", translations["events." + $stateParams.event_name + ".meta-description"]);
                  ngMeta.setTag("noindex", false);
                });
          }
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'capeArgus',
        url: '/events/capeargus',
        template: '<cape-argus></cape-argus>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.cape-argus.meta-title", "meta.events.cape-argus.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.cape-argus.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.cape-argus.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('capeArgusOld', {
        url: '/capeargus',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('capeArgus');
          }
        ],
      });

      $stateProvider.state({
        name: 'supercrossMunich',
        url: '/events/supercross-munich',
        template: '<supercross-munich></supercross-munich>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.supercross-munich.meta-title", "meta.events.supercross-munich.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.supercross-munich.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.supercross-munich.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('supercrossMunichOld', {
        url: '/supercross-munich',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('supercrossMunich');
          }
        ],
      });

      $stateProvider.state({
        name: 'raphaSuperCross',
        url: '/events/rapha-super-cross',
        template: '<rapha-super-cross></rapha-super-cross>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.common.meta-title", "meta.events.common.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.common.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.common.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('raphaSuperCrossOld', {
        url: '/rapha-super-cross',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('raphaSuperCross');
          }
        ],
      });

      $stateProvider.state({
        name: 'inVeloVeritas',
        url: '/events/in-velo-veritas',
        template: '<in-velo-veritas></in-velo-veritas>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.in-velo-veritas.meta-title", "meta.events.in-velo-veritas.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.in-velo-veritas.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.in-velo-veritas.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('inVeloVeritasOld', {
        url: '/in-velo-veritas',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('inVeloVeritas');
          }
        ],
      });

      $stateProvider.state({
        name: 'crossride',
        url: '/events/berliner-fahrradschau',
        template: '<crossride></crossride>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.common.meta-title", "meta.events.common.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.common.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.common.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('crossrideOld', {
        url: '/berliner-fahrradschau',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('crossride');
          }
        ],
      });

      $stateProvider.state({
        name: 'velosoph',
        url: '/events/herbstausfahrt',
        template: '<velosoph></velosoph>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.velosoph.meta-title", "meta.events.velosoph.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.velosoph.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.velosoph.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('velosophOld', {
        url: '/herbstausfahrt',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('velosoph');
          }
        ],
      });

      $stateProvider.state({
        name: 'depart',
        url: '/events/grand-depart',
        template: '<depart></depart>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.depart.meta-title", "meta.events.depart.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.depart.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.depart.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('departOld', {
        url: '/grand-depart',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('depart');
          }
        ],
      });

      $stateProvider.state({
        name: 'eroicaGaiole',
        url: '/events/eroica-gaiole',
        template: '<eroica-gaiole></eroica-gaiole>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.eroica-gaiole.meta-title", "meta.events.eroica-gaiole.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.eroica-gaiole.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.eroica-gaiole.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('eroicaGaioleOld', {
        url: '/eroica-gaiole',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('eroicaGaiole');
          }
        ],
      });

      $stateProvider.state({
        name: 'mcbw',
        url: '/events/mcbw',
        template: '<mcbw></mcbw>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.common.meta-title", "meta.events.common.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.common.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.common.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('mcbwOld', {
        url: '/mcbw',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('mcbw');
          }
        ],
      });

      $stateProvider.state({
        name: 'constanceSpin',
        url: '/events/constance-spin',
        template: '<constance-spin></constance-spin>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.constance-spin.meta-title", "meta.events.constance-spin.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.constance-spin.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.constance-spin.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('constanceSpinOld', {
        url: '/constance-spin',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('constanceSpin');
          }
        ],
      });

      $stateProvider.state({
        name: 'coffeespin',
        url: '/events/velothon-coffeespin',
        template: '<coffeespin></coffeespin>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.common.meta-title", "meta.events.common.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.common.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.common.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('coffeespinOld', {
        url: '/velothon-coffeespin',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('coffeespin');
          }
        ],
      });

      $stateProvider.state({
        name: 'pushnpost',
        url: '/events/pushnpost',
        template: '<pushnpost></pushnpost>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.common.meta-title", "meta.events.common.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.common.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.common.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('pushnpostOld', {
        url: '/pushnpost',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('pushnpost');
          }
        ],
      });

      $stateProvider.state({
        name: 'kuchenundraketen',
        url: '/events/kuchenundraketen',
        template: '<kuchenundraketen></kuchenundraketen>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.events.common.meta-title", "meta.events.common.meta-description"])
                .then(function (translations) {
                  ngMeta.setTitle(translations["meta.events.common.meta-title"]);
                  ngMeta.setTag("description", translations["meta.events.common.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      }).state('kuchenundraketenOld', {
        url: '/kuchenundraketen',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('kuchenundraketen');
          }
        ],
      });

      /* ------------------------------------ */
      /* BRANDS_PAGES */
      /* ------------------------------------ */

      $stateProvider.state({
        name: 'ampler',
        url: '/brands/ampler',
        template: '<ampler></ampler>',
        resolve: {
            data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
                $translate(["meta.brand-integration.ampler.meta-title", "meta.brand-integration.ampler.meta-descr"])
                    .then(function (translations) {
                        ngMeta.setTitle(translations["meta.brand-integration.ampler.meta-title"]);
                        ngMeta.setTag("description", translations["meta.brand-integration.ampler.meta-descr"]);
                        ngMeta.setTag("noindex", false);
                    })
            }]
        },
        meta: {
            disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'vanmoof',
        url: '/brands/vanmoof',
        template: '<vanmoof></vanmoof>',
        resolve: {
            data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
                $translate(["meta.brand-integration.vanmoof.meta-title", "meta.brand-integration.vanmoof.meta-descr"])
                    .then(function (translations) {
                        ngMeta.setTitle(translations["meta.brand-integration.vanmoof.meta-title"]);
                        ngMeta.setTag("description", translations["meta.brand-integration.vanmoof.meta-descr"]);
                        ngMeta.setTag("og:image", "app/assets/ui_images/opengraph/vanmoof.jpg");
                        ngMeta.setTag("noindex", false);
                    })
            }]
        },
        meta: {
            disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'moeve',
        url: '/brands/moeve',
        template: '<moeve></moeve>',
        resolve: {
            data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
                $translate(["meta.brand-integration.moeve.meta-title", "meta.brand-integration.moeve.meta-descr"])
                    .then(function (translations) {
                        ngMeta.setTitle(translations["meta.brand-integration.moeve.meta-title"]);
                        ngMeta.setTag("description", translations["meta.brand-integration.moeve.meta-descr"]);
                        ngMeta.setTag("og:image", "app/assets/ui_images/opengraph/moeve.jpg");
                        ngMeta.setTag("noindex", false);
                    })
            }]
        },
        meta: {
            disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'rethink',
        url: '/brands/rethink',
        template: '<rethink></rethink>',
        resolve: {
            data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
                $translate(["meta.brand-integration.rethink.meta-title", "meta.brand-integration.rethink.meta-descr"])
                    .then(function (translations) {
                        ngMeta.setTitle(translations["meta.brand-integration.rethink.meta-title"]);
                        ngMeta.setTag("description", translations["meta.brand-integration.rethink.meta-descr"]);
                        ngMeta.setTag("og:image", "app/assets/ui_images/opengraph/lnr_rethink.jpg");
                        ngMeta.setTag("noindex", false);
                    })
            }]
        },
        meta: {
            disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'votec',
        url: '/brands/votec',
        template: '<votec></votec>',
        resolve: {
            data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
                $translate(["meta.brand-integration.votec.meta-title", "meta.brand-integration.votec.meta-descr"])
                    .then(function (translations) {
                        ngMeta.setTitle(translations["meta.brand-integration.votec.meta-title"]);
                        ngMeta.setTag("description", translations["meta.brand-integration.votec.meta-descr"]);
                        ngMeta.setTag("noindex", false);
                    })
            }]
        },
        meta: {
            disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'vello',
        url: '/brands/vello',
        template: '<vello></vello>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.brand-integration.vello.meta-title", "meta.brand-integration.vello.meta-description"])
              .then(function (translations) {
                  ngMeta.setTitle(translations["meta.brand-integration.vello.meta-title"]);
                  ngMeta.setTag("description", translations["meta.brand-integration.vello.meta-description"]);
                  ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'veletage',
        url: '/veletage',
        template: '<veletage></veletage>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.brand-integration.veletage.meta-title", "meta.brand-integration.veletage.meta-descr"])
              .then(function (translations) {
                  ngMeta.setTitle(translations["meta.brand-integration.veletage.meta-title"]);
                  ngMeta.setTag("description", translations["meta.brand-integration.veletage.meta-descr"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'bonvelo',
        url: '/brands/bonvelo',
        template: '<bonvelo></bonvelo>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.brand-integration.bonvelo.meta-title", "meta.brand-integration.bonvelo.meta-description"])
              .then(function (translations) {
                  ngMeta.setTitle(translations["meta.brand-integration.bonvelo.meta-title"]);
                  ngMeta.setTag("description", translations["meta.brand-integration.bonvelo.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'swytch',
        url: '/brands/swytch',
        template: '<swytch></swytch>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.brand-integration.swytch.meta-title", "meta.brand-integration.swytch.meta-description"])
              .then(function (translations) {
                  ngMeta.setTitle(translations["meta.brand-integration.swytch.meta-title"]);
                  ngMeta.setTag("description", translations["meta.brand-integration.swytch.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'whyte',
        url: '/brands/whyte',
        template: '<whyte></whyte>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.brand-integration.whyte.meta-title", "meta.brand-integration.whyte.meta-description"])
              .then(function (translations) {
                  ngMeta.setTitle(translations["meta.brand-integration.whyte.meta-title"]);
                  ngMeta.setTag("description", translations["meta.brand-integration.whyte.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'motoparilla',
        url: '/brands/motoparilla',
        template: '<motoparilla></motoparilla>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.brand-integration.motoparilla.meta-title", "meta.brand-integration.motoparilla.meta-description"])
              .then(function (translations) {
                  ngMeta.setTitle(translations["meta.brand-integration.motoparilla.meta-title"]);
                  ngMeta.setTag("description", translations["meta.brand-integration.motoparilla.meta-description"]);
                  ngMeta.setTag("noindex", false);
                })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'brompton',
        url: '/brands/brompton',
        template: '<brompton></brompton>',
        resolve: {
            data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
                $translate(["meta.brand-integration.brompton.meta-title", "meta.brand-integration.brompton.meta-descr"])
                    .then(function (translations) {
                        ngMeta.setTitle(translations["meta.brand-integration.brompton.meta-title"]);
                        ngMeta.setTag("description", translations["meta.brand-integration.brompton.meta-descr"]);
                        ngMeta.setTag("noindex", false);
                    })
            }]
        },
        meta: {
            disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'muli',
        url: '/brands/muli',
        template: '<muli></muli>',
        resolve: {
            data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
                $translate(["meta.brand-integration.muli.meta-title", "meta.brand-integration.muli.meta-descr"])
                    .then(function (translations) {
                        ngMeta.setTitle(translations["meta.brand-integration.muli.meta-title"]);
                        ngMeta.setTag("description", translations["meta.brand-integration.muli.meta-descr"]);
                        ngMeta.setTag("noindex", false);
                    })
            }]
        },
        meta: {
            disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'cocomat',
        url: '/brands/cocomat',
        template: '<cocomat></cocomat>',
        resolve: {
            data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
                $translate(["meta.brand-integration.cocomat.meta-title", "meta.brand-integration.cocomat.meta-descr"])
                    .then(function (translations) {
                        ngMeta.setTitle(translations["meta.brand-integration.cocomat.meta-title"]);
                        ngMeta.setTag("description", translations["meta.brand-integration.cocomat.meta-descr"]);
                        ngMeta.setTag("noindex", false);
                    })
            }]
        },
        meta: {
            disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'leaos',
        url: '/brands/leaos',
        template: '<leaos></leaos>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.brand-integration.leaos.meta-title", "meta.brand-integration.leaos.meta-descr"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.brand-integration.leaos.meta-title"]);
                ngMeta.setTag("description", translations["meta.brand-integration.leaos.meta-descr"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'veloheld',
        url: '/brands/veloheld',
        template: '<veloheld></veloheld>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.brand-integration.veloheld.meta-title", "meta.brand-integration.veloheld.meta-descr"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.brand-integration.veloheld.meta-title"]);
                ngMeta.setTag("description", translations["meta.brand-integration.veloheld.meta-descr"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'factoryberlin',
        url: '/factoryberlin',
        template: '<user></user>',
        resolve: {
          data: ['ngMeta', function (ngMeta) {
            ngMeta.setTag("noindex", false);
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'felt',
        url: '/brands/felt',
        template: '<felt></felt>',
        resolve: {
          data:['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.brand-integration.felt.meta-title", "meta.brand-integration.felt.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.brand-integration.felt.meta-title"]);
                ngMeta.setTag("description", translations["meta.brand-integration.felt.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'unimoke',
        url: '/brands/unimoke',
        template: '<unimoke></unimoke>',
        resolve: {
          data: ['$translate', 'ngMeta', function ($translate, ngMeta) {
            $translate(["meta.brand-integration.unimoke.meta-title", "meta.brand-integration.unimoke.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.brand-integration.unimoke.meta-title"]);
                ngMeta.setTag("description", translations["meta.brand-integration.unimoke.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }]
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'bzen',
        url: '/brands/bzenbikes',
        template: '<bzen></bzen>',
        resolve: {
          data: function ($translate, ngMeta) {
            $translate(["meta.brand-integration.bzen.meta-title", "meta.brand-integration.bzen.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.brand-integration.bzen.meta-title"]);
                ngMeta.setTag("description", translations["meta.brand-integration.bzen.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'urwahn',
        url: '/brands/urwahnbikes',
        template: '<urwahn></urwahn>',
        resolve: {
          data: function ($translate, ngMeta) {
            $translate(["meta.brand-integration.urwahn.meta-title", "meta.brand-integration.urwahn.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.brand-integration.urwahn.meta-title"]);
                ngMeta.setTag("description", translations["meta.brand-integration.urwahn.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'cowboybikes',
        url: '/brands/cowboybikes',
        template: '<cowboybikes></cowboybikes>',
        resolve: {
          data: function ($translate, ngMeta) {
            $translate(["meta.brand-integration.cowboybikes.meta-title", "meta.brand-integration.cowboybikes.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.brand-integration.cowboybikes.meta-title"]);
                ngMeta.setTag("description", translations["meta.brand-integration.cowboybikes.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'argon18',
        url: '/brands/argon18',
        template: '<argon18></argon18>',
        resolve: {
          data: function ($translate, ngMeta) {
            $translate(["meta.brand-integration.argon18.meta-title", "meta.brand-integration.argon18.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.brand-integration.argon18.meta-title"]);
                ngMeta.setTag("description", translations["meta.brand-integration.argon18.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'rossignol',
        url: '/brands/rossignol',
        template: '<rossignol></rossignol>',
        resolve: {
          data: function ($translate, ngMeta) {
            $translate(["meta.brand-integration.rossignol.meta-title", "meta.brand-integration.rossignol.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.brand-integration.rossignol.meta-title"]);
                ngMeta.setTag("description", translations["meta.brand-integration.rossignol.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'yuba',
        url: '/brands/yuba',
        template: '<yuba></yuba>',
        resolve: {
          data: function ($translate, ngMeta) {
            $translate(["meta.brand-integration.yuba.meta-title", "meta.brand-integration.yuba.meta-description"])
              .then(function (translations) {
                ngMeta.setTitle(translations["meta.brand-integration.yuba.meta-title"]);
                ngMeta.setTag("description", translations["meta.brand-integration.yuba.meta-description"]);
                ngMeta.setTag("noindex", false);
              })
          }
        },
        meta: {
          disableUpdate: true
        }
      });

      $stateProvider.state({
        name: 'matebikes',
        url: '/brands/matebikes',
        template: '<matebikes></matebikes>',
        resolve: {
          data: function ($translate, ngMeta) {
            $translate(["meta.brand-integration.matebikes.meta-title", "meta.brand-integration.matebikes.meta-description"])
            .then(function (translations) {
              ngMeta.setTitle(translations["meta.brand-integration.matebikes.meta-title"]);
              ngMeta.setTag("description", translations["meta.brand-integration.matebikes.meta-description"]);
              ngMeta.setTag("noindex", false);
            })
          }
        },
        meta: {
          disableUpdate: true
        }
      });

      /* ------------------------------------ */
      /* CITY_PAGES */
      /* ------------------------------------ */

      var redirectHook = ['$transition$', '$state$', function ($transition$, $state$) {
        var SPACE_URL_ENCODED = encodeURIComponent(' ');

        var rawUrlPath = $urlServiceProvider.url();
        var redirectedFrom = $transition$.redirectedFrom();

        var isSecondRedirectToSameState = redirectedFrom !== null && redirectedFrom.to().name === $state$.name;

        if (rawUrlPath.indexOf(SPACE_URL_ENCODED) >= 0 && !isSecondRedirectToSameState) {
          var params = $transition$.targetState().params();
          return $transition$.router.stateService.target($state$.name, params);
        }
      }];

      $stateProvider.state({
        name: 'categoryLanding',
        url: '/{city:underscoreEncodedSpaces}/{category}',
        template: '<category-landing></category-landing>',
        onEnter: redirectHook,
        meta: {
          disableUpdate: false,
          'og:image': 'https://www.listnride.com/app/assets/ui_images/opengraph/landing.jpg',
          'noindex': false
        }
      });

      $stateProvider.state({
        name: 'cityLanding',
        url: '/{city:underscoreEncodedSpaces}',
        template: '<city-landing></city-landing>',
        onEnter: redirectHook,
        meta: {
          disableUpdate: false,
          'og:image': 'https://www.listnride.com/app/assets/ui_images/opengraph/landing.jpg',
          'noindex': false
        }
      });

      $stateProvider.state({
        name: 'countryPage',
        url: '/countries/{country:underscoreEncodedSpaces}',
        template: '<country-landing></country-landing>',
        onEnter: redirectHook,
        meta: {
          disableUpdate: false,
          'og:image': 'https://www.listnride.com/app/assets/ui_images/opengraph/landing.jpg',
          'noindex': false
        }
      });

      $stateProvider.state({
        name: 'countries',
        url: '/countries',
        template: '<country-landing></country-landing>',
        reloadOnSearch: false,
      });

      /* ------------------------------------ */
      /* 404_PAGE */
      /* ------------------------------------ */

      // 404 page
      $stateProvider.state('404', {
        templateUrl: 'app/modules/static/error-404.template.html',
        data: {
          meta: {
            'title': 'listnride - 404',
            'prerender-status-code': '404'
          }
        }
      });

      $urlRouterProvider.otherwise(function ($injector) {
        var state = $injector.get('$state');
        state.go('404');
      });

      // REDIRECTS

      $stateProvider.state({
        name: 'berlinTriathlon',
        url: '/berlin-triathlon',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'berlin-triathlon'
            })
          }
        ]
      });

      $stateProvider.state({
        name: 'cyclassicsHamburg',
        url: '/cyclassics-hamburg',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'cyclassics-hamburg'
            })
          }
        ]
      });

      $stateProvider.state({
        name: 'hamburgTriathlon',
        url: '/triathlon-hamburg',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'triathlon-hamburg'
            })
          }
        ]
      });

      $stateProvider.state({
        name: 'torosDeGravel',
        url: '/toros-de-gravel',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'toros-de-gravel'
            })
          }
        ]
      });

      $stateProvider.state({
        name: 'riderman',
        url: '/riderman-rothaus',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'riderman-rothaus'
            })
          }
        ]
      });

      $stateProvider.state({
        name: 'velothonBikerental',
        url: '/events/velothon-bikerental',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'velocity-bikerental'
            })
          }
        ]
      });

      $stateProvider.state({
        name: 'vatternrundan',
        url: '/vatternrundan',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'vatternrundan'
            })
          }
        ]
      });

      $stateProvider.state({
        name: 'epicgrancanaria',
        url: '/epicgrancanaria',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'epicgrancanaria'
            })
          }
        ]
      });

      $stateProvider.state({
        name: 'veloraceDresden',
        url: '/velorace-dresden',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'velorace-dresden'
            })
          }
        ]
      });

      $stateProvider.state({
        name: 'larditaArezzo',
        url: '/lardita-arezzo',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'lardita-arezzo'
            })
          }
        ]
      });

      $stateProvider.state({
        name: 'granfondo',
        url: '/granfondo-via-del-sale',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'granfondo-via-del-sale'
            })
          }
        ]
      });

      $stateProvider.state({
        name: '/laChouffe',
        url: '/la-chouffe',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': '/la-chouffe'
            })
          }
        ]
      });

      $stateProvider.state({
        name: '/gentWevelgem',
        url: '/gent-wevelgem',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': '/gent-wevelgem'
            })
          }
        ]
      });

      $stateProvider.state({
        name: 'giroSardegna',
        url: '/giro-sardegna',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'giro-sardegna'
            })
          }
        ]
      });

      $stateProvider.state({
        name: 'cyclingworld',
        url: '/cyclingworld',
        controller: ['$scope', '$state',
          function ($scope, $state) {
            $state.go('event', {
              'event_name': 'cyclingworld'
            })
          }
        ]
      });
    }
  ]);
})();
