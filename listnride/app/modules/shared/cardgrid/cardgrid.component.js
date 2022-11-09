'use strict';
angular.module('cardgrid', []).component('cardgrid', {
  templateUrl: 'app/modules/shared/cardgrid/cardgrid.template.html',
  controllerAs: 'cardgrid',
  bindings: {
    // used in bikes grid
    title: '@',
    bikes: '<',
    onBikeHover: '<',
    addMoreItemsLimit: '<',
    limit: '<',

    // passed to bike sorter component
    cardIndex: '<',
    uncategorizedBikes: '<',
    location: '<',
    categorizedBikes: '=',
    titles: '=',
    urlParams: '<'
  },
  controller: [
      '$translate',
    function ReceiptController($translate) {
      var cardgrid = this;
    }
  ]
});
