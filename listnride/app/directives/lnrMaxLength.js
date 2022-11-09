// Do not allow to enter more digits than in max length
angular.module('list').directive('lnrMaxLength', function() {
  return {
    restrict: "A",
    link: function($scope, element) {
      element.on("input", function(e) {
        var input = element[0];
        input.value = input.value.replace(/[^0-9.]/g, '');
        input.value = input.value.replace(/(\..*)\./g, '$1');
      });

      element.on("keydown", function(e) {
        if(element[0].value.length == element.attr("maxlength") && e.keyCode !=8) return false;
      });
    }
  }
});
