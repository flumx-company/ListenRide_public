'use strict';

angular.module('listings').component('listView', {
  templateUrl: 'app/modules/listings/views/list-view.template.html',
  controllerAs: 'listView',
  bindings: {
    bikes: '<',
    status: '=',
    isDuplicating: '=',
    edit: '<',
    view: '<',
    duplicate: '<',
    delete: '<',
    changeBikeAvailableTo: '<',
    changeAvailability: '<',
    showLabels: '<',
    isCheckModeOn: '<',
    onBikeTileCheck: '<',
    isChecked: '<',
    isSelectable: '<',
    unmerge: '<'
  },
  controller: ['orderByFilter', function (orderBy) {
      var listView = this;

      listView.$onInit = function () {
        listView.reverse = true;
      };

      // order the bikes with the selected criteria (price, size, name, id ....)
      // specific to list view
      // functionality not available in tile view
      listView.order = function (propertyName) {
        listView.reverse = (propertyName !== null && listView.propertyName === propertyName) ? !listView.reverse : false;
        listView.propertyName = propertyName;
        listView.bikes = orderBy(listView.bikes, listView.propertyName, listView.reverse);
      };

    }]
});