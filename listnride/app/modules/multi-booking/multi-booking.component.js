'use strict';

angular.module('multiBooking', []).component('multiBooking', {
  templateUrl: 'app/modules/multi-booking/multi-booking.template.html',
  controllerAs: 'multiBooking',
  controller: ['$stateParams', '$translate', 'api', 'bikeOptions', 'ngMeta', 'notification',
    function multiBookingController($stateParams, $translate, api, bikeOptions, ngMeta, notification) {
      var multiBooking = this;
      multiBooking.type = $stateParams.type || 'multi-booking';

      ngMeta.setTitle($translate.instant(multiBooking.type + ".meta-title"));
      ngMeta.setTag("description", $translate.instant(multiBooking.type + ".meta-description"));
      ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/opengraph/' + multiBooking.type + '.jpg');
      ngMeta.setTag("og:description", $translate.instant(multiBooking.type + ".opengraph.description"));

      multiBooking.$onInit = function () {
        // methods
        multiBooking.send = send;
        multiBooking.closeDateRange = closeDateRange;
        multiBooking.showSelectedValuesAccessories = showSelectedValuesAccessories;
        multiBooking.showSelectedValuesCategories = showSelectedValuesCategories;
        multiBooking.categorySubs = categorySubs;
        multiBooking.addInput = addInput;
        multiBooking.removeInput = removeInput;
        multiBooking.categoryValid = categoryValid;

        // variables
        multiBooking.excludedBikeSizes = [
          bikeOptions.allSizesValue,
          bikeOptions.unisizeValue
        ];
        multiBooking.START_TIME = '9';
        multiBooking.END_TIME = '18';
        multiBooking.current_day = (new Date()).setHours(0, 0, 0, 0);
        multiBooking.success_request = false;
        multiBooking.form = {
          long_term: !!$stateParams.type, //set received long-term value to boolean type
          city: $stateParams.location ? $stateParams.location : '',
          start_date: '',
          start_at: multiBooking.START_TIME,
          end_at: multiBooking.END_TIME,
          duration: 0,
          name: '',
          email: '',
          phone_number: '',
          notes: '',
          variations: [
            {
              bike_sizes_ungrouped:[],
              bike_sizes: [],
              category_ids: [],
              accessories: []
            }
          ]
        };

        multiBooking.translatedValues = {
          categories: [],
          accessories: []
        };

        // invocations
        multiBooking.disabledDates = [{
          start_date: multiBooking.current_day,
          duration: 1
        }];
        bikeOptions.accessoryOptions().then(function (resolve) {
          multiBooking.translatedValues.accessories = resolve;
        });
        bikeOptions.allCategoriesOptions().then(function (resolve) {
           _.forEach(resolve, function(category){
            multiBooking.translatedValues.categories.push(category.subcategories);
          });
          multiBooking.translatedValues.categories = _.flatten(multiBooking.translatedValues.categories);
        });
      }

      ///////////

      function addInput() {
        multiBooking.form.variations.push({
          bike_sizes_ungrouped:[],
          bike_sizes: [],
          category_ids: [],
          accessories: []
        });
      }

      function removeInput(index) {
        multiBooking.form.variations.splice(index, 1);
      }

      function categoryValid(){
        var valid = true;
        _.forEach(multiBooking.form.variations, function (item) {
          valid = valid && !!item.category_ids.length;
        });
        return valid;
      }

      // tricky function to initialize date-picker close, when we click ng-menu
      function closeDateRange() {
        var datePickerTrigger = angular.element('.js-datepicker-opened');
        if (datePickerTrigger.length) {
          datePickerTrigger.click();
        }
      }

      function groupBikeSizes() {
        _.forEach(multiBooking.form.variations, function (item) {
          item.bike_sizes.length = 0; // clear array of bike_sizes
          _.forOwn(_.countBy(item.bike_sizes_ungrouped), function (value, key) {
            item.bike_sizes.push({
              'size': +key,
              'count': value
            });
          });
        });
      }

      function beforeSend() {
        groupBikeSizes();
        // DIRTY_FIX: add one extra day to humanize duration in email
        multiBooking.form.duration += 1;
        _.forEach(multiBooking.form.variations, function (item) {
          item.category_id = item.category_ids[0];
        });
      }

      function send() {
        beforeSend();
        var data = { 'multi_booking': multiBooking.form};
        api.post('/multi_booking', data).then(
          function (success) {
            multiBooking.success_request = true;
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

      function categorySubs(id) {
        return _.map(_.find(categoryFilter.categories, function (category) {
          return category.catId === id;
        }).subcategories, 'id').sort()
      }

      function showSelectedValuesAccessories(index) {
        var str = '';
        _.forEach(multiBooking.form.variations[index].accessories, function(item) {
          str += _.find(multiBooking.translatedValues.accessories, function(o){
            return o.model === item;
          }).name + ', ';
        });

        return str.slice(0, -2);
      }

      function showSelectedValuesCategories(index) {
        var str = '';
        _.forEach(multiBooking.form.variations[index].category_ids, function (id) {
          str += _.find(multiBooking.translatedValues.categories, function (o) {
            return o.id == id;
          }).name + ', ';
        });

        return str.slice(0, -2);
      }
    }
  ]
});
