'use strict';
import MarkerClusterer from '@google/markerclustererplus';

angular.module('brands', []).component('brands', {
  templateUrl: 'app/modules/brands/brands.template.html',
  controllerAs: 'brands',
  controller: ['$timeout', '$translatePartialLoader', '$state', 'ENV', 'notification', 'mapConfigs', 'NgMap', 'api',
    function BrandsController($timeout, $tpl, $state, ENV, notification, mapConfigs, NgMap, api) {

      var brands = this;
      $tpl.addPart(ENV.staticTranslation);

      brands.$onInit = function () {
        // variables
        brands.isMapView = false;
        brands.categoryIds = [];
        brands.selectedCategories = [];
        brands.filteredBrands = [];
        brands.data = [];
        brands.allPins = [];
        brands.colorScheme = mapConfigs.colorScheme();
        brands.isMapView = !!$state.params.view;
        // TODO: change to first picked Brand
        brands.mapOptions = {
          lat: 50.1176084,
          lng: 11.362239,
          zoom: 5
        };


        // methods
        brands.isIncludeCategory = isIncludeCategory;
        brands.filterChange = filterChange;
        brands.checkSelectedBrands = checkSelectedBrands;
        brands.toggleView = toggleView;
        brands.onMapClick = onMapClick;
        // invocations
        getData();
      };

      function getData() {
          api.get('/brand_pages').then(
            function (success) {
              brands.data = success.data;
              _.forEach(brands.data, function(brand) {
                brands.allPins = _.concat(brands.allPins, brand.pins);
              });
              checkSelectedBrands();
              initializeGoogleMap();
            },
            function (error) {
              notification.show(error, 'error');
            }
          );

      }

      function isIncludeCategory(brandCategories) {
        // show all brands if no categories picked
        if (!brands.categoryIds.length) return true;
        return !!_.intersection(brands.categoryIds, brandCategories).length;
      }

      function filterChange() {
        brands.checkSelectedBrands();
        $timeout(function () {
          refreshMarkerCluster(brands.map);
        }, 0);
      }

      function checkSelectedBrands() {
        brands.filteredBrands = [];
        // show all brands if no categories picked
        if (brands.categoryIds.length) {
          _.forEach(brands.data, function (brand) {
            if (_.intersection(brands.categoryIds, brand.categories).length) brands.filteredBrands.push(brand);
          });
        } else {
          brands.filteredBrands = brands.data;
        }
      }

      function toggleView (mode) {
        brands.isMapView = mode;
        brands.view = (brands.isMapView) ? 'map' : '';
        $state.go(
          $state.current, {
            view: brands.view
          }
        );
      }

      // ============================
      // >>>> START MAP FUNCTIONALITY
      // ============================

      function onMapClick() {
        if (brands.map) {
          brands.map.hideInfoWindow('searchMapWindow');
          brands.selectedBrand = undefined;
        }
      }


      function initializeGoogleMap() {
        // without timeout map will take an old array with bikes
        $timeout(function(){
          NgMap.getMap({ id: "searchMap" }).then(function (map) {
            map.fitBounds(correctBounds());
            initMarkerClusterer(map);
            brands.map = map;
          });
        }, 0);
      }

       function correctBounds() {
        var bounds = new google.maps.LatLngBounds();

        _.forEach(brands.allPins, function (pin) {
          bounds = extendBounds(bounds, pin.lat, pin.lng);
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
        var markers = [];
        _.forEach(brands.filteredBrands, function (brand) {
          _.forEach(brand.pins, function (pin) {
            markers.push(createMarkerForBrand(pin, map, brand));
          })
        });

        brands.clusterer.clearMarkers();
        /**
         * Add new markers and redraw a map
         * @param {Array} markers google.maps.Marker
         * @param {Boolean} opt_nodraw
         */
        brands.clusterer.addMarkers(markers, false);
      }

      function initMarkerClusterer(map) {
        var markers = [];

        _.forEach(brands.filteredBrands, function(brand){
          _.forEach(brand.pins, function(pin){
            markers.push(createMarkerForBrand(pin, map, brand));
          })
        });

        brands.mapMarkers = markers;

        var mcOptions = {
          styles: mapConfigs.clustersStyle()
        };
        brands.clusterer = new MarkerClusterer(map, markers, mcOptions);
        return brands.clusterer
      }

      function createMarkerForBrand(pin, map, brand) {
        // Origins, anchor positions and coordinates of the marker increase in the X
        // direction to the right and in the Y direction down.
        var image = {
          url: 'app/assets/ui_icons/map/markers/pin_map_bike_56x56.png',
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
          position: new google.maps.LatLng(pin.lat, pin.lng),
          id: brand.id,
          icon: image,
          title: brand.title,
          // label: { text: brand.title, color: "white", fontSize: '13px', fontWeight: 'bold' }
        });

        google.maps.event.addListener(marker, 'click', function () {
          brands.selectedBrand = brand;
          map.showInfoWindow('searchMapWindow', this);
        });

        return marker;
      }

      // ============================
      // END MAP FUNCTIONALITY <<<<<<
      // ============================
    }
  ]
});
