'use strict';
import MarkerClusterer from '@google/markerclustererplus';

/*
Structure of bike search component:

Search
      |__Filter
      |__Cardgrid
                 |__Sorter
*/

angular.module('search',[]).component('search', {
  templateUrl: 'app/modules/search/search.template.html',
  controllerAs: 'search',
  bindings: {
    location: '<'
  },
  controller: ['$translate', '$stateParams','$state', '$timeout', 'NgMap', 'ngMeta', 'api', 'mapConfigs',
    function SearchController($translate, $stateParams, $state, $timeout, NgMap, ngMeta, api, mapConfigs) {
      var search = this;
      search.$onInit = function() {
        // variables
        search.location = $stateParams.location;
        search.colorScheme = mapConfigs.colorScheme();
        search.filteredBikes = [];
        search.filteredDateBikes = [];
        search.mapMarkers = [];
        search.correctLocationCoordinates = '';
        search.noResult = true;
        search.initialValues = {
          amount: '',
          sizes: [],
          categories: [],
          brand: '',
          date: {
            "start_date": '',
            "duration": ''
          },
          correctBoundsCoords: {
            lat: '',
            lng: '',
            ne: '',
            sw: ''
          }
        };

        // methods
        search.showBikeWindow = showBikeWindow;
        search.placeChanged = placeChanged;
        search.onCategoryChange = onCategoryChange;
        search.onMapClick = onMapClick;
        search.onBikeHover = onBikeHover;
        search.updateBikeData = updateBikeData;
        search.updateBikesDataByRequest = updateBikesDataByRequest;
        search.setMapGeometry = setMapGeometry;
        search.populateBikes = populateBikes;
        search.addMoreItemsLimit = addMoreItemsLimit;
        search.onDateChange = onDateChange;
        search.countBikes = countBikes;

        // get initial filter values from url
        search.initialValues = {
          sizes: $stateParams.sizes.split(','),
          brand: $stateParams.brand,
          categories: $stateParams.categories.split(','),
          date: {
            "start_date": $stateParams.start_date,
            "duration": $stateParams.duration
          },
          correctBoundsCoords: {
            lat : $stateParams.lat,
            lng : $stateParams.lng,
            ne : $stateParams.ne,
            sw : $stateParams.sw
          }
        }
        // default map options
        search.limit = 15;
        search.mapOptions = {
          lat: 40,
          lng: -74,
          zoom: 5
        };

        // invocations
        getUrlParams();
        populateBikes(search.location);
        setMetaTags(search.location);
      };

      function getUrlParams() {
        search.urlParams = {
          size : $stateParams.sizes,
          start_date : $stateParams.start_date,
          duration : $stateParams.duration
        };
      }

      search.updateState = function(params, cb) {
        $state.go(
          $state.current,
          params,
          { notify: false }
        ).then(function(){
          getUrlParams();
          $timeout(function () {
            refreshMarkerCluster(search.map);
          },0);
          if (typeof cb === "function") cb();
        });
      };

      function onMapClick () {
        if (search.map) {
          search.map.hideInfoWindow('searchMapWindow');
          search.selectedBike = undefined;
        }
      }

      function showBikeWindow(evt, bikeId) {
        if (search.map) {
          search.selectedBike = search.bikes.find(function(bike) {
            return bike.id === bikeId;
          });

          search.map.showInfoWindow('searchMapWindow', this);
        }
      }

      function placeChanged(place) {
        var location = place.formatted_address || place.name;
        $state.go(
          // current state
          $state.current,
          // state params
          { location: location },
          // route options
          // do not remove inherit prop, else map tiles stop working
          { notify: false }
        );
        search.location = location;
        setMetaTags(location);
        populateBikes(location);
      }

      function onCategoryChange(category) {
        var categoryMap = {};
        categoryMap[category] = search.categoryFilter[category];
        $state.go(
          // current state
          $state.current,
          // state params
          categoryMap,
          // route options
          // do not remove inherit prop, else map tiles stop working
          { notify: false }
        );
      }

      function populateBikes(location) {
        search.correctLocationCoordinates = '';
        search.bikes = undefined;
        search.noResult = false;

        location = location ? location : $stateParams.location;

        // if bounds on map was corrected
        if (search.initialValues.correctBoundsCoords.lat && search.initialValues.correctBoundsCoords.lng) {
          search.correctLocationCoordinates = '&' + transformObjToUrl(search.initialValues.correctBoundsCoords);
        }

        var urlRequest = "/rides?location=" + location + search.correctLocationCoordinates;

        search.updateBikesDataByRequest(urlRequest);
      }

      function updateBikesDataByRequest(urlRequest) {
        api.get(urlRequest).then(function (response) {
          setParamsFromResponse(response);
          return getUnavailableBikes();
        }).then(function (results) {
          if (results) {
            search.unavailableIds = results.data.ids;
            setUnavailableBikes();
          }
          search.noResult = search.bikes !== undefined && search.bikes.length === 0
        },
        function (error) {
          search.noResult = true;
        });
      }

      function getUnavailableBikes() {
        var urlRequest = "start_date=" + $stateParams.start_date;
        urlRequest += "&duration=" + $stateParams.duration;

        if (!$stateParams.start_date && !$stateParams.duration) {
          return false;
        } else {
          return api.get('/rides/unavailable?' + urlRequest);
        }
      }

      function getNewBikesByBounds(){
        // if bounds on map was corrected
        if (search.initialValues.correctBoundsCoords.lat && search.initialValues.correctBoundsCoords.lng) {
          search.correctLocationCoordinates = '?' + transformObjToUrl(search.initialValues.correctBoundsCoords);
          return api.get('/rides/' + search.correctLocationCoordinates);
        } else {
          return false;
        }
      }

      function setParamsFromResponse(response) {
        search.updateBikeData(response);
        search.setMapGeometry(response);
        initializeGoogleMap();
      }

      function updateBikeData(response) {
        search.bikes = response.data.bikes;
        search.filteredDateBikes = search.bikes.slice();
        search.categorizedFilteredBikes = [{
          title: "All Bikes",
          bikes: search.bikes
        }];
        search.titles = [];
      }

      function setMapGeometry(response) {
        // Google
        if (response.data.location.geometry) {
          search.latLng = response.data.location.geometry.location;
          search.locationBounds = response.data.location.geometry.viewport;
        } else {
          // take from URL
          search.latLng = {
            lat: $stateParams.lat,
            lng: $stateParams.lng
          }
          search.locationBounds = {
            'northeast': {
              lat: $stateParams.ne.split(',')[0],
              lng: $stateParams.ne.split(',')[1]
            },
            'southwest': {
              lat: $stateParams.sw.split(',')[0],
              lng: $stateParams.sw.split(',')[1]
            }
          }
        }
      }

      function transformObjToUrl(obj) {
        return Object.keys(obj).map(function (key) {
          return key + '=' + obj[key];
        }).join('&');
      }

      // ============================
      // >>>> START MAP FUNCTIONALITY
      // ============================

      // show bike card in maps on card hover
      function onBikeHover (bike, toShow) {
        //TODO: fix on hover
        // if (search.map) {
        //   search.selectedBike = bike;
        //   if (toShow) {
        //     var marker = _.find(search.clusterer.getMarkers(), ['id', bike.id]);
        //     google.maps.event.trigger( marker, 'click' );
        //   } else {
        //     search.map.hideInfoWindow('searchMapWindow');
        //   }
        // }
      }

      function initializeGoogleMap() {
        // without timeout map will take an old array with bikes
        $timeout(function(){
          NgMap.getMap({ id: "searchMap" }).then(function (map) {
            map.fitBounds(correctBounds());
            map.setZoom(map.getZoom());
            initMarkerClusterer(map);
            search.map = map;
            // map.panToBounds(bounds);
          });
        }, 0);
      }

      function correctBounds() {
        var bounds = new google.maps.LatLngBounds();
        if (!_.isEmpty(search.locationBounds)) {
          bounds = extendBounds(bounds, search.locationBounds.northeast.lat, search.locationBounds.northeast.lng);
          bounds = extendBounds(bounds, search.locationBounds.southwest.lat, search.locationBounds.southwest.lng);
          bounds = extendBounds(bounds, search.latLng.lat, search.latLng.lng);
        }

        var i = 0;
        _.forEach(search.bikes, function(bike) {
          if (bike.priority == true) return;
          bounds = extendBounds(bounds, bike.lat_rnd, bike.lng_rnd);
          i++;
          if (i > 3) return false;
        });

        return bounds
      }

      function extendBounds(bounds, lat, lng) {
        var loc = new google.maps.LatLng(lat, lng);
        bounds.extend(loc);
        return bounds
      }

      // Clear Markers, Add new and redraw map on each state update
      function refreshMarkerCluster(map) {
        var markers = search.filteredBikes.map(function (bike) {
          return createMarkerForBike(bike, map);
        });
        search.clusterer.clearMarkers();
        /**
         * Add new markers and redraw a map
         * @param {Array} markers google.maps.Marker
         * @param {Boolean} opt_nodraw
         */
        search.clusterer.addMarkers(markers, false);
      }

      function initMarkerClusterer(map) {
        var markers = search.filteredBikes.map(function (bike) {
          return createMarkerForBike(bike, map);
        });

        search.mapMarkers = markers;

        var mcOptions = {
          styles: mapConfigs.clustersStyle()
        };
        search.clusterer = new MarkerClusterer(map, markers, mcOptions);
        return search.clusterer
      }

      function createMarkerForBike(bike, map) {
        // Origins, anchor positions and coordinates of the marker increase in the X
        // direction to the right and in the Y direction down.
        var image = {
          url: 'app/assets/ui_icons/map/markers/Pin Map 56x56.png',
          // This marker is 56 pixels wide by 56 pixels high.
          size: new google.maps.Size(56,56),
          // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
          // The anchor for this image is the base of the flagpole at (56/2, 56).
          anchor: new google.maps.Point(28, 56),
          // The label position inside marker
          labelOrigin: new google.maps.Point(28, 22)
          // scaledSize: new google.maps.Size(50, 50)
        };

        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(bike.lat_rnd, bike.lng_rnd),
          id: bike.id,
          icon: image,
          title: Math.ceil(bike.price_from) + '€',
          label: { text: Math.ceil(bike.price_from) + '€', color: "white", fontSize: '13px', fontWeight: 'bold' }
        });

        google.maps.event.addListener(marker, 'click', function () {
          search.selectedBike = bike;
          map.showInfoWindow('searchMapWindow', this);
        });

        return marker;
      }


      search.centerChanged = function() {
        // Check if map exists and bounds changed
        // https://developers.google.com/maps/documentation/javascript/reference/coordinates#LatLngBounds
        if (search.map) {
          search.initialValues.correctBoundsCoords = {
            // map center coordinates
            lat: this.getCenter().lat(),
            lng: this.getCenter().lng(),
            // bounds coordinates
            ne: this.getBounds().getNorthEast().lat() + ',' + this.getBounds().getNorthEast().lng(),
            sw: this.getBounds().getSouthWest().lat() + ',' + this.getBounds().getSouthWest().lng()
          }

          getNewBikesByBounds().then(function(response){
            search.updateBikeData(response);
            search.updateState(search.initialValues.correctBoundsCoords);
          });
        }
      }

      // ============================
      // END MAP FUNCTIONALITY <<<<<<
      // ============================

      function countBikes() {
        if (!search.categorizedFilteredBikes) return;
        return search.categorizedFilteredBikes[0].bikes.reduce(function (accumulator, bike) {
          return accumulator + bike.rides_count;
        }, 0);
      }

      function onDateChange() {
        getUnavailableBikes().then(function(results){
          search.unavailableIds = results.data.ids;
          setUnavailableBikes();
        });
      }

      function setUnavailableBikes() {
        search.filteredDateBikes = search.bikes.slice();

        search.unavailableIds = search.unavailableIds.map(Number);
        search.unavailableBikes = _.remove(search.filteredDateBikes, function (bike) {
          if (bike.is_cluster) {
            var availableBikeIds = _.difference(
              _.map(bike.cluster.variations, 'id'),
              search.unavailableIds
            );
            return availableBikeIds.length === 0;
          } else {
            return _.includes(search.unavailableIds, bike.id);
          }
        });
        search.categorizedFilteredBikes = [{
          title: "All Bikes",
          bikes: search.filteredDateBikes
        }];
      }

      function setMetaTags(location) {
        var data = {
          location: location
        };
        $translate("search.meta-title", data).then(
          function (translation) {
            ngMeta.setTitle(translation);
          }
        );
        ngMeta.setTitle($translate.instant("search.meta-title", data));
        ngMeta.setTag("description", $translate.instant("search.meta-description", data));
      }

      function addMoreItemsLimit() {
        if (!search.bikes) return;
        if (search.limit < search.bikes.length) search.limit += 15;
      }


    }
  ]
});
