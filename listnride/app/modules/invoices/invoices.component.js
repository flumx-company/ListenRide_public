'use strict';

angular.module('invoices',[]).component('invoices', {
    templateUrl: 'app/modules/invoices/invoices.template.html',
    controllerAs: 'invoices',
    controller: ['$localStorage', 'api', 'accessControl', '$translate', '$window',
      function InvoicesController($localStorage, api, accessControl, $translate, $window) {
        if (accessControl.requireLogin()) { return }

        var invoices = this;
        invoices.ridesAsRiderAny = true;
        invoices.loadingRequests = true;
        invoices.filtersType = 'lister';

        api.get('/users/' + $localStorage.userId + "/reports").then(
          function(response) {
            invoices.asLister = response.data.as_lister;
            invoices.settlementHistory = response.data.settlement;
            invoices.asRider = response.data.as_rider;
            invoices.yearsRider = Object.keys(invoices.asRider).reverse();
            invoices.yearsLister = Object.keys(invoices.asLister).reverse();
            invoices.yearsSettlement = Object.keys(invoices.settlementHistory).reverse();
            invoices.ridesAny('rider');
            invoices.ridesAny('lister');
            invoices.loadingRequests = false;
          },
          function(error) {
            invoices.loadingRequests = false;
          }
        );

        invoices.parseDate = function (date) {
          return moment(date).locale('de').format('L');
        };

        invoices.parseAmount = function (amount) {
          var formatter = new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
          });

          return formatter.format(amount);
        };

        invoices.getCsv = function (target) {
          var fileName = 'Billings as ' + target + ' ' + moment().format('MMMM Do YYYY') + '.csv';
            api.get('/users/' + $localStorage.userId + "/transactions?target=" + target, 'blob').then(
              function(response) {
                downloadAttachment(fileName, response.data, 'application/csv');
              },
              function(error) {
              }
            );
        };

        invoices.getSettlementCsv = function (batchId) {
          var fileName = 'settlement_detail_report_batch_' + batchId + '.csv';
          api.get('/users/' + $localStorage.userId + "/batches/" + batchId, 'blob').then(
            function(response) {
              downloadAttachment(fileName, response.data, 'application/csv');
            },
            function(error) {
            }
          );
        };

        invoices.getPdf = function(id, target) {
          invoices.loadingRequests = true;
          var title = target === 'lister' ? 'Credit note' : 'Invoice';
          var fileName = title + ' ' + id + ' ' + moment().format('MMMM Do YYYY') + '.pdf';
          api.get('/users/' + $localStorage.userId + '/invoices/' + id + '?target=' + target, 'blob').then(
          function (result) {
            downloadAttachment(fileName, result.data, 'application/pdf');
            invoices.loadingRequests = false;
          },
          function(error) {
            invoices.loadingRequests = false;
          });
        };

        invoices.getDateFormat = function(date){
          return moment(date).format('YYYY MM DD');
        };

        invoices.getTotal = function (arr) {
          return arr.reduce((accumulator,currentValue) => accumulator + currentValue.amount, 0)
        };

        function downloadAttachment(fileName, data, type) {
          var a = document.createElement('a');
          document.body.appendChild(a);
          var file = new Blob([data], {type: type});
          var fileURL = window.URL.createObjectURL(file);
          a.href = fileURL;
          a.download = fileName;
          a.click();
          document.body.removeChild(a);
        }

        invoices.ridesAny = function(target) {
          if (target ==='rider') {
            invoices.ridesAsRiderAny = !_.isEmpty(invoices.asRider)
          } else {
            invoices.ridesAsListerAny = !_.isEmpty(invoices.asLister)
          }
        };

        invoices.items = [];
        for (var i = 0; i < 100001; i++) {
          invoices.items.push(i);
        }

        invoices.filterInvoices = function (type) {
          invoices.filtersType = type;
        };
      }
    ]
});
