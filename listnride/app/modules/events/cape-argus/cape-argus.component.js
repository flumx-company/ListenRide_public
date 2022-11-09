'use strict';

angular.module('capeArgus',[]).component('capeArgus', {
    templateUrl: 'app/modules/events/cape-argus/cape-argus.template.html',
    controllerAs: 'capeArgus',
    controller: ['NgMap', 'api', '$translate', '$translatePartialLoader', 'ngMeta', 'ENV',
        function CapeArgusController(NgMap, api, $translate, $tpl, ngMeta, ENV) {
            var capeArgus = this;
            $tpl.addPart(ENV.staticTranslation);
            capeArgus.submitting = false;
            capeArgus.email = "";
            capeArgus.submitted = false;

            $translate(["events.cape-argus.meta-title", "events.cape-argus.meta-description"]).then(
              function (translations) {
                ngMeta.setTitle(translations["events.cape-argus.meta-title"]);
                ngMeta.setTag("description", translations["events.cape-argus.meta-description"]);
              }
            );

            capeArgus.sizeOptions = [
                {value: "", label: "-"},
                {value: 155, label: "155 - 165 cm"},
                {value: 165, label: "165 - 175 cm"},
                {value: 175, label: "175 - 185 cm"},
                {value: 185, label: "185 - 195 cm"},
                {value: 195, label: "195 - 205 cm"}
            ];

            capeArgus.isAvailable = function (bike) {
            };

            $translate('search.all-sizes').then(function (translation) {
                capeArgus.sizeOptions[0].label = translation;
            });

            api.get('/rides?category=20&location=Capetown&priority=capeArgus&booked_at=2018-03-11').then(
                function(response) {
                    capeArgus.bikes = response.data;
                },
                function(error) {
                }
            );

            capeArgus.submit = function() {
                var data = {
                    "preregistration": {
                        first_name: "Cape",
                        last_name: "Argus",
                        email: capeArgus.email,
                    }
                };
                capeArgus.submitting = true
                api.post('/preregistrations', data).then(
                    function (success) {
                        capeArgus.submitted = true;
                    },
                    function (error) {
                    }
                );
            }

        }
    ]
});
