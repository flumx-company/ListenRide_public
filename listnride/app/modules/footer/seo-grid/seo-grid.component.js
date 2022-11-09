angular.module('seoGrid', []).component('seoGrid', {
  templateUrl: 'app/modules/footer/seo-grid/seo-grid.template.html',
  controllerAs: 'seoGrid',
  controller: [
    '$scope',
    '$translate',
    function SeoGridController($scope, $translate) {
      var seoGrid = this;

      // Here the SEO locations / countries can be dynamically defined
      seoGrid.countries = [
        { name: "Germany", locations: ["Berlin", "Hamburg", "Dusseldorf", "Munich", "Stuttgart", "Dresden", "Bremen", "Frankfurt"]},
        { name: "Italy", locations: ["Florence", "Bologna", "Milan", "Turin", "Olbia", "Palermo", "Rome"]},
        { name: "Spain", locations: ["Seville", "Barcelona", "Madrid", "Mallorca", "Lanzarote", "Tenerife", "Gran Canaria", "Valencia"]},
        { name: "Netherlands", locations: ["Amsterdam", "Utrecht"]},
        { name: "Switzerland", locations: ["Zurich"]}
        ]
    }
  ]
});
