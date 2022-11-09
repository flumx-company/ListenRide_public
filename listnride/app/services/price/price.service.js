import { isString } from "util";

angular
  .module('listnride')
  .factory('price', function(
    $translate,
    dateHelper
  ) {
    const PRICES_BY_DAYS = new Map([
      ['1', {start_at: 0}],
      ['1/2', {start_at: 43200}],
      ['2', {start_at: 86400}],
      ['3', {start_at: 172800}],
      ['4', {start_at: 259200}],
      ['5', {start_at: 345600}],
      ['6', {start_at: 432000}],
      ['7', {start_at: 518400}],
      ['8', {start_at: 604800}],
      ['28', {start_at: 2419200}]
    ]);
    // to have opportunity to get day by start_at
    // old code: const PRICES_BY_START_AT = _.invertBy(Object.fromEntries(PRICES_BY_DAYS), value => value.start_at);
    const PRICES_BY_START_AT = (function(){
      // Object.fromEntries polyfill
      // to support: samsung browser
      let objectFromMap = Array.from(PRICES_BY_DAYS).reduce((acc, [key, val]) => Object.assign(acc, {
        [key]: val
      }), {});
      return _.invertBy(objectFromMap, value => value.start_at);
    })();

    return {
      getPriceObjectFor(day, prices) {
        day = _.toString(day).replace(/[^0-9\.\/]+/g, '');
        let dayData = PRICES_BY_DAYS.get(day);

        return dayData ? _.find(prices, {
          'start_at': dayData.start_at
        }) : null;
      },
      getPriceFor(day, prices) {
        let priceObject = this.getPriceObjectFor(day, prices)

        return priceObject ? priceObject.price : null;
      },
      getAllPrices(originalPrices) {
        let allPrices = {};
        _.forEach(originalPrices, priceObject => allPrices[PRICES_BY_START_AT[priceObject.start_at]] = priceObject.price);
        return allPrices;
      },
      // Calculates the prices for the calendar and booking overview
      // Note that this is just a preview-calculation, the actual data
      // gets calculated in the backend.
      calculatePrices({
        startDate = null,
        endDate = null,
        prices = null,
        coverageTotal = 0,
        isPremiumCoverage = false,
        isShopUser = false,
        setCustomPrices = false,
        insuranceEnabled = true,
        timeslots = []
      } = {}) {

        // Service Fee is 12,5% and includes 0,19% MwSt
        const RIDER_TAX = 0.125;
        const VAT_TAX = 0.19;

        const result = {
          subtotal: 0,
          subtotalDiscounted: 0,
          serviceFee: 0,
          coverageTotal: coverageTotal, // [0,1000,2000,3000,4000,5000]
          premiumCoverage: isPremiumCoverage ? 3 : 0, // premium Coverage price is static 3 euro
          basicCoverage: 0,
          total: 0
        };

        const includeInsurance = insuranceEnabled;
        const includeFee = !isShopUser;

        if (startDate && endDate) {
          var days = dateHelper.durationDays(startDate, endDate);
        }

        // Check if days are valid
        if (days <= 0) return result;

        // Subtotal here is only to show the price without all Fee and discounts
        result.subtotal = days * this.getPriceFor('1 day', prices);

        // Calc days with daily discount
        if (days <= 1 && timeslots.length) {
          if (this.checkHalfDayEnabled(startDate, endDate, timeslots)) {
            result.subtotal = days * this.getPriceFor('1/2 day', prices);
          }
          result.subtotalDiscounted = result.subtotal;
        } else if (days < 8) {
          result.subtotalDiscounted = this.getPriceFor(days, prices) * days;
        } else if (days <= 28) {
          result.subtotalDiscounted = this.getPriceFor('7 days', prices) * 7 + this.getPriceFor('8 days', prices) * (days - 7);
        } else {
          result.subtotalDiscounted = this.getPriceFor('28 days', prices) * days;
        }

        if (includeInsurance) {
          result.premiumCoverage = result.premiumCoverage * days;
          result.basicCoverage = (result.coverageTotal / 1000) * days;

          result.total += result.premiumCoverage + result.basicCoverage;
        }

        if (includeFee) {
          result.serviceFee = (result.subtotalDiscounted * RIDER_TAX * VAT_TAX) + (result.subtotalDiscounted * RIDER_TAX);

          result.total += result.serviceFee
        }

        result.total += result.subtotalDiscounted;

        return result;
      },

      checkHalfDayEnabled(startDate, endDate, timeslots) {
        if (dateHelper.durationDays(startDate, endDate) > 1) return false;

        const dayTimeRange = _.range(startDate.getHours(), endDate.getHours() + 1);
        const { isHalfDay } = dateHelper.isOnlyOneSlotPicked({
          timeslots,
          dayTimeRange
        });

        return isHalfDay;
      },

      generateDefaultPrices(hasHalfDay) {
        let defaultPrices = [];

        PRICES_BY_DAYS.forEach((value, key) => {
          if (key == '1/2' && !hasHalfDay) return;
          defaultPrices.push({
            price: undefined,
            start_at: value.start_at
          });
        });

        return defaultPrices;
      },


      // DEPRECATED
      // proposes custom prices through daily price acc. to a scheme of us
      // without using custom discounts
      proposeCustomPrices(data) {
        let basePrice = this.getPriceFor('1 day', data.prices) * (1 / 1.25);

        data.prices[1].price = Math.round(basePrice * 2);
        data.prices[2].price = Math.round(basePrice * 2.7);
        data.prices[3].price = Math.round(basePrice * 3.3);
        data.prices[4].price = Math.round(basePrice * 3.9);
        data.prices[5].price = Math.round(basePrice * 4.4);
        data.prices[6].price = Math.round(basePrice * 4.9);
        data.prices[7].price = Math.round(data.prices[0].price * 0.35);
        data.prices[8].price = Math.round(data.prices[7].price * 28);

        return data.prices;
      },

      // estimate prices for several days
      // based on daily price && daily and weekly discounts
      setCustomPrices(data) {
        const base = this.getPriceFor('1 day', data.prices);

        let halfDayPrice = this.getPriceObjectFor('1/2 day', data.prices);

        halfDayPrice ? halfDayPrice.price = Math.round(base / 2) : '';

        for (let day = 2; day <= 6; day += 1) {
          let currentDayPrice = this.getPriceObjectFor(day, data.prices);
          currentDayPrice.price = data.discounts.daily > 1 ? Math.round(day * base * ((100 - parseFloat(data.discounts.daily)) / 100)) : Math.round(day * base);
        }

        // week price update
        this.getPriceObjectFor(7, data.prices).price = Math.round(7 * base * ((100 - parseFloat(data.discounts.weekly)) / 100));
        // additional day price update
        this.getPriceObjectFor(8, data.prices).price = Math.round(1 * base * ((100 - parseFloat(data.discounts.weekly)) / 100));
        // month price update
        this.getPriceObjectFor(28, data.prices).price = Math.round(28 * base * ((100 - parseFloat(data.discounts.weekly)) / 100));

        return data.prices;
      },

      setDefaultPrices() {
        var prices = [];

        return prices;
      },

      // server to client transformation
      // all prices are calculated based on daily price
      // daily price is user provided always as integer
      transformPrices(originalPrices, discounts) {
        let prices = [];
        let halfDayPrice = _.find(originalPrices, {'start_at': 43200});

        let secondDayIndex = halfDayPrice ? 2 : 1;
        if (halfDayPrice) {
          prices[1] = {
            id: originalPrices[1].id,
            price: parseFloat(originalPrices[1].price),
            start_at: originalPrices[1].start_at
          }
        }

        // no change to daily price
        prices[0] = {
          id: originalPrices[0].id,
          price: parseInt(originalPrices[0].price),
          start_at: originalPrices[0].start_at
        };

        // daily and weekly price updates
        for (let day = secondDayIndex; day < originalPrices.length - 3; day += 1) {
          let multiple = halfDayPrice ? day : day + 1 ;
          prices[day] = {
            id: originalPrices[day].id,
            price: Math.round(multiple * originalPrices[day].price),
            start_at: originalPrices[day].start_at
          };
        }

        // weekly price update
        prices.push({
          id: originalPrices[originalPrices.length - 3].id,
          price: Math.round(7 * originalPrices[originalPrices.length - 3].price),
          start_at: originalPrices[originalPrices.length - 3].start_at
        });

        // additional day price update
        prices.push({
          id: originalPrices[originalPrices.length - 2].id,
          price: Math.round(1 * originalPrices[originalPrices.length - 2].price),
          start_at: originalPrices[originalPrices.length - 2].start_at
        });

        // month price update
        prices.push({
          id: originalPrices[originalPrices.length - 1].id,
          price: Math.round(28 * originalPrices[originalPrices.length - 1].price),
          start_at: originalPrices[originalPrices.length - 1].start_at
        });
        return prices;
      },

      // client to server transformation
      inverseTransformPrices(transformedPrices, isListMode) {
        var prices = [];
        var start_at_seconds = [0, 86400, 172800, 259200, 345600, 432000, 518400, 604800, 2419200];
        const WEEK_START_AT = 518400;
        const MORE_THAN_8 = 604800;
        const MORE_THAT_28 = 2419200;

        let halfDayPrice = transformedPrices.length > 9;

        let secondDayIndex = halfDayPrice ? 2 : 1;
        if (halfDayPrice) {
          // add half day start_at to array
          start_at_seconds.splice(1, 0, 43200);

          prices[1] = Object.assign(
            {},
            transformedPrices[1].id ? { id: transformedPrices[1].id } : {},
            {
              price: parseInt(transformedPrices[1].price),
              start_at: start_at_seconds[1]
            }
          );
        }

        // no change to daily price
        prices[0] = Object.assign(
          {},
          transformedPrices[0].id ? { id: transformedPrices[0].id } : {},
          {
            price: parseInt(transformedPrices[0].price),
            start_at: transformedPrices[0].start_at || start_at_seconds[0]
          }
        );


        // listing a bike
        if (isListMode) {
          // daily and weekly price updates
          for (let day = secondDayIndex; day < start_at_seconds.length - 2; day += 1) {
            let divider = halfDayPrice ? day : day+1;
            prices[day] = {
              price: (transformedPrices[day].price / divider),
              start_at: transformedPrices[day].start_at || start_at_seconds[day]
            };
          }

          // additional day price update
          prices.push({
            price: (transformedPrices[secondDayIndex+6].price),
            start_at: transformedPrices[secondDayIndex + 6].start_at || start_at_seconds[start_at_seconds.length - 2]
          });

          // month price update
          prices.push({
            price: (transformedPrices[secondDayIndex+7].price / 28),
            start_at: transformedPrices[secondDayIndex + 7].start_at || start_at_seconds[start_at_seconds.length - 1]
          });
        }
        // editing a bike
        else {
          // daily and weekly price updates
          for (let day = secondDayIndex; day < start_at_seconds.length - 2; day += 1) {
            let divider = halfDayPrice ? day : day + 1;
            prices[day] = {
              id: transformedPrices[day].id,
              price: (transformedPrices[day].price / divider),
              start_at: transformedPrices[day].start_at
            };
          }

          // additional day price update
          prices.push({
            id: transformedPrices[secondDayIndex+6].id,
            price: (transformedPrices[secondDayIndex+6].price),
            start_at: transformedPrices[secondDayIndex+6].start_at
          });

          // month price update
          prices.push({
            id: transformedPrices[secondDayIndex+7].id,
            price: (transformedPrices[secondDayIndex+7].price / 28),
            start_at: transformedPrices[secondDayIndex+7].start_at
          });
        }
        return prices;
      }
    };
  }
);
