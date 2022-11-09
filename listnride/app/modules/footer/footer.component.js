angular.module('footer',['pascalprecht.translate']).component('footer', {
  templateUrl: 'app/modules/footer/footer.template.html',
  controllerAs: 'footer',
  controller: function FooterController(
    $scope,
    $window,
    $location,
    $localStorage,
    $translate,
    $stateParams,
    api,
    applicationHelper,
    notification
  ) {
      const footer = this;

      // variables
      footer.hideFooter = $stateParams.hideFooter;
      footer.year = moment().year();
      footer.language = getLanguage($translate.preferredLanguage());
      footer.emailPattern = applicationHelper.emailPattern;

      // methods
      footer.onNewsletterSubmit = onNewsletterSubmit;

      $scope.$watch(
        function() { return $stateParams.hideFooter; },
        function(newValue, oldValue) {
          if ( newValue !== oldValue ) {
            footer.hideFooter = newValue;
          }
        }
      );

      // TODO: wrap to function expression
      // TODO: check do we need an url here
      var url = "";
      var host = $location.host().split('.');
      if (host[host.length - 1] === "localhost") {
        url = "localhost:8080/#";
      } else {
        for (var i = 1; i < host.length; i ++) {
          url += host[i];
          if (i < host.length - 1) {
            url += ".";
          }
        }
      }



      // switch url based on language
      footer.switchDomain = function (language) {
        var url = window.location.host.split('.'), route = window.location.pathname, root = '';
        // using localhost
        if (url.indexOf("localhost") >= 0 || url[0].match('localhost')) {
          $scope.$emit('$translatePartialLoaderStructureChanged');
          $window.location.reload();
        }
        // staging or production
        else {
          url.splice(-1).join('.');
          if (language == 'nl' || language == 'de' || language == 'it' || language == 'es' || language == 'fr') {
            url = url.join('.');
            root = [url, language].join('.');
            window.location = 'https://' + root + route;
          } else {
            url = url.join('.');
            root = [url, 'com'].join('.');
            window.location = 'https://' + root + route;
          }
        }
      };

      // switch url based on language
      footer.switchLanguage = function (locale) {
        // save language in local storage
        // switch to correct language specific domain
        $localStorage.selectedLanguage = locale;
        footer.switchDomain($localStorage.selectedLanguage);
      };

      footer.onAppClick = function() {
        $window.open('https://itunes.apple.com/de/app/list-n-ride/id992114091?l=' + $translate.use(), '_blank');
      };

      function getLanguage(locale) {
        switch (locale) {
          case 'de': return 'footer.languages.german';
          case 'nl': return 'footer.languages.dutch';
          case 'it': return 'footer.languages.italian';
          case 'es': return 'footer.languages.spanish';
          case 'fr': return 'footer.languages.french';
          case 'en':
          default: return 'footer.languages.english';
        }
      }

      function onNewsletterSubmit() {
        if (!footer.email) return;
        api.post(`/subscribe?email=${footer.email}`, {})
          .then((success) => {
            notification.show(success, null, success.data.message);
            footer.email = '';

            $scope.footerSubscribe.$setPristine();
            $scope.footerSubscribe.$setUntouched();
            $scope.footerSubscribe.$submitted = false;

          }, (error) => {
            notification.show(error, null, error.data.message);
          })
      }
    }
});
