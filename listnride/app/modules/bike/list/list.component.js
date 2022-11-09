'use strict';

angular.module('list', ['ngLocale'])
  // list form
  .component('list', {
    templateUrl: 'app/modules/bike/list/list.template.html',
    bindings: {
      heading: "<",
      isListMode: "<",
      discountFieldEditable: "<"
    },
    controllerAs: 'list',
    controller: function ListController($localStorage, $stateParams, $state, $analytics,
        Upload, bikeOptions, api, authentication, verification, accessControl,
        loadingDialog, price, countryCodeTranslator, notification, userHelper) {

        if (accessControl.requireLogin()) {
          return;
        }

        var list = this;

        list.$onInit = function () {
          // variables
          // default params
          list.form = {
            name: '',
            brand: '',
            description: '',
            size: '',
            category: '',
            custom_price: false,
            discounts: '',
            frame_size: '',
            bicycle_number: '',
            frame_number: '',
            available: true,
            details: '',
            accessories: {},
            images: [],
            coverage_total: 0,
            prices: [],
            location: {
              country: '',
              city: '',
              street: '',
              zip: ''
            }
          };

          list.selectedIndex = 0;
          list.removedImages = [];
          list.secondDayIndex = 1;
          list.startImage = 1;
          list.sizeOptions = [];
          bikeOptions.sizeOptions([bikeOptions.allSizesValue]).then(function (resolve) {
            list.sizeOptions = resolve
          });
          bikeOptions.accessoryOptions().then(function (resolve) {
            list.accessoryOptions = resolve;
          });
          list.validateObj = {
            height: {min: 1000},
            width: {min: 1500},
            duration: {max: '5m'}
          };
          list.invalidFiles = {};
          list.businessUser = false;
          list.selectedCategory = {};
          bikeOptions.allCategoriesOptions().then(function (resolve) {
            list.categoryOptions = resolve;
          });
          list.coverageOptions = [1000, 2000, 3000, 4000, 5000];

          list.equipmentCategories = [51, 52, 53, 54];
          list.insuranceCountries = ['DE', 'AT'];
          list.variations = [];
          list.canSetHalfDayPrice = true;

          // methods
          list.getUserData = getUserData;
          list.getBikeData = getBikeData;
          list.submitNewRide = submitNewRide;
          list.submitEditedRide = submitEditedRide;
          list.addInput = addInput;
          list.removeInput = removeInput;

          // invocations
          // ListMode - is mode when you create a new bike
          list.isListMode ? list.getUserData() : list.getBikeData();
        }

        var setBusinessForm = function () {
          if (false) {
            list.businessUser = true;
            list.form.custom_price = true;
            list.show_custom_price = true;
          } else {
            list.businessUser = false;
          }
        };

        function subcategoryParent(subId) {
          return _.find(list.categoryOptions, function (category) {
            return _.find(category.subcategories, function (subcategory) {
              return subcategory.id === subId
            })
          });
        }

        list.tabCompleted = function (tabId) {
          return (list.selectedIndex > tabId && list.isListMode) ? "✔" : "    ";
        };

        function getUserData() {
          api.get('/users/' + $localStorage.userId).then(
            function (success) {
              var data = success.data;
              if (!data.has_address || !data.confirmed_phone || data.status === 0) {
                verification.openDialog(true);
              }

              list.form.location = {
                'street': data.street,
                'zip': data.zip,
                'city': data.city,
                'country': data.country
              }

              list.hasTimeSlots = userHelper.hasTimeSlots(data);

              list.form.prices = [];
              list.form.prices = price.generateDefaultPrices(list.hasTimeSlots);

              list.secondDayIndex = list.hasTimeSlots ? 2 : 1;

              list.form.discounts = {
                "daily": 10,
                "weekly": 20
              };

              // Slightly modify form for business listers
              setBusinessForm();
            },
            function (error) {
              notification.show(error, 'error');
            }
          );
        }

        function getBikeData() {
          api.get('/rides/' + $stateParams.bikeId).then(
            function (response) {
              var data = response.data.current;

              if (response.data.current.is_cluster){
                list.clusterData = response.data.cluster;
                // remove primary bike from array of variants
                list.variations = list.clusterData.variations.filter(function(variant){return variant.id !== data.id})
              }

              if (parseInt(data.user.id) === $localStorage.userId) {

                let halfDayPrice = _.find(data.prices, {
                  'start_at': 43200
                });
                list.secondDayIndex = halfDayPrice ? 2 : 1;

                var prices = price.transformPrices(data.prices, data.discounts);
                data.size = parseInt(data.size);

                data.mainCategory = subcategoryParent(data.category).catId;
                list.selectedCategory = subcategoryParent(data.category);
                data.subCategory = data.category;

                // form data for edit bikes
                list.form = Object.assign(list.form, data);
                list.form.prices = prices;

                // if custom price is enabled
                if (list.form.custom_price && !list.businessUser) {
                  list.disableDiscounts();
                  list.show_custom_price = true;
                }

                // if custom price is disabled
                else if (list.form.custom_price === false && !list.businessUser) {
                  list.show_custom_price = false;
                }

                setBusinessForm();
                list.hasTimeSlots = userHelper.hasTimeSlots(data.user);
              }
            },
            function (error) {
              notification.show(error, 'error');
            }
          );
        }

        // form submission for new ride
        function submitNewRide () {
          var prices = price.inverseTransformPrices(list.form.prices, list.isListMode);

          var ride = {
            "ride": Object.assign({}, list.form, {
              "user_id": $localStorage.userId,
              "prices": prices,
              "is_equipment": _.includes(list.equipmentCategories, list.form.subCategory),
              "category": list.form.subCategory,
              "new_images": _.map(list.form.images, function(img){ return img.src }),
              "variations": list.variations
            })
          };

          // Hack to paste hash of Boolean params into JSONB
          ride.ride.accessories = JSON.stringify(ride.ride.accessories);

          api.get('/users/' + $localStorage.userId).then(
            function (success) {
              var user = success.data;
              // Check user status and verified keys
              if (!user.has_address || !user.confirmed_phone || user.status == 0) {
                verification.openDialog(false);
                list.submitDisabled = false;
              } else {
                // Create a bike
                Upload.upload({
                  method: 'POST',
                  url: api.getApiUrl() + '/rides',
                  data: ride,
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + $localStorage.accessToken
                  }
                }).then(
                  function (response) {
                    loadingDialog.close();
                    $state.go("listings");
                    $analytics.eventTrack('List a Bike', {
                      category: 'List Bike',
                      label: 'Bike Added'
                    });
                  },
                  function (error) {
                    notification.show(error, 'error');
                    list.submitDisabled = false;
                    loadingDialog.close();
                  }
                );
              }
            },
            function (error) {
              notification.show(error, 'error');
            }
          );

        }

        // form submission for existing ride
        function submitEditedRide() {
          var prices = price.inverseTransformPrices(list.form.prices);

          var ride = {
            "ride": Object.assign({}, list.form, {
              "user_id": $localStorage.userId,
              "prices": prices,
              "is_equipment": _.includes(list.equipmentCategories, list.form.subCategory),
              "category": list.form.subCategory,
            })
          };
          // Hack to paste hash of Boolean params into JSONB
          ride.ride.accessories = JSON.stringify(ride.ride.accessories);

          // add variations to request data
          if (list.form.is_cluster) {
            ride.ride.variations = list.variations;
          }

          ride['ride']['images_to_remove'] = _.map(list.removedImages, function(img){ return img.id });
          ride['ride']['new_images'] = _.map(_.filter(list.form.images, function(img){ return img.local == 'true' }), function(img){ return img.src });

          function editBikeUrl(){
            return api.getApiUrl() + (list.form.is_cluster ? '/clusters/' + list.clusterData.id + '/update_rides' : '/rides/' + $stateParams.bikeId)
          }

          Upload.upload({
            method: 'PUT',
            url: editBikeUrl(),
            data: ride,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + $localStorage.accessToken
            }
          }).then(
            function (response) {
              loadingDialog.close();
              notification.show(response, null, 'toasts.bike-edit-successful');
              $state.go("listings");
            },
            function (error) {
              notification.show(error, 'error');
              list.submitDisabled = false;
              loadingDialog.close();
            }
          );

        }

        // submit the form
        list.onFormSubmit = function () {
          list.submitDisabled = true;
          loadingDialog.open();
          list.isListMode ? list.submitNewRide() : list.submitEditedRide();
        };

        // set the custom prices for a bike
        list.setCustomPrices = function (dailyPriceChanged) {
          // business users get their prices proposed according to a fixed scheme

          // OLD CODE FOR BUSINESS USERS:
          // if (list.businessUser) { list.form.prices = price.proposeCustomPrices(list.form); }
          // discount fields are enabled and no custom price are set manually

          if (list.discountFieldEditable) {
            // set the prices based on the daily price
            list.form.prices = price.setCustomPrices(list.form);
          }

        };

        list.insuranceAllowed = function () {
          return list.form.location.country && list.insuranceCountries.indexOf(countryCodeTranslator.countryCodeFor(list.form.location.country)) > -1;
        }

        list.resetCustomPrices = function () {
          // hide reset button
          // enable discount field
          list.discountFieldEditable = true;
          // set the prices based on the daily price
          price.setCustomPrices(list.form);
        };

        // disable custom discounts fields
        list.disableDiscounts = function () {
          list.form.custom_price = true;
          list.discountFieldEditable = false;
        };

        // enable custom discounts fields
        list.enableDiscounts = function () {
          list.form.custom_price = false;
          list.discountFieldEditable = true;
        };

        list.toggleDiscount = function () {
          if (list.form.custom_price) {
            list.show_custom_price = true;
            // list.discountFieldEditable = false;
          } else {
            list.resetCustomPrices();
            list.show_custom_price = false;
            list.discountFieldEditable = true;
          }
        };

        // go to next tab
        list.nextTab = function () {
          list.selectedIndex = list.selectedIndex + 1;
        };

        // go to previous tab
        list.previousTab = function () {
          list.selectedIndex = list.selectedIndex - 1;
        };

        list.showAccessories = function () {
          return list.form.subCategory && !_.includes(list.equipmentCategories, list.form.subCategory)
        }

        // add image of the bike
        list.addImage = function (files) {
          if (files && files.length) {
            for (var i = 0; i < files.length; ++i) {
              if (files[i] !== null) {
                list.form.images.push({
                  src: files[i],
                  local: "true"
                });
              }
            }
          }
        };

        // remove image of the bike
        list.removeImage = function (index, img) {
          if (img.id) {
            list.removedImages.push(img);
          }

          list.form.images.splice(index, 1);
        };

        // check the categories
        list.isCategoryValid = function () {
          return list.form.subCategory !== undefined;
        };

        list.isVariationsValid = function () {
          var isValid = true;

          if (list.variations && list.variations.length) {
            _.forEach(list.variations, function (item) {
              item.size = parseInt(item.size);
              isValid = isValid && !isNaN(item.size) &&_.isNumber(item.size);
            });
          }

          return isValid;
        };

        // check bikes details
        list.isDetailsValid = function () {
          return !!(list.form.name &&
            list.form.brand &&
            (list.form.size || list.form.size === 0) &&
            list.form.description &&
            list.isVariationsValid());
        };

        // check picture is correct
        list.isPictureValid = function () {
          return list.form.images.length > 0;
        };

        list.isLocationValid = function () {
          return _.every(list.form.location, Boolean);
        };

        list.isPricingValid = function () {
          // if prices is undefined
          if (!list.form.prices) return false;
          // if one of the price is not provided
          for (var loop = 0; loop < list.form.prices.length; loop += 1) {
            if (list.form.prices[loop].price === undefined) return false;
          }
          return true;
        };

        list.categoryChange = function (oldCategory) {
          if (parseInt(list.form.mainCategory) === 40 || parseInt(oldCategory) === 40) {
            list.form.size = undefined;
          }
        };

        list.fillAddress = function (place) {
          var components = place.address_components;
          if (components) {
            var desiredComponents = {
              "street_number": "",
              "route": "",
              "locality": "",
              "country": "",
              "postal_code": ""
            };

            for (var i = 0; i < components.length; i++) {
              var type = components[i].types[0];
              if (type in desiredComponents) {
                desiredComponents[type] = components[i].long_name;
              }
            }

            list.form.location = {
              'street' : desiredComponents.route + " " + desiredComponents.street_number,
              'zip' : desiredComponents.postal_code,
              'city' : desiredComponents.locality,
              'country' : desiredComponents.country
            }
          }
        };

        list.isFormValid = function () {
          return list.isCategoryValid() &&
            list.isDetailsValid() &&
            list.isPictureValid() &&
            list.isLocationValid() &&
            list.isPricingValid();
        };

        list.changeCategory = function () {
          list.form.subCategory = undefined;
        };

        // DETAILS TAB

        function addInput() {
          list.variations.push({
            size: '',
            frame_size: '',
            bicycle_number: '',
            frame_number: '',
            available: true
          });
        }

        function removeInput(index) {
          list.variations.splice(index, 1);
        }
      }
  })
  // category tab
  .component('categoriesListTab', {
    templateUrl: 'app/modules/bike/list/categories-list-tab.template.html',
    require: {
      parent: '^list'
    },
    controllerAs: 'categoriesTab'
  })
  // details tab
  .component('detailsListTab', {
    templateUrl: 'app/modules/bike/list/details-list-tab.template.html',
    require: {
      parent: '^list'
    },
    controllerAs: 'detailsTab'
  })
  // pictures tab
  .component('picturesListTab', {
    templateUrl: 'app/modules/bike/list/pictures-list-tab.template.html',
    require: {
      parent: '^list'
    },
    controllerAs: 'picturesTab'
  })
  // location tab
  .component('locationListTab', {
    templateUrl: 'app/modules/bike/list/location-list-tab.template.html',
    require: {
      parent: '^list'
    },
    controllerAs: 'locationTab'
  })
  .component('insuranceListTab', {
    templateUrl: 'app/modules/bike/list/insurance-list-tab.template.html',
    require: {
      parent: '^list'
    },
    controllerAs: 'insuranceTab'
  })
  // pricing tab
  .component('pricingListTab', {
    templateUrl: 'app/modules/bike/list/pricing-list-tab.template.html',
    require: {
      parent: '^list'
    },
    controllerAs: 'pricingTab'
  });
