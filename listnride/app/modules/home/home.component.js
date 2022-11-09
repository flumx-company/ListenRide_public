'use strict';

angular.module('home',[]).component('home', {
  templateUrl: 'app/modules/home/home.template.html',
  controllerAs: 'home',
  controller: function HomeController(
    $state,
    $stateParams,
    $translate,
    $localStorage,
    $mdMedia,
    $mdDialog,
    $mdToast,
    verification,
    authentication,
    api,
    notification
  ) {

      var home = this;

      switch ($state.current.name) {
        case 'authorise3d':
          var authorise3dDialogController = function () {
            var authorise3dDialog = this;
            authorise3dDialog.succeed = $stateParams.succeed == 'true';
            authorise3dDialog.titleColor = authorise3dDialog.succeed ? '' : 'lnr-color-red'
            authorise3dDialog.request_link = '/requests/?requestId=' + $stateParams.requestId;

            authorise3dDialog.hide = function () {
              $mdDialog.hide();
            };
          };

          $mdDialog.show({
            controller: authorise3dDialogController,
            controllerAs: 'authorise3dDialog',
            template:
            '<md-dialog class="lnr-authorise3d">' +
            '  <md-dialog-content class="md-dialog-content lnr-mh-x2">' +
            '   <h2 class="md-title lnr-mv-x2" ng-class="authorise3dDialog.titleColor">' +
            '     {{ authorise3dDialog.succeed ? "toasts.request-created" : "toasts.request-failed" | translate }}' +
            '   </h2>' +
            '   <p class="lnr-mv-x2">' +
            '     {{ authorise3dDialog.succeed ? "toasts.request-create-rider" : "toasts.request-failed-rider" | translate }}' +
            '   </p>' +
            '   <a href="{{ authorise3dDialog.request_link }}" ng-click="authorise3dDialog.hide()" class="lnr-mv-x2 md-button md-raised md-primary">' +
            '     {{ "toasts.btns.go-to-request" | translate }}' +
            '   </a>' +
            '  </md-dialog-content>' +
            '</md-dialog>',
            parent: angular.element(document.body),
            clickOutsideToClose: true
          });

          break;
        case 'verify':
          if (authentication.loggedIn()) {
            verification.openDialog(false, false, window.event);
          }
          break;
        case 'businessSignup':
          authentication.showSignupDialog(false, false, window.event, true);
          break;
        case 'change_password':
          var updatePasswordDialogController = function () {
            var updatePasswordDialog = this;

            updatePasswordDialog.hide = function () {
              $mdDialog.hide();
            };

            updatePasswordDialog.update = function () {
              if (updatePasswordDialog.new_password === updatePasswordDialog.confirm_password) {
                updatePassword(updatePasswordDialog.new_password);
              } else {
                notification.show(null, null, 'toasts.password-not-match');
              }
            };
          };

          var showUpdatePasswordDialog = function() {
            $mdDialog.show({
              controller: updatePasswordDialogController,
              controllerAs: 'updatePasswordDialog',
              templateUrl: 'app/services/authentication/updatePasswordDialog.template.html',
              parent: angular.element(document.body),
              openFrom: angular.element(document.body),
              closeTo: angular.element(document.body),
              clickOutsideToClose: false,
              fullscreen: true
            });
          };

          showUpdatePasswordDialog();

          var updatePassword = function(password){
            var password_data = {
              user_id: $stateParams.userId,
              token: $stateParams.passwordChangeToken,
              password: password
            };

            api.post('/change_password', password_data).then(
              function (success) {
                $translate(['toasts.change-password-success', 'toasts.change-successful']).then(
                  function (translations) {
                    $mdDialog.show(
                      $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(true)
                        .title(translations['toasts.change-successful'])
                        .textContent(translations['toasts.change-password-success'])
                        .ariaLabel(translations['toasts.change-successful'])
                        .ok('Ok')
                    );
                  }
                );
              },
              function (error) {
                notification.show(error, 'error');
              }
            );
          };
          break;

        case 'confirm':
          $mdDialog.show({
            templateUrl: 'app/modules/shared/dialogs/spinner.template.html',
            parent: angular.element(document.body),
            targetEvent: window.event,
            openFrom: angular.element(document.body),
            closeTo: angular.element(document.body),
            clickOutsideToClose: false,
            escapeToClose: false
          });

          var data = {
            confirmation: {
              user_id: $stateParams.userId,
              email_confirmation_token: $stateParams.confirmationCode
            }
          };

          api.post('/confirm_email', data).then(
            function (success) {
              $translate(['toasts.confirmation-successful', 'toasts.confirm-email-success']).then(
                function (translations) {
                  $mdDialog.show(
                    $mdDialog.alert()
                      .parent(angular.element(document.body))
                      .clickOutsideToClose(true)
                      .title(translations['toasts.confirmation-successful'])
                      .textContent(translations['toasts.confirm-email-success'])
                      .ariaLabel(translations['toasts.confirmation-successful'])
                      .ok('Ok')
                  );
                }
              );
            },
            function (error) {
              notification.show(error, 'error');
            }
          );
         break;

        default:
          break;
      }


      // Pick a random hero shot and select
      function pickRandomHeroshot() {
        var isMobile = !!($mdMedia('xs') || $mdMedia('sm'))
        var heroShotId = Math.floor(Math.random() * Math.floor(4)) + 1;
        var pictureName = isMobile ? "lnr_hero_small_" : "lnr_hero_";

        home.heroShotUrl = "app/assets/ui_images/hero/" + pictureName + heroShotId + ".jpg";
      }
      pickRandomHeroshot();

      api.get("/featured").then(function(response) {
        home.featuredBikes = response.data.slice(0,6);
      });

      home.slickConfig = {
        enabled: true,
        autoplay: true,
        draggable: true,
        autoplaySpeed: 12000,
        ease: 'ease-in-out',
        speed: '500',
        prevArrow: "<img class='testimonials-prev-arrow slick-prev' src='app/assets/ui_images/back.png'>",
        nextArrow: "<img class='testimonials-prev-arrow slick-next' src='app/assets/ui_images/next.png'>"
      };

      $translate('shared.from-place').then(function(translation) {
        home.testimonials = [
          {
            userId: 1090,
            userName: "- Jetske " + translation + " Amsterdam",
            userImagePath: "app/assets/ui_images/testmonials/jetske_amsterdam.jpg",
            translationKey: "testimonials.jetske-amsterdam"
          },
          {
            userId: 1203,
            userName: "- John " + translation + " Potsdam",
            userImagePath: "app/assets/ui_images/testmonials/john_potsdam.jpg",
            translationKey: "testimonials.john-potsdam"
          },
          {
            userId: 1739,
            userName: "- Cornelia " + translation + " Basel",
            userImagePath: "app/assets/ui_images/testmonials/cornelia_basel.jpg",
            translationKey: "testimonials.cornelia-basel"
          }
        ];
      });

      home.placeChanged = function(place) {
        var location = place.formatted_address || place.name;
        $state.go('search', {location: location});
      };

      home.onSearchClick = function() {
        $state.go('search', {location: home.location});
      };

      home.newsletterSubmit = function() {
      }
    }
});
