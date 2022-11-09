'use strict';

angular.module('brompton-integration',[]).component('brompton', {
  templateUrl: 'app/modules/brand-integration/brompton.template.html',
  controllerAs: 'brompton',
  controller: [ '$translate', '$translatePartialLoader', 'api', 'ngMeta', 'ENV', 'mapConfigs',
    function BromptonController($translate, $tpl, api, ngMeta, ENV, mapConfigs) {
      ngMeta.setTitle($translate.instant("brand-integration.brompton.meta-title"));
      ngMeta.setTag("description", $translate.instant("brand-integration.brompton.meta-description"));

      var brompton = this;
      $tpl.addPart(ENV.staticTranslation);
      brompton.currentBikes = [];
      $translate(["shared.berlin"]).then(
        function (translations) {
          brompton.currentCity = translations["shared.berlin"];
        }
      );
      brompton.colorScheme = mapConfigs.colorScheme();
      brompton.bikes = {
        amsterdam: [],
        berlin: [],
        dortmund: [],
        dusseldorf: [],
        frankfurt: [],
        freiburg: [],
        heidelberg: [],
        hamburg: [],
        milan: [],
        marl: [],
        munich: [],
        nuremberg: [],
        paderborn: [],
        tubingen: [],
        ulm: [],
        utting: [],
        vienna: []
      };

      brompton.mapOptions = {
        lat: 51.2167,
        lng: 9.9167,
        zoom: 6,
        radius: 500
      };

      // Family ID for Brompton Brand Bikes is 13
      api.get('/rides?family=13').then(
        function (success) {
          for (var i=0; i<success.data.bikes.length; i++) {
            switch (success.data.bikes[i].city) {
              case "Amsterdam": brompton.bikes.amsterdam.push(success.data.bikes[i]); break;
              case "Berlin": brompton.bikes.berlin.push(success.data.bikes[i]); break;
              case "Dortmund": brompton.bikes.dortmund.push(success.data.bikes[i]); break;
              case "Düsseldorf": brompton.bikes.dusseldorf.push(success.data.bikes[i]); break;
              case "Frankfurt": brompton.bikes.frankfurt.push(success.data.bikes[i]); break;
              case "Freiburg": brompton.bikes.freiburg.push(success.data.bikes[i]); break;
              case "Heidelberg": brompton.bikes.heidelberg.push(success.data.bikes[i]); break;
              case "Hamburg": brompton.bikes.hamburg.push(success.data.bikes[i]); break;
              case "Marl": brompton.bikes.marl.push(success.data.bikes[i]); break;
              case "Milan": brompton.bikes.milan.push(success.data.bikes[i]); break;
              case "München": brompton.bikes.munich.push(success.data.bikes[i]); break;
              case "Nürnberg": brompton.bikes.nuremberg.push(success.data.bikes[i]); break;
              case "Paderborn": brompton.bikes.paderborn.push(success.data.bikes[i]); break;
              case "Tübingen": brompton.bikes.tubingen.push(success.data.bikes[i]); break;
              case "Ulm": brompton.bikes.ulm.push(success.data.bikes[i]); break;
              case "Utting": brompton.bikes.utting.push(success.data.bikes[i]); break;
              case "Vienna": brompton.bikes.vienna.push(success.data.bikes[i]); break;
            }
          }
          brompton.currentBikes = brompton.bikes["berlin"];
        },
        function (error) {
        }
      );

      brompton.showBikesIn = function(city) {
        brompton.currentCity = $translate.instant("shared." + city);
        brompton.currentBikes = brompton.bikes[city];
      }

    }
  ]
});
