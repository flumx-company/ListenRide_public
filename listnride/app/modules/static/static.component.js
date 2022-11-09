angular
.module('static', [])
.controller('StaticController', ['$translate', '$translatePartialLoader', 'ENV', function ($translate, $tpl, ENV) {
  $tpl.addPart(ENV.staticTranslation);
}]);