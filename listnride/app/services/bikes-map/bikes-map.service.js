'use strict';
import MarkerClusterer from '@google/markerclustererplus';

angular.module('listnride')
  .factory('bikesMap', function (NgMap, mapConfigs, $mdMedia, $timeout) {
    return {
      initializeGoogleMap: function(mapId, bikes) {
        // without timeout map will take an old array with bikes
        $timeout(function(){
          NgMap.getMap({ id: mapId }).then(function (map) {
            map.fitBounds(this.correctBounds(bikes));
            map.setZoom(map.getZoom());
            this.initMarkerClusterer(map);
          });
        }, 0);
      },
      initMarkerClusterer: function (map) {
        var markers = cityLanding.bikes[0].map(function (bike) {
          return this.createMarkerForBike(bike, map);
        });
        var mapMarkers = markers;
        var mcOptions = {
          styles: mapConfigs.clustersStyle()
        };
        var clusterer = new MarkerClusterer(map, markers, mcOptions);
        return clusterer;
      },
      createMarkerForBike: function (bike, map) {
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
          var selectedBike = bike;
          map.showInfoWindow('searchMapWindow', this);
        });
        return marker;
      },
      correctBounds: function (bikes) {
        var bounds = new google.maps.LatLngBounds();
        if (!_.isEmpty(cityLanding.locationBounds)) {
          bounds = this.extendBounds(bounds, cityLanding.locationBounds.northeast.lat, cityLanding.locationBounds.northeast.lng);
          bounds = this.extendBounds(bounds, cityLanding.locationBounds.southwest.lat, cityLanding.locationBounds.southwest.lng);
          bounds = this.extendBounds(bounds, cityLanding.latLng.lat, cityLanding.latLng.lng);
        }
        var i = 0;
        _.forEach(bikes, function(bike) {
          if (bike.priority == true) return;
          bounds = extendBounds(bounds, bike.lat_rnd, bike.lng_rnd);
          i++;
          if (i > 3) return false;
        });
        return bounds;
      },
      extendBounds: function(bounds, lat, lng) {
        var loc = new google.maps.LatLng(lat, lng);
        bounds.extend(loc);
        return bounds;
      }
    };
  });
