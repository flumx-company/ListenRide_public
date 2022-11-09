'use strict';

angular.module('jobs', [])
  .component('jobs', {
    templateUrl: 'app/modules/jobs/jobs.template.html',
    controllerAs: 'jobs',
    controller: ['$translatePartialLoader', '$state', '$location', '$stateParams', 'api', 'ENV',
      function JobsController($tpl, $state, $location, $stateParams, api, ENV) {

        var jobs = this;
        $tpl.addPart(ENV.staticTranslation);

        jobs.$onInit =  function () {
          // variables
          jobs.showJobDetails = false;
          jobs.chosenJob = {};
          jobs.positionId = $stateParams.position;

          // methods
          jobs.showDetails = showDetails;
          jobs.hideDetails = hideDetails;

          // invocations
          getJobsData();
        };

        function showDetails(job) {
          jobs.showJobDetails = true;
          jobs.chosenJob = job;
          // goToTop();
        }

        function hideDetails() {
          jobs.showJobDetails = false;
          jobs.chosenJob = {};

          $state.go(
            $state.current,
            {position: ''},
            { notify: false }
          );
        }

        function getJobsData() {
          api.get('/jobs/').then(function (response) {
            jobs.availableJobs = response.data;

            if (jobs.positionId) {
              var job = _.find(jobs.availableJobs, ['id', _.toInteger(jobs.positionId)]);
              jobs.showDetails(job);
            }
          }, function (error) {

          });
        }

        /**
         * move the scroll to the job posts
         * this is to avoid showing the image
         * and directly show the postings
         */
        function goToTop() {
          // id of the div where to move the scroller
          var newHash = 'jobs-details';
          // move the scroller to the div
          $location.hash() !== newHash ? $location.hash('jobs-details') : $anchorScroll();
        }
      }
    ]
  });
