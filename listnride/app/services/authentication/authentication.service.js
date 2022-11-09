'use strict';

angular.
  module('listnride').
  factory(
    'authentication',
    function (
      $localStorage,
      $mdDialog,
      $rootScope,
      $state,
      $analytics,
      $q,
      ENV,
      ezfb,
      api,
      verification,
      sha256,
      notification) {

      // After successful login/loginFb, authorization header gets created and saved in localstorage
      var setCredentials = function (response) {
        $localStorage.userId = response.id;
        $localStorage.name = response.first_name + " " + response.last_name;
        $localStorage.firstName = response.first_name;
        $localStorage.lastName = response.last_name;
        $localStorage.profilePicture = response.profile_picture.profile_picture.url;
        $localStorage.unreadMessages = response.unread_messages;
        $localStorage.email = response.email;
        $localStorage.referenceCode = response.ref_code;
        $localStorage.isBusiness = !!response.business;
      };

      var getAccessToken = function (user, isFacebook) {
        var preparedData = isFacebook ? {
          assertion: user.facebook_access_token,
          grant_type: 'assertion'
        } : {
          email: user.email,
          password: user.password,
          grant_type: 'password'
        };

        return api.post('/oauth/token', preparedData).then(function (response) {
          return response.data;
        }, function(error){
          if (error.data.errors[0].source.pointer === 'password_change') {
            showChangePasswordAlert();
          }
          notification.show(error, 'error');
          return $q.reject(error);
        });
      };

      var setAccessToken = function (data) {
        if (data) {
          $localStorage.accessToken = data.access_token;
          $localStorage.tokenType = data.token_type;
          $localStorage.expiresIn = data.expires_in;
          $localStorage.refreshToken = data.refresh_token;
          $localStorage.createdAt = data.created_at;
        }
      };

      var getCountryDomain = function () {
        const url = window.location.host.split('.');
        const urlDomain = url[url.length-1];
        return urlDomain === "localhost:8080" ? "com" : urlDomain;
      };

      var retrieveLocale = function() {
        // Set default language to english
        var language = "";
        var defaultLanguage = "en";
        // Define all available languages
        var availableLanguages = ["de", "en", "nl", "it", "es", "fr"];
        var specialLanguages = { at: "de" };

        var url = window.location.host.split('.');
        // Language based on tld
        var urlLanguage = url[url.length-1];

        // If we're outside localhost, use tld-language (if part of available languages)
        if ( urlLanguage !== ("localhost:8080") && availableLanguages.indexOf(urlLanguage) >= 0) {
          language = urlLanguage;
        } else language = specialLanguages[urlLanguage] || defaultLanguage;
        return language;
      };

      // methods for signup controller
      // defined outside so that can be used out of sign up controller
      // used in request booking flow

      var showSignupSuccess = function() {
        notification.show(null, null, 'toasts.successfully-sign-up');
      };

      var showSignupError = function() {
        notification.show(null, null, 'toasts.could-not-sign-up');
      };

      var showLoginSuccess = function() {
        $mdDialog.hide();
        notification.show(null, null, 'toasts.successfully-logged-in');
      };

      var showLoginError = function() {
        notification.show(null, null, 'toasts.could-not-log-in');
      };

      var showProfile = function() {
        $state.go("user", {userId: $localStorage.userId});
      };

      // LOGIN

      var loginGlobal = function (form) {
        var obj = {
          email: form.email.$modelValue,
          password: form.password.$modelValue,
          target: 'login'
        };
        $analytics.eventTrack('click', { category: 'Request Bike', label: 'Sign In' });
        LoginDialogController(null, sha256, null, obj);
      };

      var loginFbGlobal = function (fbAccessToken) {
        getAccessToken({facebook_access_token: fbAccessToken}, 'facebook').then(function (successTokenData) {
          setAccessToken(successTokenData);
          api.get('/users/me').then(function (success) {
            setCredentials(success.data);
            $rootScope.$broadcast('user_login');
            showLoginSuccess();
          },
          function(error){
            // check if user need update his password, after security update
            resetUserInformation();
            if (error.data.errors[0].source.pointer === 'password_change') showChangePasswordAlert();
            notification.show(error, 'error');
          });
        });
      };

      var changePasswordAlertController = function () {
        var changePasswordAlert = this;

        changePasswordAlert.hide = function () {
          $mdDialog.hide();
        };
      };

      var showChangePasswordAlert = function(){
        $mdDialog.show({
          controller: changePasswordAlertController,
          controllerAs: 'changePasswordAlert',
          templateUrl: 'app/services/authentication/changePasswordAlert.template.html',
          parent: angular.element(document.body),
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          fullscreen: true // Changed in CSS to only be for XS sizes
        });
      };

      // SIGN_UP

      var signupGlobal = function (user, requesting) {
        var obj = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
          isShop: user.isShop || false
        };

        $analytics.eventTrack('click', { category: 'Request Bike', label: 'Register' });

        // manually set all variables to null
        // $mdDialog, inviteCode, requesting, business
        // TODO: Create service for sign up
        SignupDialogController(null, null, requesting, false, obj);
      };

      var signupFbGlobal = function (fbAccessToken, inviteCode, requestFlow, canBeLogin) {
        var invited = !!inviteCode;
        var user = {
          "user": {
            "facebook_access_token": fbAccessToken
          },
          'is_shop': false
        };

        api.post('/users', user).then(function (success) {
          setCredentials(success.data);
          getAccessToken(user.user, 'facebook').then(function (successTokenData) {
            setAccessToken(successTokenData);
            if (requestFlow) {
              $rootScope.$broadcast('user_created');
              $analytics.eventTrack('click', {
                category: 'Sign Up',
                label: 'Facebook Request Flow'
              });
            } else {
              verification.openDialog(false, invited, false, showProfile);
              $analytics.eventTrack('click', {
                category: 'Sign Up',
                label: 'Facebook Standard Flow'
              });
            }
          });
        }, function (error) {
          // try to login
          loginFbGlobal(fbAccessToken);
          if (!canBeLogin) showSignupError();
        });
      };


      // CONTROLLERS

      var LoginDialogController = function($mdDialog, sha256, ezfb, loginObj) {
        var loginDialog = loginObj || this;

        loginDialog.requestLogin = true;

        loginDialog.login = function() {
          var user = {
            'email': loginDialog.email,
            'password': loginDialog.password
          };

          getAccessToken(user).then(function (successTokenData) {
            //TODO do not call setAccessToken if getAccessToken failed
            setAccessToken(successTokenData);
            api.get('/users/me').then(function (success) {
              showLoginSuccess();
              setCredentials(success.data);
              if (loginDialog.requestLogin) {
                $analytics.eventTrack('click', {category: 'Login', label: 'Email Request Flow'});
                $rootScope.$broadcast('user_login');
              } else {
                $analytics.eventTrack('click', {category: 'Signup', label: 'Email Standard Flow'});
              }
            },function(error){
              notification.show(error, 'error');
            });
          });
        };

        loginDialog.hide = function () {
          $mdDialog.hide();
        };

        loginDialog.connectFb = connectFb;

        loginDialog.resetPassword = function() {
          if (loginDialog.email) {
            var user = {
              email: loginDialog.email
            };
            api.post('/users/reset_password', user).then(function(success) {
              notification.show(success, null, 'toasts.reset-password-success');
            }, function(error) {
              loginDialog.error = error.data.errors[0]
            });
          } else {
            notification.show(null, null, 'toasts.enter-email');
          }
        };

        if (loginObj) {
          if (loginDialog.target === 'login') {
            loginDialog.requestLogin = true;
            loginDialog.login();
          } else if (loginDialog.target === 'reset') {
            loginDialog.resetPassword();
          }
        }
      };

       // The Signup Dialog Controller
      var SignupDialogController = function ($mdDialog, inviteCode, requesting, business, signupObj) {
        var signupDialog = signupObj || this;
        signupDialog.signingUp = false;
        signupDialog.requestSignup = false;
        signupDialog.business = business;
        signupDialog.businessError = false;
        signupDialog.requesting = requesting;
        signupDialog.newsletter = false;
        var invited = !!inviteCode;

        signupDialog.hide = function() {
          $mdDialog.hide();
        };

        signupDialog.showLogin = function() {
          $mdDialog.hide();
          showLoginDialog();
        };

        signupDialog.signup = function() {
          signupDialog.createUser();
        };

        signupDialog.createUser = function() {
          var user = {
            'user': {
              'email': signupDialog.email,
              'password': signupDialog.password,
              'first_name': signupDialog.firstName,
              'last_name': signupDialog.lastName,
              'ref_code': $state.params.inviteCode,
              'language': retrieveLocale()
            },
            'notification_preference' : {
              'newsletter': signupDialog.newsletter
            },
            'is_shop': signupDialog.isShop || false
          };

          signupDialog.signingUp = true;

          // grecaptcha has their own promise and in this implementation they don't support catch

          googleRecaptch()
            .then((token) => {
              user.recaptcha_token = token;
              return api.post('/users', user);
            })
            .then((success) => {
              setCredentials(success.data);
              getAccessToken(user.user).then(function (successTokenData) {
                setAccessToken(successTokenData);

                //TODO: refactor this logic
                if (signupDialog.requestSignup) {
                  $rootScope.$broadcast('user_created');
                  $analytics.eventTrack('click', {
                    category: 'Signup',
                    label: 'Email Request Flow'
                  });
                } else {
                  $analytics.eventTrack('click', {
                    category: 'Signup',
                    label: 'Email Standard Flow'
                  });
                }

                if (signupDialog.business) {
                  signupDialog.createBusiness();
                } else {
                  if (!signupDialog.requesting) {
                    $state.go('home');
                  }
                  signupDialog.hide();
                  // verification.openDialog(false, invited);
                }

              });
            })
            .catch((error) => {
              notification.show(error, 'error');
              signupDialog.signingUp = false;
            });

        };

        signupDialog.createBusiness = function() {
          var business = {
            'business': {
              'company_name': signupDialog.companyName
            }
          };

          api.post('/businesses', business).then(function(success) {
            $state.go('home');
            verification.openDialog(false, invited, false, signupDialog.showProfile);
            $localStorage.isBusiness = true;
          }, function(error) {
            signupDialog.businessError = true;
            signupDialog.signingUp = false;
          });
        };

        signupDialog.connectFb = connectFb;
        signupDialog.showProfile = showProfile;

        if (signupObj) {
          signupDialog.requestSignup = true;
          signupDialog.createUser()
        }
      };

      function googleRecaptch() {
        let deferredRecaptcha = $q.defer();

        grecaptcha.execute(ENV.googleRecaptchaPublicKey, {
          action: 'homepage'
        }).then((token) => {
          deferredRecaptcha.resolve(token)
        }, (error) => {
          deferredRecaptcha.reject(error);
          console.error(error);
        });

        return deferredRecaptcha.promise;
      }

      var connectFb = function(inviteCode, requestFlow) {
        ezfb.getLoginStatus(function(response) {
          if (response.status === 'connected') {
            loginFbGlobal(response.authResponse.accessToken);
          } else {
            ezfb.login(function (response) {
              $analytics.eventTrack('click', {category: 'Signup', label: requestFlow ? 'Facebook Request Flow' : 'Facebook Standard Flow'});
              $analytics.eventTrack('click', {category: 'Request Bike', label: 'Register Facebook'});

              signupFbGlobal(response.authResponse.accessToken, false, requestFlow, true)

            }, {scope: 'email'});
          }
        });
      };

      var forgetGlobal = function (email) {
        var obj = {
          email: email,
          target: 'reset'
        };

        LoginDialogController(null, sha256, null, obj);
      };

      var showSignupDialog = function(inviteCode, requesting, event, business) {
         $mdDialog.show({
          controller: ['$mdDialog', SignupDialogController],
          controllerAs: 'signupDialog',
          templateUrl: 'app/services/authentication/signupDialog.template.html',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          fullscreen: true, // Only for -xs, -sm breakpoints.
          locals : {
            inviteCode : inviteCode,
            requesting: requesting,
            business: business,
            signupObj: null
          }
        })
      };

      var showLoginDialog = function(event) {
        $mdDialog.show({
          controller: ['$mdDialog', 'sha256', 'ezfb', LoginDialogController],
          controllerAs: 'loginDialog',
          templateUrl: 'app/services/authentication/loginDialog.template.html',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          fullscreen: true, // Changed in CSS to only be for XS sizes
          locals : {
            loginObj: null
          }
        })
        .then(function(answer) {
          //
        }, function() {
          //
        });
      };

      var loggedIn = function() {
        return !!$localStorage.accessToken;
      };

      let isBusiness = function() {
        return !!$localStorage.isBusiness;
      }

      var getNewTokenByRefresh = function () {
        // refresh token here
      };

      // Logs out the user by deleting the auth header from localStorage
      var logout = function() {

        api.post('/oauth/revoke', {'token': $localStorage.accessToken}).then(function(){
          // reset all localStorage except isAgreeCookiesInfo if user set it to true
          resetUserInformation()
          $state.go('home');
          notification.show(null, null, 'toasts.successfully-logged-out');
        });
      };

      var resetUserInformation = function() {
        var isAgreeCookiesInfo = $localStorage.isAgreeCookiesInfo;
        $localStorage.$reset();
        if (isAgreeCookiesInfo) $localStorage.isAgreeCookiesInfo = true;
      };

      var checkTokenExpiration = function() {
        if (!$localStorage.accessToken) return;

        var refreshTime = 300; // 5 minutes

        // JavaScript works in milliseconds, so you'll first have to convert the UNIX timestamp from seconds to milliseconds.
        var expiredDate = $localStorage.createdAt + $localStorage.expiresIn;
        expiredDate = new Date(expiredDate * 1000);
        expiredDate = moment(expiredDate, "DD/MM/YYYY, h:mm:ss");
        var now = moment();

        // check dates difference
        // https://stackoverflow.com/a/34672015/6334780
        var diff = moment.duration(moment(now).diff(moment(expiredDate)));
        var seconds = parseInt(diff.asSeconds());

        if (seconds < 0 && Math.abs(seconds) <= refreshTime) {
          return getNewTokenByRefresh();
        }

        if (seconds > 0) {
          return resetUserInformation();
        }

        return;
      };

      return {
        showSignupDialog,
        showLoginDialog,
        loggedIn,
        logout,
        setCredentials,
        checkTokenExpiration,
        profilePicture: function() {
          return $localStorage.profilePicture
        },
        name: function() {
          return $localStorage.name
        },
        userId: function() {
          return $localStorage.userId
        },
        unreadMessages: function() {
          return $localStorage.unreadMessages
        },
        connectFb,
        signupGlobal,
        loginGlobal,
        forgetGlobal,
        isBusiness,
        getCountryDomain,
        retrieveLocale
      };
    }
  );
