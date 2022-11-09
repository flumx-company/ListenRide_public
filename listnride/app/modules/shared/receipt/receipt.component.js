'use strict';
angular.module('receipt', []).component('receipt', {
  templateUrl: 'app/modules/shared/receipt/receipt.template.html',
  controllerAs: 'receipt',
  bindings: {
    startDate: '<',
    endDate: '<',
    invalidDays: '<',
    prices: '<',
    user: '<',
    withoutCalendar: '<?',
    coverageTotal: '<?',
    countryCode: '<?',
    isPremiumCoverage: '<?',
    isShop: '<',
    setCustomPrices: '<',
    insuranceAllowed: '<',
    timeslots: '<'
  },
  controller: function ReceiptController(
    dateHelper,
    price
  ) {
      const receipt = this;
      receipt.balance = 0;
      receipt.isHalfDayBook = false;

      this.$onChanges = function (changes) {
        if (changes.user && changes.user.currentValue.balance != undefined) {
          receipt.balance = changes.user.currentValue.balance;
        }
        updatePrices();
      };

      function updatePrices() {
        if (receipt.prices && (receipt.startDate != "Invalid Date" && receipt.endDate != "Invalid Date")) {
          setPrices();
        } else {
          setDefaultPrices();
        }

        receipt.freeBike = receipt.prices && receipt.prices[0].price <= 0;
      }

      function setPrices() {
        var prices = price.calculatePrices({
          startDate: receipt.startDate,
          endDate: receipt.endDate,
          prices: receipt.prices,
          coverageTotal: receipt.coverageTotal,
          isPremiumCoverage: receipt.isPremiumCoverage,
          isShopUser: receipt.isShop,
          setCustomPrices: receipt.setCustomPrices,
          insuranceEnabled: receipt.insuranceAllowed(),
          timeslots: receipt.timeslots
        });

        receipt.durationDays = dateHelper.durationDays(receipt.startDate, receipt.endDate);

        if (receipt.startDate) {
          receipt.isHalfDayBook = price.checkHalfDayEnabled(receipt.startDate, receipt.endDate, receipt.timeslots);
          receipt.halfDayPrice = price.getPriceFor('1/2 day', receipt.prices);
        }

        if (receipt.isHalfDayBook) {
          receipt.displayableDuration = dateHelper.durationHoursPretty(receipt.startDate, receipt.endDate);
        } else {
          receipt.displayableDuration = dateHelper.durationDaysPretty(receipt.startDate, receipt.endDate);
        }

        receipt.discount = prices.subtotal - prices.subtotalDiscounted;
        receipt.discountRelative = receipt.discount / receipt.durationDays;
        receipt.subtotal = prices.subtotal;
        receipt.subtotalDiscounted = prices.subtotalDiscounted;
        receipt.lnrFee = prices.serviceFee + prices.basicCoverage;
        receipt.premiumCoverage = prices.premiumCoverage;

        receipt.specialPriceLowerThanBase = prices.subtotalDiscounted < prices.subtotal;
        receipt.subtotalDiscounted = prices.subtotalDiscounted;
        receipt.specialPriceDaily = prices.subtotalDiscounted / receipt.durationDays;

        receipt.total = Math.max(prices.total - receipt.balance, 0);
      }

      function setDefaultPrices() {
        receipt.durationDays = "0";
        receipt.subtotalDiscounted = "0";
        receipt.displayableDuration = " --- ";
        receipt.subtotal = 0;
        receipt.lnrFee = 0;
        receipt.total = 0;
      }

      receipt.insuranceCountry = function () {
        return _.includes(["DE", "AT"], receipt.countryCode);
      }
    }
});
