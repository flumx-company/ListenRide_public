angular
  .module('list')
  .directive('lnrMdMenuFullscreen', ['$window', '$timeout', '$mdMedia', lnrMdMenuFullscreen]);

function lnrMdMenuFullscreen($window, $timeout, $mdMedia) {
  return {
    restrict: "A",
    link: function ($scope, $menu, attrs) {
      var el = angular.element($menu[0].lastChild);
      // attribute 'aria-owns' gives relationship and we can search modal window in this way
      
      $scope.$watch(function () {
        return el.hasClass('md-active');
      }, function (newValue, oldValue) {
        isMenuOpened();        
      });

      var window = angular.element($window);
      window.on('resize', isMenuOpened);
      window.on('orientationchange', isMenuOpened);

      function isMenuOpened(){
        // now we should use javascript setTimeout for check after $diggest
        // note that, don't use angular $timeout it may couse recursive stack
        setTimeout(function () {
          var menuOpened = el.hasClass('md-active');
          if (menuOpened) {
            fitToWindow();
            checkTopPosition();
          }
        }, 0);
      }

      function fitToWindow() {
        if ($mdMedia('xs')) {
          el.css({
            'left' : 0,
            'width': '100vw',
            'max-height' : '100vh',
            'overflow': 'scroll'
          })
        } else {
          setToDefault();
        }
      }

      // if top position less than minimum, we should set our value
      function checkTopPosition() {
        var elPosTop = parseInt(el.css('top')); 
        var minTop = document.querySelector('header').offsetHeight || '60';

        if (elPosTop < minTop) el.css({ 'top': minTop + 'px'});
      }

      function setToDefault() {
        el.css({
          'width': 'auto',
          'height': 'auto'
        })
      }
    }
  }
}
