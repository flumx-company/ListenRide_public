angular.module('lnrMetaRobots', [])
.directive('lnrMetaRobots', function() {
  return {
    restrict: "EA",
    replace: true,
    template: '<meta name="robots" content="noindex"/>'
  };
});