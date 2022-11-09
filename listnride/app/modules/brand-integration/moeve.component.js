'use strict';

angular.module('moeveIntegration',[]).component('moeve', {
  templateUrl: 'app/modules/brand-integration/moeve.template.html',
  controllerAs: 'moeve',
  controller: [ '$translate', '$translatePartialLoader', 'api', 'ENV',
    function MoeveController($translate, $tpl, api, ENV) {
      var moeve = this;
      $tpl.addPart(ENV.staticTranslation);

      moeve.currentBikes = [];
      $translate(["shared.munich"]).then(
        function (translations) {
          moeve.currentCity = translations["shared.munich"];
        }
      );
      moeve.bikes = {
        munich: [],
        amsterdam: [],
        frankfurt: [],
        stuttgart: [],
        vienna: []
      };
      moeve.slickConfig = {
        enabled: true,
        autoplay: true,
        draggable: true,
        autoplaySpeed: 12000,
        ease: 'ease-in-out',
        speed: '500',
        prevArrow: "<img class='testimonials-prev-arrow slick-prev' src='app/assets/ui_images/back.png'>",
        nextArrow: "<img class='testimonials-prev-arrow slick-next' src='app/assets/ui_images/next.png'>"
      };

      $translate('shared.from-place').then(function(translation) {
        moeve.testimonials = [
          {
            userId: 1938,
            userName: "Robert " + translation + " Dresden",
            userImagePath: "app/assets/ui_images/brand-integration/ampler_testimonial_1.jpg",
            text: "Geiles, schnelles Bike. Ging ab wie Schmidts Katze. Übergabe verlief völlig unkompliziert und sehr nett."
          },
          {
            userId: 1739,
            userName: "Cornelia " + translation + " Binningen",
            userImagePath: "app/assets/ui_images/brand-integration/ampler_testimonial_2.jpg",
            text: "Sehr unkomplizierte und angenehme Art. Es hat alles bestens geklappt. Das Ampler fährt sich sehr gut, freuen uns auf das nächste Mal."
          },
          {
            userId: 1775,
            userName: "Marek " + translation + " Berlin",
            userImagePath: "app/assets/ui_images/brand-integration/ampler_testimonial_3.jpg",
            text: "ein sehr geiles Bike und eine krasse Erfahrung, das erste Mal ein Ebike zu fahren. könnte mir sogar vorstellen sowas zu kaufen :)"
          },
          {
            userId: 1727,
            userName: "Thomas " + translation + " Münster",
            userImagePath: "app/assets/ui_images/brand-integration/ampler_testimonial_4.jpg",
            text: "Hat alles gepasst! ein sehr schönes Rad und ein Vergnügen zum Fahren. Kann es jeder sehr empfehlen mal zu Probefahren, macht wirklich Spaß ;)"
          }
        ];
      });

      api.get('/rides?family=25').then(
        function (success) {

          for (var i=0; i<success.data.bikes.length; i++) {
            switch (success.data.bikes[i].city) {
              case "Munich": moeve.bikes.munich.push(success.data.bikes[i]); break;
              case "Amsterdam": moeve.bikes.amsterdam.push(success.data.bikes[i]); break;
              case "Stuttgart": moeve.bikes.stuttgart.push(success.data.bikes[i]); break;
              case "Frankfurt am Main": moeve.bikes.frankfurt.push(success.data.bikes[i]); break;
              case "Wien": moeve.bikes.vienna.push(success.data.bikes[i]); break;
            }
          }
          moeve.currentBikes = moeve.bikes["munich"];
        },
        function (error) {
        }
      );

      moeve.showBikesIn = function(city) {
        moeve.currentCity = $translate.instant("shared." + city);
        moeve.currentBikes = moeve.bikes[city];
      }

    }
  ]
});
