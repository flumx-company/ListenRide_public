'use strict';

angular.module('listnride')
  .factory('bikeHelper', function (api) {

    const insuranceCountries = ['DE', 'AT'];

    const getBikeEditUrl = bike => bike.is_cluster ? '/clusters/' + bike.cluster_id + '/update_rides/' : '/rides/' + bike.id;

    const changeBikeAvailableTo = (bike, changeTo) => {
      let data = {
        "ride": {
          "id": bike.id,
          "available": changeTo
        }
      }
      return api.put(getBikeEditUrl(bike), data);
    }
    const createBikeAvailability = ({id, isCluster, data}) => {
      const availabilityUrl = `${isCluster ? '/clusters' : '/rides'}/${id}/availabilities`;
      data = { 'availabilities': [...data] };

      return api.post(availabilityUrl, data);
    }
    const removeBikeAvailability = (id, availabilityId) => {
      return api.delete(`/rides/${id}/availabilities/${availabilityId}`)
    }
    const isBikeCountryInsuranced = (bike) => _.includes(insuranceCountries, bike.country_code);

    return {
      changeBikeAvailableTo,
      getBikeEditUrl,
      createBikeAvailability,
      removeBikeAvailability,
      isBikeCountryInsuranced
    };
  });
