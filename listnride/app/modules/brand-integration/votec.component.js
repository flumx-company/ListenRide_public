'use strict';

angular.module('votec-integration',[]).component('votec', {
  templateUrl: 'app/modules/brand-integration/votec.template.html',
  controllerAs: 'votec',
  controller: [ '$translate', '$translatePartialLoader', 'api', 'ENV', 
    function VotecController($translate, $tpl, api, ENV) {
      var votec = this;
      $tpl.addPart(ENV.staticTranslation);

      votec.currentBikes = [];
      $translate(["shared.munich"]).then(
        function (translations) {
          votec.currentCity = translations["shared.munich"];
        }
      );
      votec.bikes = {
        berlin: [],
        munich: [],
        heidelberg: [],
        freiburg: []
      };
      votec.slickConfig = {
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
        votec.testimonials = [
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

      api.get('/rides?family=26').then(
        function (success) {
          for (var i=0; i<success.data.bikes.length; i++) {
            switch (success.data.bikes[i].city) {
              case "Berlin": votec.bikes.berlin.push(success.data.bikes[i]); break;
              case "Freiburg im Breisgau": votec.bikes.freiburg.push(success.data.bikes[i]); break;
              case "Heidelberg": votec.bikes.heidelberg.push(success.data.bikes[i]); break;
              case "München": votec.bikes.munich.push(success.data.bikes[i]); break;
            }
          }
          votec.currentBikes = votec.bikes["munich"];
        },
        function (error) {
          console.log('Error fetching Bikes');
        }
      );

      votec.showBikesIn = function(city) {
        votec.currentCity = $translate.instant("shared." + city);
        votec.currentBikes = votec.bikes[city];
      }

    }
  ]
});
