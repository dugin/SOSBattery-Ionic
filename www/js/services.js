angular.module('starter.services', [])

.factory('Lojas', function ($firebaseArray, $rootScope,  $cordovaGeolocation, $geofire) {

    var fireBaseRef = new Firebase("https://flickering-heat-3899.firebaseio.com/estabelecimentos");

    var $geo = $geofire(new Firebase("https://flickering-heat-3899.firebaseio.com/coordenadas"));

    var query;
 
   
    var lojas = $firebaseArray(fireBaseRef);
    var geocoder;

    return {

        latLng: function () {
        geoLocation().then(function (position) {


            // Setup a GeoQuery
            query = $geo.$query({
                center: [position.coords.latitude, position.coords.longitude],
                radius: 20
            });

            $rootScope.$broadcast('latLng', {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            });


            // Setup Angular Broadcast event for when an object enters our query
            query.on("key_entered", "SEARCH:KEY_ENTERED");

            query.on("ready", "SEARCH:READY");



        }).fail(function (err) {
            console.error(err);
        });

    }
,

    all: function() {
      return lojas;
    },

    cityQuery: function () {

        var deferred = $.Deferred(),
           geocoder = new google.maps.Geocoder();
       
        geoLocation().then(function (pos) {
         
           

                var city;

                var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
               
                geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                   

                    if (status == google.maps.GeocoderStatus.OK) {

                        
                        if (results[1]) {

                            //find country name
                            for (var i = 0; i < results[0].address_components.length; i++) {
                                for (var b = 0; b < results[0].address_components[i].types.length; b++) {

                                    //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                                    if (results[0].address_components[i].types[b] == "locality") {
                                        //this is the object you are looking for
                                        city = results[0].address_components[i].long_name;

                                        break;
                                    }
                                }
                            }
                            //city data
                           
                            deferred.resolve($firebaseArray(fireBaseRef.orderByChild('cidade').equalTo(city)));

                        } else {
                            alert("No results found");
                        }
                    } else {
                        alert("Geocoder failed due to: " + status);
                    }
                });
            
        }).fail(function (err) {
            console.error(err);
        });
       
        return deferred.promise();
    },


   
  };


     function geoLocation() {
        var deferred = $.Deferred();

        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };
       
          
            $cordovaGeolocation.getCurrentPosition(posOptions).then(deferred.resolve, deferred.reject, { timeout: 5000 });
           
       
        return deferred.promise();
    }


     
})




