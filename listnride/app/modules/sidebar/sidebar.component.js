angular.module('header').component('sidebar', {
  templateUrl: 'app/modules/sidebar/sidebar.template.html',
  controllerAs: 'sidebar',
  controller: function SidebarController($scope, $mdSidenav, $localStorage, authentication) {
    let sidebar = this;
    sidebar.authentication = authentication;
    sidebar.userId = $localStorage.userId;
    sidebar.isUserBusiness = sidebar.authentication.isBusiness;

    sidebar.toggle = function() {
      $mdSidenav('right').toggle();
    };
  }
});