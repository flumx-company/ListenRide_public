'use strict';

angular.module('user',[]).component('user', {
  templateUrl: 'app/modules/user/user.template.html',
  controllerAs: 'user',
  controller: ['$localStorage', '$state', '$stateParams', '$translate','$mdDialog', '$rootScope', '$window', 'ngMeta', 'api', '$mdMedia', 'notification',
    function ProfileController($localStorage, $state, $stateParams, $translate, $mdDialog, $rootScope, $window, ngMeta, api, $mdMedia, notification) {
      var user = this;
      user.hours = {};
      user.weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      user.loaded = false;
      user.current_payment = false;
      user.display_name = '';
      user.picture = '';
      user.mobileScreen = $mdMedia('xs');
      var mobileBikeColumns = 3;
      var desktopBikeColumns = 6;
      user.bikesToShow = user.mobileScreen ? mobileBikeColumns : desktopBikeColumns;
      user.showAllBikes = false;

      user.closedDay = closedDay;
      user.loadAllBikes = loadAllBikes;

      var userId;
      $stateParams.userId? userId = $stateParams.userId : userId = 1930;

      var getAccessToken = function (clientId) {
        return api.post('/oauth/token_for', {user_id: clientId}).then(function (response) {
          return response.data;
        }, function(error){
          notification.show(error, 'error');
        });
      };

      //FIXME: Code duplication
      // START >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      var setAccessToken = function (data) {
        $localStorage.accessToken = data.access_token;
        $localStorage.tokenType = data.token_type;
        $localStorage.expiresIn = data.expires_in;
        $localStorage.refreshToken = data.refresh_token;
        $localStorage.createdAt = data.created_at;
      };

      var setCredentials = function (response) {
        $localStorage.userId = response.id;
        $localStorage.name = response.first_name + " " + response.last_name;
        $localStorage.firstName = response.first_name;
        $localStorage.lastName = response.last_name;
        $localStorage.profilePicture = response.profile_picture.profile_picture.url;
        $localStorage.unreadMessages = response.unread_messages;
        $localStorage.email = response.email;
        $localStorage.referenceCode = response.ref_code;
        $localStorage.isBusiness = !!response.business;
      };

      var showLoginSuccess = function() {
        $mdDialog.hide();
        notification.show(null, null, 'toasts.successfully-logged-in');
      };

      // END <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

      api.get('/users/' + userId).then(
        function(response) {
          user.showAll = false;
          user.user = response.data;
          if (!user.user.me) user.user.me = {};
          user.user.me.id = $localStorage.userId ? $localStorage.userId : '';
          user.loaded = true;
          user.anyHours = !_.isEmpty(response.data.opening_hours);
          user.openingHours = user.anyHours ? response.data.opening_hours.hours : {};
          user.openingHoursEnabled = showHours(response.data.opening_hours);
          user.rating = (user.user.rating_lister + user.user.rating_rider);

          user.display_name = setName();
          user.picture = setPicture();

          user.current_payment = response.data.current_payment;
          if (user.user.rating_lister != 0 && user.user.rating_rider != 0) {
            user.rating = user.rating / 2;
          }

          user.bikes = user.user.rides.slice(0, user.bikesToShow);

          user.rating = Math.round(user.rating);
          if (user.openingHoursEnabled) setOpeningHours();

          generateMetaDescription(user.user.has_business);

        },
        function(error) {
          $state.go('404');
        }
      );

      user.stealSession = function () {
        getAccessToken(user.user.id).then(function (successTokenData) {
          setAccessToken(successTokenData);
          api.get('/users/me').then(function (success) {
              setCredentials(success.data);
              $rootScope.$broadcast('user_login');
              showLoginSuccess();
              $window.location.reload();
            },
            function(error){
              notification.show(error, 'error');
            });
        });
      };

      function showHours(hours) {
        if (!user.anyHours) return false;
        if (hours.enabled) {
          return hours.enabled
        } else {
          return true
        }
      }

      function loadAllBikes() {
        user.showAllBikes = true;
        user.bikes = user.user.rides;
      }

      function generateMetaDescription(isCompany) {
        var title = isCompany ? "user.company-meta-title" : "user.meta-title";
        var description = isCompany ? "user.company-meta-description" : "user.meta-description";
        var params = isCompany ? { company: $translate.instant('shared.local-business') } : { name: user.user.first_name };

        $translate([title, description] , params)
          .then(function(translations) {
            ngMeta.setTitle(translations[title]);
            ngMeta.setTag("description", translations[description]);
          });
      }

      function setName() {
        if (user.user.has_business) {
           if (userId !== $localStorage.userId) {
             return $translate.instant('shared.local-business')
           } else {
             return user.user.business.company_name
           }
        } else {
          return user.user.first_name
        }
      }

      function setPicture() {
        if (user.user.has_business && userId !== $localStorage.userId) {
          return 'app/assets/ui_icons/lnr_shop_avatar.svg'
        } else {
          return user.user.profile_picture.profile_picture.url
        }
      }

      function setOpeningHours() {
        if (!user.anyHours) return;
        cookHours();
        compactHours();
        compactDays();
      }

      function cookHours() {
        _.each(user.weekDays, function (day, key) {
          var weekDay = user.openingHours[key];
          var dayRange = [];
          if (_.isEmpty(weekDay)) dayRange = [{'closed': true}];
          _.each(weekDay, function (range, key) {
            dayRange.push({
              'closed': false,
              'start_at': range.start_at / 3600,
              'end_at': (range.start_at + range.duration) / 3600
            })
          });
          user.hours[day] = dayRange;
        });
      }

      function compactHours() {
        var dayName = '', currentDay = {}, prevDay = {}, shortenHours = {};

        _.each(user.weekDays, function (day) {
          currentDay = user.hours[day];

          if (_.isEqual(currentDay, prevDay) && currentDay !== user.hours['Mon']) {
            if (!_.isEmpty(shortenHours[dayName])) delete shortenHours[dayName];
            dayName = dayName + ', ' + $translate.instant('shared.' + day);
            shortenHours[dayName] = currentDay;
          } else {
            dayName = $translate.instant('shared.' + day);
            shortenHours[dayName] = currentDay;
            prevDay = currentDay;
          }
        });
        user.hours = shortenHours;
      }

      function compactDays() {
        var ranges = [];
        var hours = {};
        _.each(_.keys(user.hours), function (daysRange) {
          var d = daysRange.split(', ');
          if (d.length > 1) {
            var rangeDays = d[0] + ' - ' +  d[d.length-1];
            ranges.push(rangeDays);
            hours[rangeDays] = user.hours[daysRange];
          } else {
            var rangeDay = d[0];
            ranges.push(rangeDay);
            hours[rangeDay] = user.hours[rangeDay];
          }
        });
        user.weekDays = ranges;
        user.hours = hours;
      }

      function closedDay(range) {
        if (range.closed) return true
      }
    }
  ]
});
