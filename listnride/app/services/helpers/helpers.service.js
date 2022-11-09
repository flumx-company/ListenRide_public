'use strict';

angular
  .module('listnride')
  .factory('helpers', [
    helpersController
  ]);

function helpersController() {
  return {
    lowerCaseFilenameExtension : function(filename){
      filename = filename.split('.');
      var extension = filename.pop().toLowerCase();
      filename.push(extension);
      return filename.join('.');
    }
  }
}