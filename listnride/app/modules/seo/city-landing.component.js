import Swiper from 'swiper';
import MarkerClusterer from '@google/markerclustererplus';

angular.module('cityLanding',[]).component('cityLanding', {
  templateUrl: 'app/modules/seo/city-landing.template.html',
  controllerAs: 'cityLanding',
  controller: function cityLandingController(
    $scope,
    $translate,
    $translatePartialLoader,
    $stateParams,
    $state,
    api,
    ENV,
    bikeOptions,
    ngMeta,
    NgMap,
    mapConfigs,
    $mdMedia,
    applicationHelper,
    $timeout
  ) {
    var cityLanding = this;
    const MOBILE_BIKE_COLUMNS = 3;
    const DESKTOP_BIKECOLUMNS = 8;

    cityLanding.$onInit = function() {
      $translatePartialLoader.addPart(ENV.staticTranslation);
      cityLanding.city = _.capitalize($stateParams.city);
      cityLanding.bikes = {};
      cityLanding.loading = true;
      cityLanding.mapLoading = true;
      cityLanding.categories = [];
      cityLanding.group = {};
      cityLanding.headerTranslation = 'seo.header';
      cityLanding.defaultProfilePicture = applicationHelper.defaultProfilePicture;

      cityLanding.colorScheme = mapConfigs.colorScheme();
      cityLanding.mapOptions = mapConfigs.mapOptions;
      cityLanding.mobileScreen = $mdMedia('xs');
      cityLanding.bikesToShow = cityLanding.mobileScreen ? MOBILE_BIKE_COLUMNS : DESKTOP_BIKECOLUMNS;

      // methods
      cityLanding.onSearchClick = onSearchClick;
      cityLanding.tileRowspan = tileRowspan;
      cityLanding.tileColspan = tileColspan;

      // invocations
      fetchData();
    };

    function fetchData() {
      var lang = $translate.preferredLanguage();

      api.get('/seo_page?city=' + cityLanding.city + '&lang=' + lang).then(
        function (success) {
          cityLanding.data = success.data;
          cityLanding.location = cityLanding.city;
          cityLanding.translatedCity = cityLanding.data.city_names[lang] ? cityLanding.data.city_names[lang] : cityLanding.city;
          cityLanding.loading = false;
          cityLanding.allBikes = [];
          cityLanding.lowerCaseCity = cityLanding.data.city.toLowerCase();

          ngMeta.setTitle($translate.instant(cityLanding.data.explore.meta_title));
          ngMeta.setTag("description", $translate.instant(cityLanding.data.explore.meta_description));

          bikeOptions.allCategoriesOptionsSeo().then(function (resolve) {
            cityLanding.categories = resolve.filter(function (item) {
              return item.url;
            });

            _.forEach(cityLanding.data.blocks, function(value) {
              cityLanding.allBikes = cityLanding.allBikes.concat(value.bikes);
              getHumanReadableBikeGroup(value);
              setBtnReference(value, cityLanding.categories);
            });

            // parse url names to data names (change '-' to '_')
            _.forEach(cityLanding.categories, function (item) {
              item.dataName = item.url.replace(/-/i, '_')
            });
          });
           cityLanding.breadcrumbs = [
              {
                title:'Home',
                route: 'home'
              },
              {
                title:  cityLanding.data.breadcrumbs.country,
                route: `countryPage({ country: '${cityLanding.data.country_en}'})`
              },
              {
                title: cityLanding.data.breadcrumbs.city,
                route: `cityLanding({ city: '${$stateParams.city}'})`
              }];

          // TODO: emporary monkeypatch for backend not returning nil values
          if (cityLanding.data.explore.title.startsWith("Main explore title")) {
            cityLanding.data.explore = null;
          }
          if (cityLanding.data.explore.description.startsWith("Example main title")) {
            cityLanding.data.texts = null;
          }
          // End
          if(!cityLanding.mobileScreen) initializeGoogleMap();

          $timeout(function () {
            swiperConfig();
          });
        },
        function (error) {
          $state.go('search', {
            location: cityLanding.city
          });
        }
      );
    }

    function setBtnReference(targetBikesObj, currentCategories) {
      _.filter(currentCategories, function(category) {
        if(category.url === targetBikesObj.key.replace(/_/i, '-')) {
          targetBikesObj.ref = category.url;
        }
      });
    }

    function getHumanReadableBikeGroup(categoryBlock) {
      cityLanding.group[categoryBlock.key] = categoryBlock;
      cityLanding.group[categoryBlock.key].bikes = categoryBlock.bikes.slice(0, cityLanding.bikesToShow);
    }

    // ============================
    // >>>> START MAP FUNCTIONALITY
    // ============================

    function initializeGoogleMap() {
      // without timeout map will take an old array with bikes
      $timeout(function(){
        NgMap.getMap({ id: "searchMap" }).then(function (map) {
          map.fitBounds(correctBounds());
          map.setZoom(map.getZoom());
          initMarkerClusterer(map);
          cityLanding.map = map;
          cityLanding.mapLoading = false;
        });
      }, 0);
    }

    function initMarkerClusterer(map) {
      var markers = cityLanding.allBikes.map(function (bike) {
        return createMarkerForBike(bike, map);
      });

      cityLanding.mapMarkers = markers;

      var mcOptions = {
        styles: mapConfigs.clustersStyle()
      };
      cityLanding.clusterer = new MarkerClusterer(map, markers, mcOptions);
      return cityLanding.clusterer;
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
        position: new google.maps.LatLng(bike.location.lat_rnd, bike.location.lng_rnd),
        id: bike.id,
        icon: image,
        title: Math.ceil(bike.price_from) + '€',
        label: { text: Math.ceil(bike.price_from) + '€', color: "white", fontSize: '13px', fontWeight: 'bold' }
      });

      google.maps.event.addListener(marker, 'click', function () {
        cityLanding.selectedBike = bike;
        map.showInfoWindow('searchMapWindow', this);
      });

      return marker;
    }

    function correctBounds() {
      var bounds = new google.maps.LatLngBounds();
      if (!_.isEmpty(cityLanding.locationBounds)) {
        bounds = extendBounds(bounds, cityLanding.locationBounds.northeast.lat, cityLanding.locationBounds.northeast.lng);
        bounds = extendBounds(bounds, cityLanding.locationBounds.southwest.lat, cityLanding.locationBounds.southwest.lng);
        bounds = extendBounds(bounds, cityLanding.latLng.lat, cityLanding.latLng.lng);
      }

      var i = 0;
      _.forEach(cityLanding.allBikes, function(bike) {
        if (bike.priority == true) return;
        bounds = extendBounds(bounds, bike.location.lat_rnd, bike.location.lng_rnd);
        i++;
        if (i > 3) return false;
      });

      return bounds;
    }

    function extendBounds(bounds, lat, lng) {
      var loc = new google.maps.LatLng(lat, lng);
      bounds.extend(loc);
      return bounds;
    }

    // ============================
    // END MAP FUNCTIONALITY <<<<<<
    // ============================

    cityLanding.placeChanged = function(place) {
      var location = place.formatted_address || place.name;
      $state.go('search', {location: location});
    };

    cityLanding.onSearchClick = function() {
      $state.go('search', {location: cityLanding.location});
    };

    function tileColspan(index) {
      if (index === 0 || index === 4) {
        return 3;
      } else if (index === 3 || index > 4){
        return 2;
      } else {
        return 1;
      }
    }

    function tileRowspan(index) {
      return (index === 1 || index === 2) ? 2 : 1;
    }

    function swiperConfig () {

      cityLanding.bikesList = new Swiper ('#bikes-list', {
        keyboardControl: true,
        loop: true,
        slidesPerView: 1,
        spaceBetween: 20
      });

      cityLanding.brandsSwiper = new Swiper ('#bikes-brands', {
        keyboardControl: true,
        slidesPerView: 4,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          768: {
            slidesPerView: 3
          },
          640: {
            slidesPerView: 2
          }
        }
      });

      if (cityLanding.mobileScreen) cityLanding.brandsSwiper.appendSlide('<div class="swiper-slide"></div>');

      cityLanding.testimonialsSwiper = new Swiper ('#testimonials-slider', {
        slidesPerView: 3,
        spaceBetween: -50,
        keyboardControl: true,
        centeredSlides: true,
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          // when window width is <= 639px
          639: {
            slidesPerView: 1,
            spaceBetween: 10
          }
        }
      });

      cityLanding.tipsSwiper = new Swiper ('#slider-fading', {
        keyboardControl: true,
        centeredSlides: true,
        spaceBetween: 30,
        effect: 'fade',
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        autoplay: {
          delay: 5000
        },
      });

      cityLanding.tipsSwiper.on('slideChange', function () {
        cityLanding.slideIndex = cityLanding.tipsSwiper.activeIndex;
        // update scope one more time
        _.defer(function () {
          $scope.$apply();
        });
      });
    }

    function onSearchClick() {
      $state.go('search', {location: cityLanding.location});
    }
  }
});
