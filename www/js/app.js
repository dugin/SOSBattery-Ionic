// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js



angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'firebase', 'angularGeoFire'])

.run(function ($ionicPlatform, $rootScope, $cordovaLocalNotification, $state, $timeout) {

    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }

        // Check for permissions to show local notifications - iOS 8 NEEDS permission to run!
        $cordovaLocalNotification.hasPermission().then(function (granted) {
            $cordovaLocalNotification.cancelAll();
            if (!granted) {
                $cordovaLocalNotification.promptForPermission();
            };
        });

        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }


    });


    document.addEventListener("deviceready", function () {

        console.log("deviceready")

        $rootScope.$on('$cordovaBatteryStatus:low', function (result) {


            $cordovaLocalNotification.schedule({
                id: 1,
                title: 'Precisando carregar?',
                text: 'Clique aqui e descubra onde!',
                icon: "file://img/ic_baterry_low.png"
            }).then(function (result) {

                $timeout(function () {
                    $state.go('tab.lojas');
                }, 0);

            });

        });


    }, false);
})



.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js

    
    $stateProvider



  // setup an abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })

  // Each tab has its own nav history stack:


  .state('tab.lojas', {
      url: '/lojas',
      views: {
          'tab-lojas': {
              templateUrl: 'templates/tab-lojas.html',
              controller: 'LojasCtrl'

          }
      }
  })

      .state('tab.filtro', {
          url: '/filtro',
          cache: false,
          views: {
              'tab-lojas': {
                  templateUrl: 'templates/filtro.html',
                  controller: 'FiltroCtrl'

              }
              
            
          }



      })


  .state('tab.mapa', {
      url: '/mapa',
      views: {
          'tab-mapa': {
              templateUrl: 'templates/tab-mapa.html',
              controller: 'MapaCtrl'
          }
      }
  });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/lojas');

});

