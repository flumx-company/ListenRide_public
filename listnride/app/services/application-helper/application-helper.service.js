angular
  .module('listnride')
  .factory('applicationHelper', function(){

    return {
      emailPattern: /(?!^[.+&'_-]*@.*$)(^[_\w\d+&'-]+(\.[_\w\d+&'-]*)*@[\w\d-]+(\.[\w\d-]+)*\.(([\d]{1,3})|([\w]{2,}))$)/i,
      phonePattern: /^\+(?:[0-9] ?){6,14}[0-9]$/,
      defaultProfilePicture: "https://s3.eu-central-1.amazonaws.com/listnride/assets/default_profile_picture.jpg"
    }
  });