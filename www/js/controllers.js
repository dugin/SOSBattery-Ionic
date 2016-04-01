


var lojasArray = [];
var latLng = [];
var map;
var markerObj = {};
var filtro = {};

angular.module('starter.controllers', [])

    
.controller('LojasCtrl', function ($rootScope, $scope, Lojas, $ionicLoading, $state, $timeout, $ionicHistory) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
    //});


    $scope.lojas = [];
    $scope.dist = [];
    $scope.haveCable = [];

    Lojas.latLng(2);
   
    var raio = null;
   

    $ionicLoading.show({
        template: '<p>Carregando Estabelecimentos...</p><ion-spinner class="spinner-positive"></ion-spinner>'
    });

    var lojasNoRaio = [];

    // Listen for Angular Broadcast
    $scope.$on("latLng", function (event, args) {

        latLng = args;
   
    });
   

   
    // Listen for Angular Broadcast
    $scope.$on("SEARCH:KEY_ENTERED", function (event, key, location, distance) {

       

       // latLngLojas.push({ lat: location[0], lon: location[1] });

       
        
        lojasNoRaio[key] = distance;

       
       
       
    



    });

    // Listen for Angular Broadcast
    $scope.$on("SEARCH:READY", function () {



        // Ordena por lojas mais proxima
        var lojasOrdenadas = [];
        var lojasSemCabo = [];

        for (var x in lojasNoRaio)       
                lojasOrdenadas.push([x, lojasNoRaio[x]]);      
        

        lojasOrdenadas.sort(function (a, b) { return a[1] - b[1] })

        var fireBaseRef = new Firebase("https://flickering-heat-3899.firebaseio.com/estabelecimentos");

        for (var y in lojasOrdenadas) {


            fireBaseRef.child(lojasOrdenadas[y][0]).on("value", function (snapshot) {

                var loja = snapshot.val();

                if (loja.cabo) {

                    $scope.dist.push(calcDist(lojasOrdenadas[y][1]) + ' min');

                    lojasArray.push(loja);

                    $scope.lojas.push(loja);

                } else {

                    lojasSemCabo.push([lojasOrdenadas[y][1],loja]);

                }

               


            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });


        }

        for (var x in lojasSemCabo) {

            console.log(lojasSemCabo);

            $scope.dist.push(calcDist(lojasSemCabo[x][0]) + ' min');

            lojasArray.push(lojasSemCabo[x][1]);

            $scope.lojas.push(lojasSemCabo[x][1]);

        }

        

      
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');

       

        $rootScope.$emit('call-map', {});

        $ionicLoading.hide();
        
           
  

        console.log("GeoQuery has loaded and fired all other events for initial data");


    });


    $scope.doRefresh = function () {

        if (raio == null)
            renew(2);
        else
            renew(raio);
    }


    $scope.click = function (loja) {

        console.log("onClick")

        if (map!=null){

        map.moveCamera({
            'target': new plugin.google.maps.LatLng(loja.coordenadas[0], loja.coordenadas[1]),
            'tilt': 0,
            'zoom': 15,
            'bearing': 0
        }, function () {

            

            var temp = loja.coordenadas[0] + ',' + loja.coordenadas[1];
            key = temp.replace(/\s+/g, '');

          
            var marker = markerObj[key];
         

            marker.showInfoWindow();
          
        });
    }

       
        $timeout(function () {
            $state.go('tab.mapa');
        }, 0);
        /*
        console.log("onClick")
        $rootScope.$emit('loja-clicked', {
            lat: loja.coordenadas[0],
            lon: loja.coordenadas[1]
        }); */
       
       
       
      
    }


 /**
    var myDataPromise = Lojas.cityQuery();
    myDataPromise.then(function (result) {

       


        $ionicLoading.hide();

        // this is only run after getData() resolves
        $scope.lojas = result;
       
    }); **/

    function renew(distancia) {

        

        // clear all variables
        lojasNoRaio = [];
        lojasArray = [];
        $scope.lojas = [];
        latLng = [];
        map = null;
        $scope.dist = [];
        $scope.haveCable = [];
        markerObj = {};

        if (distancia.localeCompare('Cidade') == 0) {
          
            $rootScope.$on('latLngCityQuery', function (event, latLng) {
             
                var lat = latLng.lat;
                var lon = latLng.lon;

                console.log("latLngCityQuery: " + lat)
                console.log("latLngCityQuery: " + lon)
            });
            
            Lojas.cityQuery().then(function (result) {

                console.log(" Lojas.cityQuery()")
                for (var x in result) {
             
                    var dist = getDistanceFromLatLonInKm(lat, lon, result[x].coordenadas[0], result[x].coordenadas[1]);

                    console.log(dist)

                }

        lojasArray = result;
        // this is only run after getData() resolves
        $scope.lojas = result;

        $ionicLoading.hide();
       
               

            });

        }
        else
            Lojas.latLng(distancia);

    }
  
   
     function calcDist( distanciaM) {
       var  segundos = distanciaM *1000/ 1.3;
       var minutos = parseInt(segundos / 60);
    if ( minutos == 0)
    minutos = 1;
    return  minutos;

     }

     $scope.hrFunc = function (lojas) {
         return hrFunc(lojas);
     }


    
     $rootScope.$on('filter', function (event, filter) {
       
       
         $(document).ready(function () {
             $('#backBtn').click(backBtn());
             $ionicHistory.goBack();
         });
       
         raio = filter.distancia;

         $ionicLoading.show({
             template: '<p>Carregando Estabelecimentos...</p><ion-spinner class="spinner-positive"></ion-spinner>'
         });

         renew(raio);

       

        })
   
   

   
    
 
})


.controller('MapaCtrl', function ($scope, $ionicLoading, $rootScope ) {

    

    function declareMap() {
        var div = document.getElementById("map");

        console.log("MapaCtrl")


        var myLatlng = new plugin.google.maps.LatLng(latLng.lat, latLng.lon);


        map = plugin.google.maps.Map.getMap(div, {
            'camera': {
                'latLng': myLatlng,
                'zoom': 15

            }, 'controls': {
                compass: true,
                myLocationButton: true
            }
        });

    }
    
    declareMap();

    // You have to wait the MAP_READY event.
    map.on(plugin.google.maps.event.MAP_READY, initMap);

    


    function initMap() {

     


        var x = 0;

        var loopArray = function (arr) {
            customAlert(arr[x], function () {
                // set x to next item
                x++;

                // any more items in array? continue loop
                if (x < arr.length) {
                    loopArray(arr);
                }
                else {

                    $ionicLoading.hide();



                   //  $ionicTabsDelegate.$getByHandle('my-tabs').select(0);
                }
            });
        }

        function customAlert(loja, callback) {

            var latlng = new plugin.google.maps.LatLng(loja.coordenadas[0], loja.coordenadas[1]);


            var img = new Image();

            img.src = loja.imgURL;

            var canvas = document.createElement('canvas');


            var ctx = canvas.getContext("2d");

            img.onload = function () {


                var W = img.width;
                var H = img.height;
                canvas.width = W;
                canvas.height = H;
                ctx.drawImage(img, 0, 0); //draw image

                //resize manually
                resample_hermite(canvas, W, H, 60, 60);

                var img2 = canvas.getContext("2d").getImageData(0, 0, 60, 60);

                var tam = loja.nome.length;
                if (tam < 9)
                    tam = 9;



                var canvas2 = document.createElement('canvas');
                canvas2.width = 70 + (tam * 9);
                canvas2.height = 63;

                var ctx2 = canvas2.getContext("2d");

                ctx2.putImageData(img2, 0, 0);



                ctx2.font = '12pt Calibri';
                ctx2.fillStyle = 'black';
                ctx2.fillText(loja.nome, 70, 15);

                ctx2.font = '11pt Calibri';
                ctx2.fillStyle = '#589E3F';
                ctx2.fillText(hrFunc(loja), 70, 55);

                map.addMarker({
                    'position': latlng,
                    'title': canvas2.toDataURL(),
                    'icon': {
                        'url': 'file:///android_asset/www/img/ic_battery_charging_full_34_dp.png',
                        'size': {
                            width: 40,
                            height: 40
                        }
                    }
                },
                    function (marker) {

                        marker.getPosition(function (latLng) {
                           
                            markerObj[latLng.toString()] = marker;
                        })




                    });



                callback();
            }
        }

        loopArray(lojasArray);


        $scope.map = map;
    }



    $rootScope.$on('call-map', function () {
        console.log('call-map');
        declareMap();
        initMap();


    });

     
    /*
            $rootScope.$on('loja-clicked', function (event, args) {

             
             
            });  */
    

      

})

.controller('TabCtrl', function ($scope) {

        $scope.onTabSelected = function () {
            $('.ion-funnel').show();
        }

        $scope.onTabDeselected = function () {
            $('.ion-funnel').hide();
        }
    })



.controller('FiltroCtrl', function ($scope, $rootScope) {

   
    console.log('Filtro distancia: ' + filtro.distancia);

    angular.element(document).ready(function () {
       
    if (!jQuery.isEmptyObject(filtro)) {
        $scope.filter = { distancia: filtro.distancia };
       
        $scope.filter.cabo = filtro.cabo ;
        $scope.filter.wifi = filtro.wifi;
        $scope.filter.bar = filtro.bar;
        $scope.filter.loja = filtro.loja;
        $scope.filter.restaurante = filtro.restaurante;


    }
    else
        $scope.filter = { distancia: 2 };

    });

    $scope.setFilter = function (filter) {

        if (filter.distancia == 16)
            filter.distancia = "Cidade";

        filtro = {
            distancia: filter.distancia,
            cabo: filter.cabo,
            wifi: filter.wifi,
            bar: filter.bar,
            loja: filter.loja,
            restaurante: filter.restaurante
        }

        $rootScope.$emit('filter', filtro);

    }
    
   

    


});


