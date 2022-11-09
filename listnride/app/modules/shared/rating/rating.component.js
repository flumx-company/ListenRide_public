'use strict';

angular.module('rating',[]).component('rating', {
  templateUrl: 'app/modules/shared/rating/rating.template.html',
  controllerAs: 'rating',
  bindings: {
    data: '<',
    index: '<',
    showAll: '<'
  },
  controller: [ 'api',
    function RatingController() {
      var rating = this;
    }
  ]
});