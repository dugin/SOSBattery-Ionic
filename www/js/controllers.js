


var lojasArray = [];
//var infowindow = null;
var latLng = [];
var map;
var markerObj = {};

angular.module('starter.controllers', [])

    
.controller('LojasCtrl', function ($rootScope, $scope, Lojas, $ionicLoading, $ionicTabsDelegate, $state, $timeout) {
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

    Lojas.latLng();
   
   
   

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
        // $ionicTabsDelegate.$getByHandle('my-tabs').select(1);
           
  

        console.log("GeoQuery has loaded and fired all other events for initial data");


    });


    $scope.doRefresh = function () {


        // clear all variables
        lojasNoRaio = [];
         lojasArray = [];   
         $scope.lojas = [];
         latLng = [];
         map = null;
         $scope.dist = [];
         $scope.haveCable = [];

         for (var marker in markerObj) delete markerObj[marker];

        
       
        
        Lojas.latLng();

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

   
   

   
    
 
})


.controller('MapaCtrl', function ($scope, $ionicLoading, $rootScope, $ionicTabsDelegate) {

    

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



                    // $ionicTabsDelegate.$getByHandle('my-tabs').select(0);
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
                    'position': new plugin.google.maps.LatLng(0, 0),
                    'title': ["Hello Google Map for", "Cordova!"].join("\n"),
                    'snippet': "This plugin is awesome!"
                }, function (marker) {
                    marker.showInfoWindow();
                });


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
    

      

});


function resample_hermite(canvas, W, H, W2, H2) {
    var time1 = Date.now();
    W2 = Math.round(W2);
    H2 = Math.round(H2);
    var img = canvas.getContext("2d").getImageData(0, 0, W, H);
    var img2 = canvas.getContext("2d").getImageData(0, 0, W2, H2);
    var data = img.data;
    var data2 = img2.data;
    var ratio_w = W / W2;
    var ratio_h = H / H2;
    var ratio_w_half = Math.ceil(ratio_w / 2);
    var ratio_h_half = Math.ceil(ratio_h / 2);

    for (var j = 0; j < H2; j++) {
        for (var i = 0; i < W2; i++) {
            var x2 = (i + j * W2) * 4;
            var weight = 0;
            var weights = 0;
            var weights_alpha = 0;
            var gx_r = gx_g = gx_b = gx_a = 0;
            var center_y = (j + 0.5) * ratio_h;
            for (var yy = Math.floor(j * ratio_h) ; yy < (j + 1) * ratio_h; yy++) {
                var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                var center_x = (i + 0.5) * ratio_w;
                var w0 = dy * dy //pre-calc part of w
                for (var xx = Math.floor(i * ratio_w) ; xx < (i + 1) * ratio_w; xx++) {
                    var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                    var w = Math.sqrt(w0 + dx * dx);
                    if (w >= -1 && w <= 1) {
                        //hermite filter
                        weight = 2 * w * w * w - 3 * w * w + 1;
                        if (weight > 0) {
                            dx = 4 * (xx + yy * W);
                            //alpha
                            gx_a += weight * data[dx + 3];
                            weights_alpha += weight;
                            //colors
                            if (data[dx + 3] < 255)
                                weight = weight * data[dx + 3] / 250;
                            gx_r += weight * data[dx];
                            gx_g += weight * data[dx + 1];
                            gx_b += weight * data[dx + 2];
                            weights += weight;
                        }
                    }
                }
            }
            data2[x2] = gx_r / weights;
            data2[x2 + 1] = gx_g / weights;
            data2[x2 + 2] = gx_b / weights;
            data2[x2 + 3] = gx_a / weights_alpha;
        }
    }
   
    canvas.getContext("2d").clearRect(0, 0, Math.max(W, W2), Math.max(H, H2));
    canvas.width = W2;
    canvas.height = H2;
    canvas.getContext("2d").putImageData(img2, 0, 0);
}



function hrFunc(lojas) {

        
    var hr_abre = "";
    var hr_fecha = "";
    var resp = "";

    var d = new Date();
    var day = d.getDay();

  

    if (day > 0 && day < 6) {
        hr_abre = lojas.hr_open[0].substring(0, 2) + "h as ";
        hr_fecha = lojas.hr_close[0].substring(0, 2) + "h";
        resp = hr_abre + "" + hr_fecha;

        if (lojas.hr_open.length > 3 && lojas.hr_close.length > 3) {
            resp += "\n" + lojas.hr_open[3].substring(0, 2) + "h as ";
            resp += lojas.hr_close[3].substring(0, 2) + "h";

        }
    } else if (day == 6) {
        hr_abre = lojas.hr_open[1].substring(0, 2) + "h as ";
        hr_fecha = lojas.hr_close[1].substring(0, 2) + "h";
        resp = hr_abre + "" + hr_fecha;

        if (lojas.hr_open.length > 4 && lojas.hr_close.length > 4) {
            resp += "\n" + lojas.hr_open[4].substring(0, 2) + "h as ";
            resp += lojas.hr_close[4].substring(0, 2) + "h";

        }
    } else if (day == 0) {
        hr_abre = lojas.hr_open[2].substring(0, 2) + "h as ";
        hr_fecha = lojas.hr_close[2].substring(0, 2) + "h";
        resp = hr_abre + "" + hr_fecha;

        if (lojas.hr_open.length > 5 && lojas.hr_close.length > 5) {
            resp += "\n" + lojas.hr_open[5].substring(0, 2) + "h as ";
            resp += lojas.hr_close[5].substring(0, 2) + "h";

        }
    }

     

    if (hr_abre.localeCompare("00h as ") == 0 && hr_fecha.localeCompare("00h") == 0)
        return "Nao abre";


    return resp;
}

