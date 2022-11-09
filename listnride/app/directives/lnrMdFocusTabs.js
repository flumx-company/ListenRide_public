angular
  .module('list')
  .directive('lnrMdFocusTabs', ['$window','$timeout',lnrMdFocusTabs]);
  
function lnrMdFocusTabs($window, $timeout) {
  return {
    restrict: "A",
    link: function ($scope, $tabs, attrs) {
      var tabBox = $tabs.find('md-tabs-wrapper');
      var tabViewWrapper = $tabs.find('md-pagination-wrapper');
      var activeTab;
      var currentLeftOffset;
      var newValue;
      var selectedIndex;

      $tabs.addClass('lnr-md-focus-tabs');

      // helper function to calc dom element offset().right
      // if element is not defined - returns false;
      function _offsetRight(el) {
        return el.length ? el.offset().left + el.outerWidth() : false;
      }

      $scope.$watch(attrs.lnrMdFocusTabs, function (value) {
        selectedIndex = value;
        changeFocus();
      });

      // Using Observer to check when tabs is fully loaded and we can use their attr
      var config = { subtree: true, attributes: true, childList: false, characterData: false };
      var observer = new MutationObserver(function (mutations) {
        var observerHandle = _.debounce(changeFocus, 100);
        mutations.forEach(function (mutation) {
          observerHandle();
        });
      });
      observer.observe(tabViewWrapper[0], config);

      // reset and recalc tabs leftOffset
      jQuery(window).on('resize', _.debounce(function(){
        tabViewWrapper.css({'left': 0});
        changeFocus();
      }, 150));

      /**
       * Scroll to active tab
       * When tab focus is changed, active tab may be not visible on the screen
       * @TODO: also add focus if active element's offet().left not on a view
       */
      function changeFocus () {
        // wait for any tabs
        if (!$tabs.find('md-tab-item').length) return;

        activeTab = $tabs.find('md-tab-item').eq(selectedIndex);
        // wait until active tab will be selected and appear on the screen 
        if (!activeTab.outerWidth()) return;

        currentLeftOffset = parseInt(tabViewWrapper.css('left'));
        
        // check if active tab right and left offset are visible in viewport
        if (tabBox.width() + tabBox.offset().left < _offsetRight(activeTab)) {
          newValue = Math.round(tabBox.width() + tabBox.offset().left - _offsetRight(activeTab) + currentLeftOffset);  
        } else if (activeTab.offset().left < tabBox.offset().left ) {
          newValue = Math.round(activeTab.offset().left - currentLeftOffset);
        } else {
          return false;
        }

        // if it's not a first/last tab - add some pixels to see next tab's label
        if (selectedIndex !== $tabs.find('md-tab-item').length - 1 && selectedIndex !== 0) {
          newValue -= 60;
        }

        // if it's no difference, we should skip dom manipulation
        if (currentLeftOffset == newValue) return;

        // @TODO: find a way to change public properties in mdTabs controller
        // It rewrites transform on offsetLeft change
        // so we use left insead of transform
        tabViewWrapper.css({
          'left': newValue + 'px'
          // '-webkit-transform:': 'translate3d(' + newValue + 'px' + ', 0, 0)',
          // 'transform': 'translate3d(' + newValue + 'px' + ', 0, 0)'
        });
        observer.disconnect();
      }
    }
  }
}
