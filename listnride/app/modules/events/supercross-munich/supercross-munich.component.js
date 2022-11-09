'use strict';

angular.module('supercrossMunich',[]).component('supercrossMunich', {
    templateUrl: 'app/modules/events/supercross-munich/supercross-munich.template.html',
    controllerAs: 'supercrossMunich',
    controller: ['NgMap', 'api', '$translate', 'ngMeta', '$translatePartialLoader', 'ENV',
        function SupercrossMunichController(NgMap, api, $translate, ngMeta, $tpl, ENV) {
            var supercrossMunich = this;
            $tpl.addPart(ENV.staticTranslation);
            ngMeta.setTitle($translate.instant("events.supercross-munich.meta-title"));
            ngMeta.setTag("description", $translate.instant("events.supercross-munich.meta-description"));

            supercrossMunich.sizeOptions = [
                {value: "", label: "-"},
                {value: 155, label: "155 - 165 cm"},
                {value: 165, label: "165 - 175 cm"},
                {value: 175, label: "175 - 185 cm"},
                {value: 185, label: "185 - 195 cm"},
                {value: 195, label: "195 - 205 cm"}
            ];

            supercrossMunich.isAvailable = function (bike) {
            };

            $translate('search.all-sizes').then(function (translation) {
                supercrossMunich.sizeOptions[0].label = translation;
            });

            api.get('/rides?category=35&location=Munich&booked_at=2017-10-14').then(
                function(response) {
                    supercrossMunich.bikes = response.data.reverse();
                },
                function(error) {
                    console.log("Error retrieving User", error);
                }
            );

        }
    ]
});
