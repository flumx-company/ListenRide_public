'use strict';

angular.module('event', []).component('event', {
  templateUrl: 'app/modules/events/event.template.html',
  controllerAs: 'event',
  controller: ['api', '$state', '$stateParams', '$translate', 'ngMeta', '$translatePartialLoader', 'bikeOptions', 'notification',
    function EventController(api, $state, $stateParams, $translate, ngMeta, $tpl, bikeOptions, notification) {
      var event = this;
      $tpl.addPart('static');
      event.name = $stateParams.event_name;
      ngMeta.setTitle($translate.instant("events." + event.name + ".meta-title"));
      ngMeta.setTag("description", $translate.instant("events." + event.name + ".meta-description"));
      ngMeta.setTag("og:image", "app/assets/ui_images/events/" + event.name + "_og.jpg");

      event.$onInit = function() {
        event.object = {
          'berlin-triathlon': getRequestUrl('30', 'Berlin', '', '2019-06-02', '932,379,15970,17446,7626,195,11021,11020,1038,17585,19,1265'),
          'cyclassics-hamburg': getRequestUrl('30', 'Hamburg', 'cyclassics-hamburg', '2018-08-19'),
          'triathlon-hamburg': getRequestUrl('30', 'Hamburg', '', '2018-07-14'),
          'toros-de-gravel': getRequestUrl('42,43', 'Mallorca', '', '2018-10-13'),
          'riderman-rothaus': getRequestUrl('20', 'Bad Dürrheim', '', ''),
          'velocity-bikerental': getRequestUrl('30', 'Berlin', 'velothon', '2018-05-13', '17718,18007,17997,18017,18037,18027'),
          'vatternrundan': getRequestUrl('30,31', 'Motala,Sweden', '', '', '17071,18121,18134,18135,18129,18178,18196'),
          'epicgrancanaria': getRequestUrl('30,31,32,33', 'Gran Canaria, Provinz Las Palmas, Spanien', '', '2019-04-05'),
          'velorace-dresden': getRequestUrl('30', 'Dresden', '', '2019-08-11'),
          'la-chouffe': getRequestUrl('30', 'Houffalize', '', ''),
          'gent-wevelgem': getRequestUrl('30', 'Wevelgem', '', ''),
          'lardita-arezzo': '/rides?ids=8799,9238,9240,9348,9355,12301,12302,12303,12304,12305,12306,12307,12308,12324,12322,12466, 8808, 12310, 12325, 8796, 12463, 12309, 12327, 12457, 12460, 12458, 12459, 12462, 9354, 9353, 9348, 12328, 8801, 8803, 12450, 8842, 9347, 9344, 8800, 8804, 8841, 9349, 12464, 12465, 12467, 12326, 12329, 8802, 8795, 12319, 8789, 8791, 8794, 12451, 12452, 12453, 12454, 12456, 12455, 12461, 9239, 9340, 9346, 9356, 9350, 9234, 9235, 8840, 9355',
          'granfondo-via-del-sale': getRequestUrl('30', 'Cesenatico', '', '2019-05-05'),
          'giro-sardegna': getRequestUrl('30', 'Cagliari', '', '2019-04-21'),
          'cyclingworld': getRequestUrl('', '', '', '', '/rides?family=35'),
          'paris-brest-paris': getRequestUrl('30', 'Rambouillet, France', '', '2019-08-18'),
          'costadelsol': getRequestUrl('30', 'Marbella, Málaga, Spain', '', '2019-09-15'),
          '8bar-clubride': '/rides?family=36&zero=true',
          'granfondo-bikedivision': getRequestUrl('30', 'Peschiera del Garda, Verona, italy', '', '2019-09-22', '4415'),
          'radfahren-neu-entdecken-eschborn': '/rides?family=37&zero=true',
          'radfahren-neu-entdecken-kassel': '/rides?family=38&zero=true',
          'radfahren-neu-entdecken-hofheim': '/rides?family=39&zero=true',
          'msr': getRequestUrl('30', 'Neubrandenburg, Deutschland', '', ''),
          'frankfurt-city-triathlon': getRequestUrl('30', 'Frankfurt am Main', '', '2019-08-04')


          // CUSTOM DESIGN AND OLD PAGES

          // 'capeargus'              : '/rides?category=20&location=Capetown&priority=capeArgus&booked_at=2018-03-11',
          // 'supercross-munich'      : '/rides?category=35&location=Munich&booked_at=2017-10-14',
          // 'rapha-super-cross'      : '/rides?family=7',
          // 'in-velo-veritas'        : '/rides?family=4',
          // 'berliner-fahrradschau'  : '/rides?family=29', -> crossride
          // 'herbstausfahrt'         : '/rides?family=22', -> velosoph
          // 'grand-depart'           : '/rides?family=18',
          // 'eroica-gaiole'          : '/users/6352',
          // 'mcbw'                   : '/users/1886',
          // 'constance-spin'         : '/bikes/1998',
          // 'velothon-coffeespin'    : '/users/1998', -> coffeespin
          // 'pushnpost'              : '/users/1998',
          // 'kuchenundraketen'       : '/users/1998'
        };
        if (!event.object[event.name]) $state.go('404');

        // VARIABLES
        event.sizes = [];
        event.bikes = [];
        event.eventWithLogo = [
          'vatternrundan',
          'gent-wevelgem',
          'la-chouffe'
        ];
        event.hasLogo = false;
        event.path = event.object[event.name];
        event.imagePath = 'app/assets/ui_images/events/' + event.name + '_hero.jpg';
        bikeOptions.sizeOptions(bikeOptions.kidsSizesValues()).then(function (resolve) {
          event.sizes = resolve;
        });

        if (event.eventWithLogo.indexOf(event.name) >= 0) {
          event.hasLogo = true;
          event.logoPath = 'app/assets/ui_images/events/' + event.name + '_logo.png';
        }

        // METHODS
        event.getEvents = getEvents;

        // INVOCATIONS
        event.getEvents();
      };

      function getRequestUrl(categoryIds, location, priority, date, excludeFrom){
        var queryParams = {
          'category' : categoryIds,
          'location' : location,
          'priority' : priority,
          'booked_at': date,
          'exclude_from': excludeFrom // You can pass several ids, separated by the comma: 1, 2, 3.
        };
        var queryArray = [];
        _.forEach(queryParams, function(value, key) {
          if(value) queryArray.push(key + '=' + encodeURIComponent(value));
        });
        return '/rides?' + queryArray.join('&');
      }

      function getEvents() {
        api.get(event.path).then(
          function (response) {
            event.bikes = response.data.bikes;
          },
          function (error) {
            notification.show(error);
          }
        );
      }
    }
  ]
});
