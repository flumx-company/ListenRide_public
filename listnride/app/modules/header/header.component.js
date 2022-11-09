'use strict';

angular.module('header',[]).component('header', {
  templateUrl: 'app/modules/header/header.template.html',
  controllerAs: 'header',
  controller: function HeaderController($transitions, $state, $mdSidenav, $mdMedia, $localStorage, $stateParams, $scope, api, authentication, verification, ENV) {
    var header = this;
    var mobileSearch = false;
    header.authentication = authentication;
    header.verification = verification;
    header.name = $localStorage.name;
    header.userId = $localStorage.userId;
    header.inviteCode = $stateParams.inviteCode;
    header.showSearch = false;
    // Contains the amount of unread messages to be displayed in the header
    header.unreadMessages = $localStorage.unreadMessages;
    header.isStaging = ENV.apiEndpoint !== "https://api.listnride.com/v2";
    header.isUserBusiness = header.authentication.isBusiness;

    header.$onInit = function(){
      header.showSearch = $state.current.name !== 'home';
    };

    //get state params hideHeader value when it's available
    setTimeout(function () {
      header.hideHeader = $state.params.hideHeader;
    }, 0);

    $transitions.onSuccess({}, function(transition) {
      if (transition.to().name === "search") {
        header.location = $stateParams.location;
        header.showSearch = true;
      }
      else if (transition.to().name === "home") {
        header.location = "";
        header.showSearch = false;
      } else {
        header.showSearch = true;
      }
    });

    header.search = function(place) {
      var location = place.formatted_address || place.name;
      $state.go('search', {location: location}, {reload: false});
    };

    header.toggleSidebar = function() {
      $mdSidenav('right').toggle();
    }

    header.toggleSearch = function() {
      mobileSearch = !mobileSearch;
    }

    header.hideSearch = function() {
      if ($mdMedia('xs')) {
        return !mobileSearch;
      } else {
        return false;
      }
    }

    header.hideLogo = function() {
      if ($mdMedia('xs')) {
        return !mobileSearch;
      } else {
        return true;
      }
    }

  }
});
