const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const db = require('../db');
const utils = require('../Utils');
const moment = require('moment');


async function setLog(req, res, next) {
    //토큰 검증 한다!!!
    if (req.query.token != 'kkyyhh') {
        res.send('Not Bad');
        return;
    }
    //
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var rows;
    await new Promise(function(resolve, reject) {
        var sql = `SELECT visit FROM ANALYZER_tbl WHERE ip = ? ORDER BY idx DESC LIMIT 0, 1`;
        db.query(sql, ip, function(err, rows, fields) {
            if (!err) {
                resolve(rows);
            }
        });
    }).then(function(data){
        rows = data;
    });

    await new Promise(function(resolve, reject) {
        var sql = `INSERT INTO ANALYZER_tbl SET ip = ?, agent = ?, visit = ?, created = NOW()`;
        if (rows.length > 0) {
            var cnt = rows[0].visit + 1;
            db.query(sql, [ip, req.headers['user-agent'], cnt], function(err, rows, fields) {
                resolve(cnt);
            });
        } else {
            db.query(sql, [ip, req.headers['user-agent'], 1], function(err, rows, fields) {
                resolve(1);
            });
        }
    }).then(function(data) {
        console.log(data);
    });

    //현재 접속자 파일 생성
    var memo = new Date().getTime() + "|S|" + req.baseUrl + req.path;
    fs.writeFile('./liveuser/'+ip, memo, function(err) {
        console.log(memo);
    });
    //
    next();
}

router.get('/', setLog, async function(req, res, next) {
    var arr = [];
    await new Promise(function(resolve, reject) {
        const sql = `SELECT name1 FROM JAELYO_tbl ORDER BY name1 ASC`;
        db.query(sql, function(err, rows, fields) {
            console.log(rows);
            if (!err) {
                resolve(rows);
            } else {
                console.log(err);
                resolve(err);
            }
        });
    }).then(async function(data) {
        for (obj of await utils.nvl(data)) {
            arr.push(obj.name1);
        }
    });
    res.send(arr);
});

// http://localhost:3001/jaelyo/get_rcp_result?token=kkyyhh&j0=감자&j1=간마늘&j2=고추장
router.get('/get_rcp_result', setLog, async function(req, res, next) {
    const { j0, j1, j2 } = req.query;
    var resultArr = [];
    var seq = -1;
    var resultObj = {};
    var sql = `
        SELECT
        idx,
        title,
        filename0,
        (SELECT name1 FROM BLOGER_tbl WHERE idx = A.writer_idx) as writer_name
        FROM RCP_tbl as A WHERE jaelyo `;

    if (j0 != '' && j1 != '' && j2 != '') {
        await new Promise(function(resolve, reject) {
            sql0 = `${sql} LIKE '%${j0}%' AND jaelyo LIKE '%${j1}%' AND jaelyo LIKE '%${j2}%' `;
            db.query(sql0, function(err, rows, fields) {
                // console.log(rows);
                if (!err) {
                    resolve(rows);
                } else {
                    console.log(err);
                    resolve(err);
                }
            });
        }).then(async function(data) {
            var rs = await utils.nvl(data);
            seq++;
            eval("resultObj.arr" + seq + " = rs");
        });
    }

    if (j0 != '' && j1 != '') {
        await new Promise(function(resolve, reject) {
            sql0 = `${sql} LIKE '%${j0}%' AND jaelyo LIKE '%${j1}%' `;
            db.query(sql0, function(err, rows, fields) {
                // console.log(rows);
                if (!err) {
                    resolve(rows);
                } else {
                    console.log(err);
                    resolve(err);
                }
            });
        }).then(async function(data) {
            var rs = await utils.nvl(data);
            seq++;
            eval("resultObj.arr" + seq + " = rs");
        });
    }

    await new Promise(function(resolve, reject) {
        sql0 = `${sql} LIKE '%${j0}%' `;
        db.query(sql0, function(err, rows, fields) {
            // console.log(rows);
            if (!err) {
                resolve(rows);
            } else {
                console.log(err);
                resolve(err);
            }
        });
    }).then(async function(data) {
        var rs = await utils.nvl(data);
        seq++;
        eval("resultObj.arr" + seq + " = rs");
    });

    res.send(resultObj);
});

router.get('/extra', async function(req, res, next) {

    var arr = [];
    await new Promise(function(resolve, reject) {
        const sql = `SELECT idx, jaelyo FROM RCP_tbl WHERE cate1 != '' AND cate2 != '' ORDER BY IDX DESC LIMIT 0, 100`;
        db.query(sql, function(err, rows, fields) {
            // console.log(rows);
            if (!err) {
                resolve(rows);
            } else {
                console.log(err);
                resolve(err);
            }
        });
    }).then(async function(data) {
        for (obj of await utils.nvl(data)) {
            var tmpArr = obj.jaelyo.split('\n');
            for (obj2 of tmpArr) {
                if (obj2.indexOf('*') >= 0) {
                    console.log(obj2);
                } else {
                    var tmp = obj2.split(' ');
                    var tmp1 = tmp[0].split('(');
                    var tmp2 = replaceAll(tmp1[0], '스테이크용', '');

                    tmp2 = replaceAll(tmp2, '굵은', '');
                    tmp2 = replaceAll(tmp2, '고운', '');
                    tmp2 = replaceAll(tmp2, '스틱', '');
                    tmp2 = replaceAll(tmp2, '껍질깐', '');
                    tmp2 = replaceAll(tmp2, '분절', '');
                    tmp2 = replaceAll(tmp2, '밑간한', '');
                    tmp2 = replaceAll(tmp2, '간', '');
                    tmp2 = replaceAll(tmp2, '달걀물', '');
                    tmp2 = replaceAll(tmp2, '달걀지단', '');
                    tmp2 = replaceAll(tmp2, '정육', '');
                    tmp2 = replaceAll(tmp2, '국거리용', '');
                    tmp2 = replaceAll(tmp2, '각종채소', '');
                    tmp2 = replaceAll(tmp2, '각종버섯', '');

                    tmp2 = replaceAll(tmp2, '불고기용', '');
                    tmp2 = replaceAll(tmp2, '양념한', '');
                    tmp2 = replaceAll(tmp2, '재워둔', '');
                    tmp2 = replaceAll(tmp2, '잡채용', '');
                    tmp2 = replaceAll(tmp2, '국수장국건더기', '');
                    tmp2 = replaceAll(tmp2, '국수장국', '');
                    tmp2 = replaceAll(tmp2, '슬라이스', '');
                    tmp2 = replaceAll(tmp2, '간돼지고기', '돼지고기');
                    tmp2 = replaceAll(tmp2, '김치만두소', '만두');

                    if (tmp2 != '') {
                        arr.push(tmp2);
                    }
                }
            }
        }
    });

    const set = new Set(arr);
    const uniqueArr = [...set];

    //중복제거!
    // const set = new Set(arr);
    // const uniqueArr = [...set];
    // var non_duplidated_data = removeDuplicates(arr, 'name1');

    await new Promise(function(resolve, reject) {
        const sql = `DELETE FROM JAELYO_tbl`;
        db.query(sql, function(err, rows, fields) {
            if (!err) {
                resolve(rows);
            } else {
                console.log(err);
                resolve(err);
            }
        });
    }).then();

    var j = 0;
    for (name1 of uniqueArr) {
        await new Promise(function(resolve, reject) {
            const sql = `INSERT INTO JAELYO_tbl SET name1 = ?`;
            console.log(sql, name1);
            db.query(sql, name1, function(err, rows, fields) {
                if (!err) {
                    resolve(rows);
                } else {
                    console.log(err);
                    resolve(err);
                }
            });
        }).then();
        j++;
    }

    res.send(`insert: ${j}`);
});


function removeDuplicates(originalArray, prop) {
     var newArray = [];
     var lookupObject  = {};
     for(var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
     }
     for(i in lookupObject) {
         newArray.push(lookupObject[i]);
     }
      return newArray;
 }

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}


module.exports = router;
