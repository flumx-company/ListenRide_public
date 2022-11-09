'use strict';

angular.module('listings', []).component('listings', {
  templateUrl: 'app/modules/listings/listings.template.html',
  controllerAs: 'listings',
  controller: function ListingsController($scope, $stateParams, $mdDialog, $analytics, $timeout, $mdToast, $filter, $translate, $state, $localStorage, $mdMedia, api, accessControl, notification, bikeHelper) {
      if (accessControl.requireLogin()) {
        return
      }
      var listings = this;

      listings.$onInit = function () {
        // variables
        listings.input = $stateParams.q || '';
        listings.maxTiles = 12;
        listings.status = '';
        listings.isDuplicating = false;
        listings.endPoint = '/users/' + $localStorage.userId + "/rides";
        listings.pagination = {
          next_page: '',
          prev_page: '',
          total_pages: ''
        };
        listings.currentPageIndex = +$stateParams.page || 1;
        if ($localStorage.listView) listings.listView = true;
        listings.checkedBikes = [];

        // methods
        listings.getBikes = getBikes;
        listings.changePage = changePage;
        listings.isPaginationInRange = isPaginationInRange;
        listings.canMerge = canMerge;
        listings.canDeactivateMulti = canDeactivateMulti;
        listings.changeBikeAvailableTo = changeBikeAvailableTo;

        listings.helper = {
          // local method to be called on duplicate success
          duplicateHelper: function (bike, duplicate_number) {
            api.post('/rides/' + bike.id + '/duplicates', {
              'duplicate': {
                "quantity": duplicate_number
              }
            }).then(function (response) {
              var job_id = response.data.job_id;
              listings.getStatus(bike, job_id, 'initialized');
              notification.show(response, null, 'toasts.duplicate-start');
            }, function (error) {
              notification.show(error, 'error');
            });
          },

          // local method containing logic for bike deletion
          deleteHelper: function (id) {
            api.delete("/rides/" + id).then(
              function (response) {
                _.remove(listings.mirror_bikes, function(n) {
                  return n.id === response.data.id;
                });
                listings.bikes = listings.mirror_bikes;
                // if (listings.input) { listings.search() }
                notification.show(response, null, 'toasts.bike-deleted');
                $analytics.eventTrack('List a Bike', { category: 'List Bike', label: 'Bike Removed' });
              },
              function (error) {
                notification.show(error, 'error');
              }
            );
          },
          deleteClusterHelper: function(id) {
            api.delete("/clusters/" + id).then(function(response){
              listings.getBikes();
              notification.show(response, null, 'toasts.cluster-deleted');
            }, function(error){
              notification.show(error, 'error');
            })
          }
        };

        // invocations
        // listings.getBikes()
      };

      // CHILD CONTROLLERS

        // local method to be used as duplicate dialog controller
        var DuplicateController = function () {
          var duplicate = this;
          duplicate.duplicate_number = 1;
          // cancel the dialog
          duplicate.cancelDialog = function () {
            $mdDialog.cancel();
          };
          // close the dialog succesfully
          duplicate.closeDialog = function () {
            $mdDialog.hide(parseInt(duplicate.duplicate_number));
          };
        };

        // local method to be used as delete controller
        var DeleteController = function (bike) {
          var deleteBikeDialog = this;
          // cancel dialog
          deleteBikeDialog.hide = function () {
            $mdDialog.hide();
          };
          // delete a bike after confirmation
          deleteBikeDialog.deleteBike = function () {
            bike.is_cluster ? listings.helper.deleteClusterHelper(bike.cluster_id) : listings.helper.deleteHelper(bike.id);
            $mdDialog.hide();
          }
        };

        // TODO: move this to a single file
        var AvailabilityController = function (bike, $scope) {
          var availabilityDialog = this;
          availabilityDialog.inputs = [];
          availabilityDialog.isChanged = false;
          availabilityDialog.removedInputs = [];
          availabilityDialog.disabledDates = [];
          availabilityDialog.addInput = addInput;
          availabilityDialog.destroyInput = destroyInput;
          availabilityDialog.removeInput = removeInput;
          availabilityDialog.create = create;
          availabilityDialog.update = update;
          availabilityDialog.save = save;
          availabilityDialog.destroy = destroy;
          availabilityDialog.close = close;
          availabilityDialog.setData = setData;
          availabilityDialog.takeDisabledDates = takeDisabledDates;
          availabilityDialog.requests = bike.requests;
          availabilityDialog.changeDate = changeDate;

          if (!bike.hasOwnProperty('availabilities')) bike.availabilities = {};
          availabilityDialog.setData();

          //////////////////

          function changeDate() {
            availabilityDialog.isChanged = true;
            availabilityDialog.disabledDates = availabilityDialog.takeDisabledDates();
          }

          function _getModel(item) {
            return {
              'ride_id': bike.id,
              'start_date': item.start_date,
              'duration': item.duration
            }
          }

          function setData() {
            // clear array
            availabilityDialog.isChanged = false;
            availabilityDialog.inputs.length = 0;

            for (var id in bike.availabilities) {
              availabilityDialog.inputs.push({
                id: id,
                'start_date': bike.availabilities[id]['start_date'],
                'duration': bike.availabilities[id]['duration']
              })
            }
            // if it's no availabities let's create one clear range
            if (!availabilityDialog.inputs.length) availabilityDialog.addInput();

            availabilityDialog.disabledDates = availabilityDialog.takeDisabledDates();
          }

          function updateData(data) {
            // update or create item in bike model
            _.forEach(data, function (item) {
              if (bike.availabilities.hasOwnProperty(item.id)) {
                angular.extend(bike.availabilities[item.id], item);
              } else {
                bike.availabilities[item.id] = item;
              }
            });

            availabilityDialog.setData();
          }

          function takeDisabledDates() {
            let disabled = [];
            _.forEach(availabilityDialog.inputs, function (item) {
              if (!item.start_date) return;

              disabled.push({
                'start_date': item.start_date,
                'duration': item.duration
              });

            });
            return disabled;
          }

          function addInput() {
            availabilityDialog.inputs.push({});
          }

          function destroyInput(index) {
            availabilityDialog.inputs.splice(index, 1);

            if (availabilityDialog.inputs.length < 1) {
              availabilityDialog.isChanged = false;
              availabilityDialog.addInput();
            }
            availabilityDialog.disabledDates = availabilityDialog.takeDisabledDates();
          }

          function removeInput(index) {
            // if input has 'id' it was saved, so we should call api to destroy it
            if (availabilityDialog.inputs[index].id) {
              availabilityDialog.destroy(availabilityDialog.inputs[index].id);
            } else {
              destroyInput(index);
            }
          }

          function showSuccessSavedMsg() {
            notification.show(null, null, 'toasts.availability-success-saved');
          }

          function save() {
            if (!availabilityDialog.isChanged) return availabilityDialog.close();
            checkUpdated();
          }

          function checkUpdated() {
            var updateData = { 'availabilities': {} };
            var updatedItems = availabilityDialog.inputs.filter(function (item) {
              return item.hasOwnProperty('id') && item.hasOwnProperty('is_changed');
            });

            if (updatedItems.length) {
              _.forEach(updatedItems, function (item) {
                updateData['availabilities'][item.id] = _getModel(item);
              });
              update(JSON.stringify(updateData));
            } else {
              checkCreated();
            }
          }

          function checkCreated() {
            var newData = { 'availabilities': [] };
            var newItems = availabilityDialog.inputs.filter(function (item) {
              return !item.hasOwnProperty('id') && item.hasOwnProperty('is_changed');
            });

            if (newItems.length) {
              _.forEach(newItems, function (item) {
                newData['availabilities'].push(_getModel(item));
              });
              create(JSON.stringify(newData));
              return true;
            } else {
              return false;
            }
          }

          function update(data) {
            api.put('/rides/' + bike.id + '/availabilities/', data).then(
              function (response) {
                //TODO: rewrite by q.defer chain
                if (!checkCreated()) {
                  availabilityDialog.isChanged = false;
                  showSuccessSavedMsg();
                  updateData(response.data);
                }
              },
              function (error) {
                notification.show(error, 'error');
              }
            );
          }

          function create(data) {
            api.post('/rides/' + bike.id + '/availabilities/', data).then(
              function (response) {
                updateData(response.data);
                //TODO: replace it to save function (q.defer chain)
                availabilityDialog.isChanged = false;
                showSuccessSavedMsg();
              },
              function (error) {
                notification.show(error, 'error');
              }
            );
          }

          function destroy(id) {
            api.delete('/rides/' + bike.id + '/availabilities/' + id).then(
              function (response) {
                delete bike.availabilities[response.data.id];
                availabilityDialog.setData();
                // destroyInput(_.findIndex(availabilityDialog.inputs, { 'id': response.data.id }));
                notification.show(response, null, 'toasts.range-success-delete');
              },
              function (error) {
                notification.show(error, 'error');
              }
            );
          }

          function close() {
            $mdDialog.hide();
          }

        };

        var mergeController = function () {
          var mergeBikeDialog = this;
          mergeBikeDialog.bikes_count = listings.checkedBikes.length;

          // cancel dialog
          mergeBikeDialog.hide = function () {
            $mdDialog.hide();
          };
          // merge bikes after confirmation
          mergeBikeDialog.mergeBike = function () {
            if (listings.isClusterChecked()) {
              var id_exists = existsInObject(true, listings.checkedBikes, 'is_cluster');
              var clusterBikeArray = listings.checkedBikes.splice(id_exists, 1);
              return mergeBikesToExistingCluster(clusterBikeArray[0]);
            }

            var data = JSON.stringify({ "cluster": {
              "ride_ids": _.map(listings.checkedBikes, 'id')
            }
            });
            api.post("/clusters", data).then(
                function (response) {
                  notification.show(response, null, 'toasts.cluster-merged');
                  listings.checkedBikes.length = 0;
                  listings.getBikes();
                },
                function (error) {
                  notification.show(error, 'error');
                }
            );
            $mdDialog.hide();
          };
        };

        var unmergeController = function (bike, bikes_count) {
          var unmergeBikeDialog = this;
          unmergeBikeDialog.bikes_count = bikes_count;
          // cancel dialog
          unmergeBikeDialog.hide = function () {
            $mdDialog.hide();
          };
          // unmerge bikes after confirmation
          unmergeBikeDialog.unmergeBike = function () {
            api.put("/clusters/" + bike.cluster_id + '/unmerge').then(function (response) {
              listings.getBikes();
              notification.show(response, null, 'toasts.cluster-unmerged');
            }, function (error) {
              notification.show(error, 'error');
            });
            $mdDialog.hide();
          };
        };

      // END OF CHILD CONTROLLERS

      // search functionality in header of My Bikes (List View)
      listings.search = function () {
        $scope.$apply(function () {
          $state.go(
            $state.current, {
              page: 1,
              q: listings.input
            }, {
              notify: false
            }
          );

          listings.currentPageIndex = 1;
          listings.getBikes();
        });
        // listings.bikes = $filter('filter')(listings.mirror_bikes, filterFunction, { $: listings.input });
      };
      var delayedSearch = _.debounce(listings.search, 1000);
      $scope.$watch("listings.input", function () {
        delayedSearch();
      });

      var filterFunction = function(bike) {
        //TODO improve search by reducing extra params from backend
        var val = listings.input.toLocaleLowerCase();
        return bike.name.toLocaleLowerCase().indexOf(val) > -1 || bike.city.toLocaleLowerCase().indexOf(val) > -1 || bike.brand.toLocaleLowerCase().indexOf(val) > -1;
      };

      // function to add separator for page navigation and show only 4 items in list
      function isPaginationInRange(index) {
        if (listings.pagination.total_pages <= 5) return true;
        // show only first page, last page, current page and pages near current page (in 1 range)
        return index === 1 || index === listings.pagination.total_pages || listings.currentPageIndex - 1 === index || listings.currentPageIndex + 1 === index || listings.currentPageIndex === index;
      }

      // Redirect to bike list
      listings.listBike = function () {
        $state.go('list');
      };

      // bikes duplication takes long time
      // this method is used to keep checking status api
      // and fetch bikes once they are uploaded
      listings.getStatus = function (bike, jobId) {
        listings.isDuplicating = true;
        api.get('/rides/' + bike.id + '/status/' + jobId + '?lng=' + $translate.preferredLanguage()).then(function (response) {
          listings.status = response.data.status;
          // if status is not complete
          // keep checking the status api every 5 seconds
          if (listings.status !== 'complete') {
            // avoid self invocation of a function
            $timeout(function () {
              listings.getStatus(bike, jobId, listings.status)
            },
              // every 5 sec
              5000);
          }
          // once status is complete
          // bind new bikes with controller scope
          else if (listings.status === 'complete') {
            listings.isDuplicating = false;
            listings.getBikes();
          }
        }, function (error) {
          notification.show(error, 'error');
        });
      };

      // duplicate a bike
      listings.duplicate = function (bike, event) {
        var duplicateConfig = {
          templateUrl: 'app/modules/listings/views/list-view.duplicate.template.html',
          controller: DuplicateController,
          controllerAs: 'duplicate',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          escapeToClose: true,
          fullscreen: true
        };
        $mdDialog.show(duplicateConfig).then(function (duplicate_number) {
          listings.helper.duplicateHelper(bike, duplicate_number);
        }, function () {
        });
      };

      // delete a bike
      // asks for confirmation
      listings.delete = function (bike, event) {
        $mdDialog.show({
          controller: DeleteController,
          controllerAs: 'deleteBikeDialog',
          templateUrl: 'app/modules/shared/listing-card/delete-bike-dialog.template.html',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          locals: {
            bike: bike
          }
        });
      };

      listings.changeAvailability = function (bike, event) {
        $mdDialog.show({
          controller: AvailabilityController,
          controllerAs: 'availabilityDialog',
          templateUrl: 'app/modules/shared/listing-card/availability-bike-dialog.template.html',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          fullscreen: true,
          escapeToClose: false,
          locals: {
            bike: bike
          }
        });
      };

      listings.mergeBikesToCluster = function(bike, event) {
        $mdDialog.show({
          controller: mergeController,
          controllerAs: 'mergeBikeDialog',
          templateUrl: 'app/modules/shared/listing-card/merge-bike-dialog.template.html',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          fullscreen: true,
          locals: {
            bike: bike
          }
        });
      }

      listings.unmergeCluster = function (bike, event) {
        $mdDialog.show({
          controller: unmergeController,
          controllerAs: 'unmergeBikeDialog',
          templateUrl: 'app/modules/shared/listing-card/unmerge-bike-dialog.template.html',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          fullscreen: true,
          locals: {
            bike: bike,
            bikes_count: bike.rides_count
          }
        });
      }

      // deactivate a bike
      // used only in List View
      // Tile View has its own implementation
      function changeBikeAvailableTo(bike, changeTo) {
        listings.changeAvailableInProgress = true;
        bikeHelper.changeBikeAvailableTo(bike, changeTo)
          .then(response => {
            bike.available = changeTo;
            listings.changeAvailableInProgress = false;
          })
          .catch(error => {
            notification.show(error, 'error');
            listings.changeAvailableInProgress = false;
          })
      }

      // fetch bikes
      function getBikes() {
        var firstRequest = _.isEmpty(listings.bikes);
        var params = '?page=' + listings.currentPageIndex + '&q=' + listings.input;
        api.get(listings.endPoint + params).then(
          function (response) {
            listings.bikes = response.data.bikes;
            // TODO: rewrite mirror bikes logic
            listings.mirror_bikes = response.data.bikes;
            listings.pagination = response.data.pagination;
            // if (listings.input) { listings.search() }

            // automatically switch to list view, do this only for the first request
            if (!listings.listView && firstRequest) {
              listings.listView = listings.bikes.length >= listings.maxTiles && $mdMedia('gt-sm');
              $localStorage.listView = listings.listView;
            }
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

      function changePage(pageIndex) {
        $state.go(
          $state.current, {
            page: pageIndex
          }, {
            notify: false
          }
        );
        listings.currentPageIndex = pageIndex;
        listings.getBikes();
      }

      // Redirect to Edit Bike route
      listings.edit = function (id) {
        $state.go('edit', { bikeId: id });
      };

      // Redirect to View Bike route
      listings.view = function (id, event) {
        // stop event from propograting
        if (event && event.stopPropogation) event.stopPropogation();
        // sref
        $state.go('bike', { bikeId: id });
      };

      // save view mode in localstorage
      listings.changeListingMode = function(mode) {
        $localStorage.listView = mode;
      };

      listings.isCheckedBike = function(id) {
        return existsInObject(id, listings.checkedBikes, 'id') > -1;
      };

      listings.isClusterChecked = function() {
        return existsInObject(true, listings.checkedBikes, 'is_cluster') > -1;
      };

      listings.checkBikeTile = function($event, bike) {
        $event.preventDefault();
        $event.stopPropagation();
        var id_exists = existsInObject(bike.id, listings.checkedBikes, 'id');
        id_exists > -1 ? listings.checkedBikes.splice(id_exists, 1) : listings.checkedBikes.push(bike);
      };

      listings.isCheckMode = function() {
        return listings.checkedBikes.length;
      };

      function existsInObject(item, obj, findBy) {
        return _.findIndex(obj, function(o) { return o[findBy] === item; });
      }

      function canMerge() {
        return listings.checkedBikes.length > 1 &&
          _.filter(listings.checkedBikes, function(o) { return o.is_cluster; }).length <= 1
      }

      function mergeBikesToExistingCluster(clusterBike) {
        var data = JSON.stringify({
          "cluster": {
            "ride_ids": _.map(listings.checkedBikes, 'id')
          }
        });
        api.put("/clusters/" + clusterBike.cluster_id, data).then(
          function (response) {
            notification.show(response, null, 'toasts.cluster-merged');
            listings.checkedBikes.length = 0;
            listings.getBikes();
          },
          function (error){
            notification.show(error, 'error');
          }
        )
      }

      function canDeactivateMulti() {
        return !!listings.checkedBikes.length;
      }
    }
  }
);
