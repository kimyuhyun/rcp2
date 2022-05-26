const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const db = require('../db');
const utils = require('../Utils');
const moment = require('moment');


// http://54.180.156.167:8080/data/1132_0.jpg

router.get('/match', async function(req, res, next) {

    // var qArr = [];
    //
    // var sql = `SELECT idx FROM RCP_tbl WHERE writer_idx = ? ORDER BY idx ASC`;
    // var params = [3];
    // var arr = await utils.queryResult(sql, params);
    //
    // sql = '';
    // for (obj of arr) {
    //     var sql2 = ''
    //     for (var i = 0; i < 20; i++) {
    //
    //         var fileName = `data/${obj.idx}_${i}.jpg`;
    //
    //         await new Promise(function(resolve, reject) {
    //             fs.exists(fileName, function(exists) {
    //                 resolve(exists);
    //             });
    //         }).then(function (data) {
    //             if (data) {
    //                 sql2 += `,filename${i} = 'http://54.180.156.167:8080/${fileName}'  `;
    //             }
    //         });
    //     }
    //
    //     sql = `UPDATE RCP_tbl SET ${sql2.substring(1)} WHERE idx = ${obj.idx} `;
    //
    //     // var params = [];
    //     // var arr = await utils.queryResult(sql, params);
    //     // console.log(arr);
    //
    //
    // }

    res.send('1');
});



module.exports = router;
