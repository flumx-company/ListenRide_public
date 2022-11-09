'use strict';

angular.module('invest',[]).component('invest', {
  templateUrl: 'app/modules/invest/invest.template.html',
  controllerAs: 'invest',
  controller: ['$translatePartialLoader', '$translate', 'api', 'ENV',
    function InvestController($tpl, $translate, api, ENV) {
      
      var invest = this;
      $tpl.addPart(ENV.staticTranslation);
      invest.submitted = false;
      invest.submitting = false;
      invest.values = [
        "10 - 250€",
        "250 - 500€",
        "500 - 1.000€",
        "1.000 - 5.000€",
        "10.000 - 20.000€",
        "20.000 - 50.000€"
      ];
      invest.user = {
        first_name: "",
        last_name: "",
        email: "",
        investment: invest.values[0]
      };

      invest.submit = function() {
        var data = {};
        invest.submitting = true
        data.preregistration = invest.user;
        api.post('/preregistrations', data).then(
          function (success) {
            invest.submitted = true;
          },
          function (error) {

          }
        );
      }

    }
  ]
});
