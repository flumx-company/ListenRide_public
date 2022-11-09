'use strict';

angular.module('statusLabels', []).component('statusLabels', {
  templateUrl: 'app/modules/shared/status-labels/status-labels.template.html',
  controllerAs: 'statusLabels',
  bindings: {
    bike: '<',
    minifiedView: '<'
  },
  controller: [function StatusLabelsController() {
      var statusLabels = this;

      // Conditional array elements
      // link: https://stackoverflow.com/questions/44908159/how-to-define-an-array-with-conditional-elements
      statusLabels.labels = [
        statusLabels.bike.is_cluster && 'variants_available'
      ].filter(Boolean);
    }
  ]
});