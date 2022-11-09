// Add focus for next input
angular.module('list').directive('lnrFocus', function() {
  return {
    restrict: "A",
    link: function($scope, element) {
      element.on("keyup", function(e) {
        var input = element.find('input');
        var key = e.keyCode || e.charCode;

        if(input[0].value.length == input.attr("maxlength")) {
          var $nextElement = element.next();
          if ($nextElement.length) {
            $nextElement.find('input').focus();
          }
        }

        if (key === 8 || key === 46) {
          var $prevElement = element.prev();
          $prevElement.find('input').focus();
        }
      });

      element.on("paste", function(e) {
        var inputs = element.parent().find('input');
        // Get clipboard data for all browsers
        var clipboardData = e.clipboardData || e.originalEvent.clipboardData || window.clipboardData;
        var data = clipboardData.getData('text/plain');

        if (!_.isNaN(Number(data))) {
          var numbers = data.split('');
          _.forEach(inputs, function(input, idx) {
            input.focus();
            input.value = numbers[idx];
            $(input).trigger('change');
          });
        }

        e.preventDefault();
      });
    }
  }
});
