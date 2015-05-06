(function () { 'use strict';
  angular
    .module('app', ['snCounters', 'ngAnimate'])
    .value('config', {
      photoLinks: ['vk.com', 'instagram.com'],
      maxPhotoLinks: 3,
      submitMethod: 'POST',
      submitUrl: '/reg',
      resultTimeout: 5000,
      resultDelay: 1000
    });
}());


(function () { 'use strict';
  angular
    .module('app')
    .controller('PhotoRegCtrl', PhotoRegCtrl);

  PhotoRegCtrl.$inject = ['config', '$scope', '$http', '$timeout', '$q'];


  function PhotoRegCtrl(config, $scope, $http, $timeout, $q) {
    var ctrl = this, canceler, resultTimeout, resultDelay;

    ctrl.photoLinks = config.photoLinks.slice(0, config.maxPhotoLinks);
    ctrl.addPhotoLink = addPhotoLink;
    ctrl.checkPhotoLinks = checkPhotoLinks;
    ctrl.removePhotoLink = removePhotoLink;
    ctrl.checkPhotoType = checkPhotoType;
    ctrl.addPhotoType = addPhotoType;
    ctrl.checkPayment = checkPayment;
    ctrl.submit = submit;

    $scope.$on('$destroy', function() {
      cancel();
    });


    function isEmpty(val) {
      return !val || val === '';
    }


    function addPhotoLink() {
      if (ctrl.isAddPhotoLink) {
        ctrl.photoLinks.unshift(ctrl.newPhotoLink);
        ctrl.newPhotoLink = '';
      }
      ctrl.isAddPhotoLink = ctrl.isAddPhotoLink === 1 ? 2 : 1;
    }

    function checkNewPhotoLink() {
      return !isEmpty(ctrl.newPhotoLink) &&
        ctrl.photoLinks.indexOf(ctrl.newPhotoLink) < 0;
    }

    function checkPhotoLinks() {
      return checkNewPhotoLink() &&
        ctrl.photoLinks.length < config.maxPhotoLinks - 1;
    }

    function removePhotoLink(link) {
      var linkIndex = ctrl.photoLinks.indexOf(link);
      ctrl.photoLinks.splice(linkIndex, 1);
    }


    function checkPhotoType() {
      return !(ctrl.interiorPhotoType ||
        ctrl.studioPhotoType || ctrl.naturePhotoType ||
        !isEmpty(ctrl.newPhotoType));
    }

    function addPhotoType() {
      ctrl.isAddPhotoType = 1;
    }


    function checkPayment() {
      return !(ctrl.freePayment || ctrl.rentPayment ||
        ctrl.makeupPayment || ctrl.photoPayment);
    }


    function submit(isFormValid) {
      var submittingTime, data;

      if (!isFormValid) {
        return;
      }

      cancel();

      submittingTime = Date.now();

      ctrl.isSubmitting = true;
      ctrl.isSubmitted = false;
      ctrl.isError = false;
      ctrl.error = null;

      canceler = $q.defer();

      resultTimeout = $timeout(function () {
        canceler.resolve();
      }, config.resultTimeout);

      data = {
        lastName: ctrl.lastName,
        firstName: ctrl.firstName,
        city: ctrl.city,
        email: ctrl.email,
        phone: ctrl.phone,
        photoLinks: ctrl.photoLinks.slice(0),
        interiorPhotoType: ctrl.interiorPhotoType,
        studioPhotoType: ctrl.studioPhotoType,
        naturePhotoType: ctrl.naturePhotoType,
        freePayment: ctrl.freePayment,
        rentPayment: ctrl.rentPayment,
        makeupPayment: ctrl.makeupPayment,
        photoPayment: ctrl.photoPayment
      };

      if (checkNewPhotoLink()) {
        data.photoLinks.unshift(ctrl.newPhotoLink);
      }

      if (!isEmpty(ctrl.newPhotoType)) {
        data.newPhotoType = ctrl.newPhotoType;
      }

      $http({
        method: config.submitMethod,
        url: config.submitUrl,
        timeout: canceler.promise,
        data: data
      })
        .success(function () {
          result(false);
        })
        .error(function (data, status) {
          result(true, status);
        });


      function result(isError, error) {
        var elapsed = Date.now() - submittingTime,
            delay = config.resultDelay - elapsed;

        if (delay < 0) {
          delay = 0;
        }

        resultDelay = $timeout(function () {
          ctrl.isError = isError;
          if (isError) {
            ctrl.error = error || '';
          }
          ctrl.isSubmitting = false;
          ctrl.isSubmitted = true;
        }, delay);
      }
    }

    function cancel() {
      if (resultTimeout) {
        $timeout.cancel(resultTimeout);
        resultTimeout = undefined;
      }

      if (canceler) {
        canceler.resolve();
        canceler = undefined;
      }

      if (resultDelay) {
        $timeout.cancel(resultDelay);
        resultDelay = undefined;
      }
    }
  }
}());

(function () { 'use strict';
  angular
    .module('app')
    .directive('notExistsIn', directive);


  function directive() {
    return {
      restrict: 'A',
      scope: {
        values: '=notExistsIn'
      },
      require: 'ngModel',
      link: link
    };


    function link(scope, el, attrs, ctrl) {
      scope.$watchCollection('values', function () {
        validate(ctrl.$viewValue);
      });
      ctrl.$parsers.push(parser);


      function parser(viewVal) {
        validate(viewVal);
        return viewVal;
      }

      function validate(val) {
        ctrl.$setValidity('notExistsIn',
            scope.values.indexOf(val) < 0);
      }
    }
  }
}());

(function () { 'use strict';
  angular
    .module('app')
    .directive('setFocus', directive);

  directive.$inject = ['$timeout'];


  function directive($timeout) {
    return {
      restrict: 'A',
      link: link
    };


    function link(scope, el, attrs) {
      scope.$watch(attrs.setFocus, watch);

      function watch(newVal, oldVal) {
        if (newVal !== oldVal && newVal) {
          $timeout(function() {el[0].focus();});
        }
      }
    }
  }
}());

(function () { 'use strict';
  angular
    .module('snCounters', [])
    .directive('snCounters', directive);


  function directive() {
    Controller.$inject = ['$location'];

    return {
      restrict: 'A',
      scope: {},
      controller: Controller,
      controllerAs: 'ctrl'
    };


    function Controller($location) {
      var ctrl = this;

      ctrl.url =  url;
      ctrl.checkNumber = checkNumber;
      ctrl.humanNumber = humanNumber;


      function url() {
        return $location.protocol() + '://' + $location.host() + '/';
      }

      function checkNumber(val) {
        return Number(val) >= 0;
      }

      function humanNumber(number) {
        var units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
            th = 1000, u = 0;

        while (number >= th && u + 1 < units.length) {
          number /= th;
          u++;
        }

        return Math.floor(number) + units[u];
      }
    }
  }
}());

(function () { 'use strict';
  angular
    .module('snCounters')
    .directive('snVkCounter', directive);

  directive.$inject = ['$http', '$window'];


  function directive($http, $window) {
    return {
      restrict: 'A',
      require: '^snCounters',
      scope: {
        url: '@snVkCounter'
      },
      link: link
    };


    function link(scope, el, attrs, ctrl) {
      $window.VK = {
        Share: {
          count: vkCount
        }
      };

      $http.jsonp('https://vk.com/share.php', {
        params: {
          act: 'count',
          url: scope.url || ctrl.url(),
          callback: 'JSON_CALLBACK'
        }
      });


      function vkCount(index, count) {
        if (ctrl.checkNumber(count)) {
          el.text(ctrl.humanNumber(count));
        }
      }
    }
  }
}());

(function () { 'use strict';
  angular
    .module('snCounters')
    .directive('snFacebookCounter', directive);

  directive.$inject = ['$http'];


  function directive($http) {
    return {
      restrict: 'A',
      require: '^snCounters',
      scope: {
        url: '@snFacebookCounter'
      },
      link: link
    };


    function link(scope, el, attrs, ctrl) {
      $http
        .get('https://api.facebook.com/method/fql.query', {
          params: {
            query: 'select total_count from link_stat' +
              ' where url=\'' + (scope.url || ctrl.url()) + '\'',
            format: 'json'
          }
        })
        .success(success);


      function success(data) {
        if (data && data[0] &&
          ctrl.checkNumber(data[0].total_count)) {
            el.text(ctrl.humanNumber(data[0].total_count));
        }
      }
    }
  }
}());

(function () { 'use strict';
  angular
    .module('snCounters')
    .directive('snTwitterCounter', directive);

  directive.$inject = ['$http'];


  function directive($http) {
    return {
      restrict: 'A',
      require: '^snCounters',
      scope: {
        url: '@snTwitterCounter'
      },
      link: link
    };


    function link(scope, el, attrs, ctrl) {
      $http
        .jsonp('https://cdn.api.twitter.com/1/urls/count.json', {
          params: {
            url: scope.url || ctrl.url(),
            callback: 'JSON_CALLBACK'
          }
        })
        .success(success);


      function success(data) {
        if (data && ctrl.checkNumber(data.count)) {
          el.text(ctrl.humanNumber(data.count));
        }
      }
    }
  }
}());
