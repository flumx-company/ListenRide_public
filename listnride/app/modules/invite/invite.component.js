'use strict';

angular.module('invite', []).component('invite', {
  templateUrl: 'app/modules/invite/invite.template.html',
  controllerAs: 'invite',
  controller: [
    'api',
    '$localStorage',
    '$translate',
    'ngMeta',
    function InviteController(api, $localStorage, $translate, ngMeta) {
      var invite = this;

      $translate(["invite.meta-title", "invite.meta-description"])
      .then(function (translations) {
        ngMeta.setTitle(translations["invite.meta-title"]);
        ngMeta.setTag("description", translations["invite.meta-description"]);
      });

      api.get("/users/" + $localStorage.userId + "/overview ").then(function(response) {
        invite.invitedFriends = response.data.friends;
        invite.inviteUrl = "http://www.listnride.com/invitation/" + response.data.author.ref_code;
        var activeFriends = invite.invitedFriends.filter(function(invitation) {
          return invitation.status == 2 || invitation.status == 3;
        });
        invite.totalCredit = activeFriends.length * 10;
      });
    }
  ]
});
