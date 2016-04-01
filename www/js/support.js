
function backBtn() {

    console.log('backBtn pressed');
    $('#tabs').toggleClass('tabs-item-hide', false);
    $('.ion-funnel').show();


}


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}



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
