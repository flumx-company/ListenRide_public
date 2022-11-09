(function(){
'use strict';
angular.
module('listnride').
config(['$mdThemingProvider',
  function($mdThemingProvider) {
    $mdThemingProvider.definePalette('lnr-blue', {
      '50': '#ffffff',
      '100': '#ffffff',
      '200': '#f8fbff',
      '300': '#b4d4fb',
      '400': '#97c3fa',
      '500': '#7ab2f8',
      '600': '#5da1f6',
      '700': '#4090f5',
      '800': '#237ff3',
      '900': '#0c6feb',
      'A100': '#ffffff',
      'A200': '#7ab2f8',
      'A400': '#97c3fa',
      'A700': '#4090f5',
      'contrastDefaultColor': 'light',
      'contrastDarkColors': '50 100 200 300 A100 A400 A700'
    });

    $mdThemingProvider.definePalette('lnr-green', {
      '50': '#ffffff',
      '100': '#eaf8f1',
      '200': '#c1e9d5',
      '300': '#8cd6b1',
      '400': '#76cea2',
      '500': '#5fc693',
      '600': '#48be84',
      '700': '#3dab74',
      '800': '#359465',
      '900': '#2d7e56',
      'A100': '#ffffff',
      'A200': '#eaf8f1',
      'A400': '#76cea2',
      'A700': '#3dab74',
      'contrastDefaultColor': 'light',
      'contrastDarkColors': '50 100 200 300 A100 A200 A400 A700'
    });

    $mdThemingProvider.definePalette('lnr-background', $mdThemingProvider.extendPalette('grey', {
      '50': '#ffffff',
      'A400': '#343940'
    }));

    var DARK_FOREGROUND = {
      name: 'dark',
      '1': 'rgba(85,85,85,1.0)',
      '2': 'rgba(68,68,68,1.0)',
      '3': 'rgba(225,230,230,1.0)',
      '4': 'rgba(206,212,216,0.9)'
    };

    $mdThemingProvider.theme('default')
      .primaryPalette('lnr-green')
      .accentPalette('lnr-blue')
      .backgroundPalette('lnr-background')
      .foregroundPalette = DARK_FOREGROUND;

    $mdThemingProvider.theme('lnr-dark')
      .backgroundPalette('lnr-background')
      .dark().foregroundPalette['3'] ='rgba(255,255,255,0.12)';
  }
]);
})();