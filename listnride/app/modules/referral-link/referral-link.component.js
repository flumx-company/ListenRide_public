'use strict';

angular.module('invite').component('referralLink', {
  templateUrl: 'app/modules/referral-link/referral-link.template.html',
  controllerAs: 'referral',
  bindings: {
    header: '<',
    subHeader: '<',
    showLogin: '<'
  },
  controller: [
    '$localStorage',
    '$translate',
    'Socialshare',
    'authentication',
    function ReferralLinkController($localStorage, $translate, Socialshare, authentication) {
      var referral = this;
      referral.authentication = authentication;
      referral.inviteUrl = "www.listnride.com/invitation?inviteCode=" + $localStorage.referenceCode;

      $translate('invite.invite-form.copy').then(
        function (translation) {
          referral.buttonLabel = translation;
        }
      );

      referral.copyToClipboard = function () {
        document.getElementById("linkContainer").select();
        document.execCommand('copy');
        referral.buttonLabel = $translate.instant('invite.invite-form.copied');
      };

      referral.shareThroughFacebook = function () {
        Socialshare.share({
          'provider': 'facebook',
          'attrs': {
            'socialshareUrl': referral.inviteUrl,
            'socialshareTitle': "testtitel",
            'socialshareDescription': "Description",
            'socialsharePopupHeight': 600,
            'socialsharePopupWidth': 400
          }
        });
      };

      referral.shareThroughEmail = function () {
        var userFullName = $localStorage.name;
        var voucherUrl = referral.inviteUrl;
        var firstName = $localStorage.firstName;
        $translate(
          ["invite.share.email-subject", "invite.share.email-body"],
          {full_name: userFullName, voucher_url: voucherUrl, first_name: firstName})
        .then(function (translations) {
          var subject = translations["invite.share.email-subject"];
          var body = translations["invite.share.email-body"];
          window.open("mailto:".concat("?subject=", subject, "&body=", body), "_self");
        })
      };
    }]
});
