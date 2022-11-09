'use strict';

angular.module('inviteLanding',[]).component('inviteLanding', {
  templateUrl: 'app/modules/invite-landing/invite-landing.template.html',
  controllerAs: 'inviteLanding',
  controller: function InviteLandingController(
    $stateParams,
    $state,
    $translate,
    authentication,
    api,
    ngMeta
  ) {
      const inviteLanding = this;

      inviteLanding.hidden = true;
      inviteLanding.authentication = authentication;
      inviteLanding.inviteCode = $stateParams.inviteCode;

      $translate([
        "invite-landing.meta-title",
        "invite-landing.meta-description"
      ]).then(function (translations) {
        ngMeta.setTitle(translations["invite-landing.meta-title"]);
        ngMeta.setTag("description", translations["invite-landing.meta-description"]);
        ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/lnr_invite_landing.jpg');
      });

      api.get('/referrals/' + inviteLanding.inviteCode).then(
        function (success) {
          inviteLanding.referrer = success.data;
          inviteLanding.picture = inviteLanding.referrer.profile_picture.profile_picture.url;
          inviteLanding.name = success.data.first_name;
          inviteLanding.hidden = false;
        },
        function (error) {
          $state.go("404");
        }
      );

      inviteLanding.showSignup = function() {
        authentication.showSignupDialog(inviteCode);
      }
    }
});
