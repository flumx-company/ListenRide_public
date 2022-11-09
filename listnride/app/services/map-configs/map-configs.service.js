'use strict';

angular.module('listnride')
  .factory('mapConfigs', [ function () {
    return {
      colorScheme: function () {
        return [
          {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#6195a0"
              }
            ]
          },
          {
            "featureType": "administrative.province",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#f5f5f2"
              },
              {
                "saturation": "0"
              },
              {
                "lightness": "0"
              },
              {
                "gamma": "1"
              }
            ]
          },
          {
            "featureType": "landscape.man_made",
            "stylers": [
              {
                "lightness": "-3"
              },
              {
                "gamma": "1.00"
              }
            ]
          },
          {
            "featureType": "landscape.natural.terrain",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#bae5ce"
              },
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "road",
            "stylers": [
              {
                "saturation": -100
              },
              {
                "lightness": 45
              },
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#787878"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "stylers": [
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#fac9a9"
              },
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.text",
            "stylers": [
              {
                "color": "#4e4e4e"
              }
            ]
          },
          {
            "featureType": "transit",
            "stylers": [
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "transit.station.airport",
            "elementType": "labels.icon",
            "stylers": [
              {
                "hue": "#0a00ff"
              },
              {
                "saturation": "-77"
              },
              {
                "lightness": "0"
              },
              {
                "gamma": "0.57"
              }
            ]
          },
          {
            "featureType": "transit.station.rail",
            "elementType": "labels.icon",
            "stylers": [
              {
                "hue": "#ff6c00"
              },
              {
                "saturation": "-68"
              },
              {
                "lightness": "4"
              },
              {
                "gamma": "0.75"
              }
            ]
          },
          {
            "featureType": "transit.station.rail",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#43321e"
              }
            ]
          },
          {
            "featureType": "water",
            "stylers": [
              {
                "color": "#eaf6f8"
              },
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#c7eced"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "saturation": "-53"
              },
              {
                "lightness": "-49"
              },
              {
                "gamma": "0.79"
              }
            ]
          }
        ];
      },
      clustersStyle: function () {
        return [
          {
            textColor: 'white',
            url: 'app/assets/ui_icons/map/clusters/Map Pin Cluster 53x53.png',
            height: 53,
            width: 53,
            textSize: '17'
          },
          {
            textColor: 'white',
            url: 'app/assets/ui_icons/map/clusters/Map Pin Cluster 56x56.png',
            height: 56,
            width: 56,
            textSize: '17'
          },
          {
            textColor: 'white',
            url: 'app/assets/ui_icons/map/clusters/Map Pin Cluster 66x66.png',
            height: 66,
            width: 66,
            textSize: '17'
          },
          {
            textColor: 'white',
            url: 'app/assets/ui_icons/map/clusters/Map Pin Cluster 78x78.png',
            height: 78,
            width: 78,
            textSize: '17'
          },
          {
            textColor: 'white',
            url: 'app/assets/ui_icons/map/clusters/Map Pin Cluster 90x90.png',
            height: 90,
            width: 90,
            textSize: '17'
          }
        ]
      },
      mapOptions:  {
        lat: 40,
        lng: -74,
        zoom: 5
      }
    };
  }]);
