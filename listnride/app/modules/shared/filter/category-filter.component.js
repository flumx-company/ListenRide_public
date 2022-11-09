'use strict';

angular.module('categoryFilter', [])
  .component('categoryFilter', {
    templateUrl: 'app/modules/shared/filter/category-filter.template.html',
    controllerAs: 'categoryFilter',
    bindings: {
      currentCategories: '=',
      onFilterChange: '<?',
      onlyParentCategories: '<?',
      hideCategoryCheckbox:'<?',
      onlySinglePick: '<?'
    },
    controller: [
      '$translate',
      '$state',
      '$timeout',
      'bikeOptions',
      'filterFilter',
      function CategoryFilterController($translate, $state, $timeout, bikeOptions, filterFilter) {
        var categoryFilter = this;

        categoryFilter.$onInit = function () {
          // methods
          categoryFilter.checkDisabled = checkDisabled;
          categoryFilter.toggle = toggle;
          categoryFilter.exists = exists;
          categoryFilter.isIndeterminate = isIndeterminate;
          categoryFilter.isChecked = isChecked;
          categoryFilter.toggleAll = toggleAll;
          categoryFilter.showSubs = showSubs;
          categoryFilter.categorySubs = categorySubs;
          categoryFilter.onlyParentCategories = !!categoryFilter.onlyParentCategories;

          // variables
          categoryFilter.categories = [];
          bikeOptions.allCategoriesOptions().then(function (resolve) {
            categoryFilter.categories = resolve;
          });
          categoryFilter.openSubs = [];
        };

        function checkDisabled(subcategoryId) {
          if (!categoryFilter.onlySinglePick) return;
          if (categoryFilter.currentCategories.length) {
            return categoryFilter.currentCategories[0] !== subcategoryId;
          }
        }

        function toggle(item, list, $event) {
          // don't display child categories, simply toggle all
          if (categoryFilter.onlyParentCategories) return categoryFilter.toggleAll($event, item);

          var idx = list.indexOf(item);
          if (idx > -1) {
            list.splice(idx, 1);
          } else {
            list.push(item);
          }
          if (typeof categoryFilter.onFilterChange === "function") categoryFilter.onFilterChange();
        }

        function exists(item, list) {
          return list.indexOf(item) > -1;
        }

        function isIndeterminate(categoryId) {
          var intersection = _.intersection(categoryFilter.categorySubs(categoryId), categoryFilter.currentCategories).length;
          return (intersection > 0 && intersection !== categoryFilter.categorySubs(categoryId).length);
        }

        function isChecked(categoryId) {
          return categoryChosen(categoryId);
        }

        function toggleAll($event, categoryId) {
          $event.stopPropagation();
          if (categoryChosen(categoryId)) {
            categoryFilter.currentCategories = _.difference(categoryFilter.currentCategories, categoryFilter.categorySubs(categoryId))
          } else if (categoryFilter.currentCategories.length === 0 || categoryFilter.currentCategories.length > 0) {
            categoryFilter.currentCategories = _.union(categoryFilter.currentCategories, categoryFilter.categorySubs(categoryId));
            categoryFilter.openSubs = _.union(categoryFilter.openSubs, [categoryId])
          }

          $timeout(function(){
            if (typeof categoryFilter.onFilterChange === "function") categoryFilter.onFilterChange();
          }, 0);

        }

        function showSubs(categoryId) {
          return categoryFilter.openSubs.includes(categoryId) && !categoryFilter.onlyParentCategories;
        }

        function categoryIntersection(categoryId) {
          return _.intersection(categoryFilter.currentCategories, categoryFilter.categorySubs(categoryId)).sort()
        }

        function categoryChosen(categoryId) {
          return _.isEqual(categoryIntersection(categoryId), categoryFilter.categorySubs(categoryId))
        }

        function categorySubs(id) {
          return _.map(_.find(categoryFilter.categories, function (category) {
            return category.catId === id;
          }).subcategories, 'id').sort()
        }

      }
    ]
  });
