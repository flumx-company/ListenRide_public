'use strict';

angular.module('blackFridayHeader', []).component('blackFridayHeader', {
  templateUrl: 'app/modules/header/temp/black-friday-header.template.html',
  controllerAs: 'blackFridayHeader',
  controller: [function BlackFridayHeader() {
      var blackFridayHeader = this;

      var SpecialToDate = '23-11-2018'; // DD/MM/YYYY

      var SpecialTo = moment(SpecialToDate, "DD/MM/YYYY");
      blackFridayHeader.isToday = moment() > SpecialTo;

    }
  ]
});