var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require('../db');
var utils = require('../Utils');

router.get('/', function(req, res, next) {
    res.send('rcp');
});

router.post('/check_jaelyo', function(req, res, next) {

    console.log(req.body);

    var html = `
        <!doctype html>
        <html lang="en">
        <head>
        <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css">
        <body class="p-2">
            <div class="d-flex flex-column">
    `;

    var str = req.body.jaelyo.split('\r\n');

    for (obj of str) {
        if (obj.substring(0, 1) == '*') {
            html += '<div style="font-size: 20px;"><b>' + obj + '</b></div>';
        } else {
            var tmp = obj.split(' ');
            if (tmp.length == 2) {
                console.log(tmp);

                if (tmp[1] == '') {
                    tmp[1] = '적당량';
                }

                html += `
                    <div class="d-flex mb-1" style="font-size: 18px;">
                        <div>` + tmp[0] + `</div>
                        <div class="flex-grow-1" style="border-bottom: 1px dotted;"></div>
                        <div>` + tmp[1] + `</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="d-flex mb-1 text-danger" style="font-size: 18px; height: 27px;">
                        <div>` + tmp + `</div>
                        <div class="flex-grow-1" style="border-bottom: 1px dotted red;"></div>
                    </div>
                `;
            }
        }
    }

    html += `
                </div>

                <button class="btn btn-primary w-100 mt-4" onclick="self.close();">닫기</button>
            </body>
        </html>
    `;

    res.send(html);

});


module.exports = router;
