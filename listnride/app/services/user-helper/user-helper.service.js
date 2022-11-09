'use strict';

angular
  .module('listnride')
  .factory('userHelper', function (
    api
  ) {

    let hasTimeSlots = (userData) => _.has(userData, 'business.time_slots');
    let insuranceEnabled = (userData) => (userData.has_business || userData.business) ? _.get(userData, 'business.insurance_enabled') : true;
    let getTimeSlots = (userData) => _.get(userData, 'business.time_slots');
    let getUser = (userId) => api.get('/users/' + userId);

    return {
      hasTimeSlots,
      insuranceEnabled,
      getTimeSlots,
      getUser
    };
  });
