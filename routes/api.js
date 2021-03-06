const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const db = require('../db');
const utils = require('../Utils');
const moment = require('moment');

async function setLog(req, res, next) {
    //토큰 검증 한다!!!
    if (req.query.token != process.env.TOKEN) {
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

    //4분이상 것들 삭제!!
    fs.readdir('./liveuser', async function(err, filelist) {
        for (file of filelist) {
            await new Promise(function(resolve, reject) {
                fs.readFile('./liveuser/' + file, 'utf8', function(err, data) {
                    resolve(data);
                });
            }).then(function(data) {
                try {
                    if (file != 'dummy') {
                        var tmp = data.split('|S|');
                        console.log(data);
                        moment.tz.setDefault("Asia/Seoul");
                        var connTime = moment.unix(tmp[0] / 1000).format('YYYY-MM-DD HH:mm');
                        var minDiff = moment.duration(moment(new Date()).diff(moment(connTime))).asMinutes();
                        if (minDiff > 4) {
                            console.log(minDiff);
                            fs.unlink('./liveuser/' + file, function(err) {
                                console.log(err);
                            });
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            });
        }
    });

    //현재 접속자 파일 생성
    var memo = new Date().getTime() + "|S|" + req.baseUrl + req.path;
    fs.writeFile('./liveuser/'+ip, memo, function(err) {
        console.log(memo);
    });
    //
    next();
}

router.get('/home', setLog, async function(req, res, next) {
    var arr = {};

    var sql = `
        SELECT
        A.idx,
        A.title,
        A.filename0,
        (SELECT name1 FROM BLOGER_tbl WHERE idx = A.writer_idx) as writer_name,
        (SELECT thumb FROM BLOGER_tbl WHERE idx = A.writer_idx) as writer_thumb
        FROM RCP_tbl as A
        ORDER BY RAND() LIMIT 0, 10
    `;
    var params = [];
    arr.recommend = await utils.queryResult(sql, params);

    var sql = `
        SELECT
            count(*) as cnt,
            A.rcp_idx,
            B.idx,
            B.title,
            B.filename0,
            (SELECT name1 FROM BLOGER_tbl WHERE idx = B.writer_idx) as writer_name,
            (SELECT thumb FROM BLOGER_tbl WHERE idx = B.writer_idx) as writer_thumb
        FROM RCP_SEE_tbl as A, RCP_tbl as B
        WHERE A.rcp_idx = B.idx
        GROUP BY rcp_idx
        ORDER BY cnt DESC
        LIMIT 0, 6
    `;
    var params = [];
    arr.see = await utils.queryResult(sql, params);

    var sql = `
        SELECT
            count(*) as cnt,
            A.rcp_idx,
            B.idx,
            B.title,
            B.filename0,
            (SELECT name1 FROM BLOGER_tbl WHERE idx = B.writer_idx) as writer_name,
            (SELECT thumb FROM BLOGER_tbl WHERE idx = B.writer_idx) as writer_thumb
        FROM RCP_FAV_tbl as A, RCP_tbl as B
        WHERE A.rcp_idx = B.idx
        GROUP BY rcp_idx
        ORDER BY cnt DESC
        LIMIT 0, 6
    `;
    var params = [];
    arr.fav = await utils.queryResult(sql, params);


    res.send(arr);
});





router.get('/home2', setLog, async function(req, res, next) {
    var arr = {};

    var sql = `
        SELECT
            count(*) as cnt,
            A.rcp_idx,
            B.idx,
            B.title,
            B.filename0,
            (SELECT name1 FROM BLOGER_tbl WHERE idx = B.writer_idx) as writer_name,
            (SELECT thumb FROM BLOGER_tbl WHERE idx = B.writer_idx) as writer_thumb
        FROM RCP_SEE_tbl as A, RCP_tbl as B
        WHERE A.rcp_idx = B.idx
        GROUP BY rcp_idx
        ORDER BY cnt DESC
        LIMIT 0, 6
    `;
    var params = [];
    arr.trend = await utils.queryResult(sql, params);

    var sql = `
        SELECT
            A.idx,
            A.title,
            A.filename0,
            (SELECT name1 FROM BLOGER_tbl WHERE idx = A.writer_idx) as writer_name,
            (SELECT thumb FROM BLOGER_tbl WHERE idx = A.writer_idx) as writer_thumb
        FROM RCP_tbl as A
        ORDER BY A.idx DESC
        LIMIT 0, 6
    `;
    var params = [];
    arr.recent = await utils.queryResult(sql, params);

    var sql = `
        SELECT
            idx,
            '' as title,
            '' as filename0,
            name1 as writer_name,
            thumb as writer_thumb
        FROM BLOGER_tbl
        ORDER BY idx DESC
    `;
    var params = [];
    arr.writers = await utils.queryResult(sql, params);


    res.send(arr);
});


router.get('/detail/:id/:idx', setLog, async function(req, res, next) {
    const id = req.params.id;
    const idx = req.params.idx;
    var obj = {};
    var cnt = 0;

    //조회수 업데이트!
    await new Promise(function(resolve, reject) {
        const sql = `SELECT COUNT(*) as cnt FROM RCP_SEE_tbl WHERE id = ? AND rcp_idx = ?`;
        db.query(sql, [id, idx], function(err, rows, fields) {
            if (!err) {
                resolve(rows[0]);
            } else {
                console.log(err);
            }
        });
    }).then(function(data) {
        cnt = data.cnt;
    });

    if (cnt == 0) {
        const sql = `INSERT INTO RCP_SEE_tbl SET id = ?, rcp_idx = ?`;
        db.query(sql, [id, idx]);
    }
    //

    await new Promise(function(resolve, reject) {
        const sql = `
            SELECT
            A.*,
            (SELECT name1 FROM BLOGER_tbl WHERE idx = A.writer_idx) as writer_name,
            (SELECT thumb FROM BLOGER_tbl WHERE idx = A.writer_idx) as writer_thumb,
            (SELECT url FROM BLOGER_tbl WHERE idx = A.writer_idx) as writer_url,
            (SELECT COUNT(*) FROM RCP_FAV_tbl WHERE id = ? AND rcp_idx = A.idx) as is_fav
            FROM RCP_tbl as A
            WHERE A.idx = ?
        `;
        db.query(sql, [id, idx], function(err, rows, fields) {
            // console.log(rows);
            if (!err) {
                resolve(rows[0]);
            } else {
                console.log(err);
            }
        });
    }).then(async function(data) {
        obj = await utils.nvl(data);
    });
    res.send(obj);
});

router.get('/set_fav/:id/:idx', setLog, async function(req, res, next) {
    const id = req.params.id;
    const idx = req.params.idx;
    var obj = {};
    var cnt = 0;

    await new Promise(function(resolve, reject) {
        const sql = `SELECT COUNT(*) as cnt FROM RCP_FAV_tbl WHERE id = ? AND rcp_idx = ?`;
        db.query(sql, [id, idx], function(err, rows, fields) {
            if (!err) {
                resolve(rows[0]);
            } else {
                console.log(err);
            }
        });
    }).then(function(data) {
        cnt = data.cnt;
    });

    var sql = ``;
    if (cnt == 0) {
        sql = `INSERT INTO RCP_FAV_tbl SET id = ?, rcp_idx = ?`;
        res.send({ code: 1 });
    } else {
        sql = `DELETE FROM RCP_FAV_tbl WHERE id = ? AND rcp_idx = ?`;
        res.send({ code: 0 });
    }
    db.query(sql, [id, idx]);
    //
});

router.get('/get_fav/:id', setLog, async function(req, res, next) {
    const id = req.params.id;
    var arr = [];

    await new Promise(function(resolve, reject) {
        const sql = `
            SELECT
            A.idx,
            A.title,
            A.filename0,
            (SELECT name1 FROM BLOGER_tbl WHERE idx = A.writer_idx) as writer_name,
            (SELECT thumb FROM BLOGER_tbl WHERE idx = A.writer_idx) as writer_thumb
            FROM
            RCP_tbl as A, RCP_FAV_tbl as B
            WHERE A.idx = B.rcp_idx
            AND B.id = ?
            ORDER BY B.idx DESC
            `;
        db.query(sql, id, function(err, rows, fields) {
            if (!err) {
                resolve(rows);
            } else {
                console.log(err);
            }
        });
    }).then(async function(data) {
        arr = await utils.nvl(data);
    });

    res.send(arr);
});

router.get('/get_category/:gbn', setLog, async function(req, res, next) {
    const gbn = req.params.gbn;
    var arr = [];
    await new Promise(function(resolve, reject) {
        const sql = `SELECT name1 FROM CATEGORYS_tbl WHERE gbn = ? ORDER BY sort1 ASC`;
        db.query(sql, gbn, function(err, rows, fields) {
            if (!err) {
                resolve(rows);
            } else {
                console.log(err);
                resolve(err);
            }
        });
    }).then(async function(data) {
        arr = await utils.nvl(data);
    });
    res.send(arr);
});


router.get('/get_category_in_list', setLog, async function(req, res, next) {
    const cate = req.query.cate;
    var arr = [];
    await new Promise(function(resolve, reject) {
        const sql = `
            SELECT
                count(*) as cnt,
                B.idx,
                B.title,
                B.filename0,
                (SELECT name1 FROM BLOGER_tbl WHERE idx = B.writer_idx) as writer_name
            FROM RCP_SEE_tbl as A, RCP_tbl as B
            WHERE A.rcp_idx = B.idx
            AND B.cate1 = ?
            GROUP BY rcp_idx
            ORDER BY cnt DESC
            LIMIT 0, 6
        `;
        db.query(sql, cate, function(err, rows, fields) {
            if (!err) {
                resolve(rows);
            } else {
                console.log(err);
                resolve(err);
            }
        });
    }).then(async function(data) {
        arr = await utils.nvl(data);
    });
    res.send(arr);
});


router.get('/get_categorys', setLog, async function(req, res, next) {

    var arr = {};

    const gbns = ['cate1', 'cate2', 'cate3', 'cate4', 'cate5'];

    for (gbn of gbns) {
        await new Promise(function(resolve, reject) {
            const sql = `SELECT name1 FROM CATEGORYS_tbl WHERE gbn = ? ORDER BY sort1 ASC`;
            db.query(sql, gbn, function(err, rows, fields) {
                // console.log(rows);
                if (!err) {
                    resolve(rows);
                } else {
                    console.log(err);
                    resolve(err);
                }
            });
        }).then(function(data) {
            var array = [];
            for (obj of data) {
                array.push(obj.name1);
            }
            arr[gbn] = array;
        });
    }
    res.send(arr);
});

router.get('/get_list/:page', setLog, async function(req, res, next) {
    const { writer_idx, q, cate1, cate2, cate3, cate4, cate5 } = req.query;
    const page = req.params.page * 20;

    var arr = [];
    await new Promise(function(resolve, reject) {
        var sql = `
            SELECT
            A.idx,
            A.title,
            A.filename0,
            (SELECT name1 FROM BLOGER_tbl WHERE idx = A.writer_idx) as writer_name,
            (SELECT thumb FROM BLOGER_tbl WHERE idx = A.writer_idx) as writer_thumb
            FROM
            RCP_tbl as A
            WHERE 1=1
        `;

        var records = [];

        if (writer_idx != '') {
            sql += ' AND writer_idx = ? ';
            records.push(writer_idx);
        }

        if (q != '') {
            const query = '%' + q + '%';
            sql += ' AND (title LIKE ? OR jaelyo LIKE ?) ';
            records.push(query);
            records.push(query);
        }

        if (cate1 != '') {
            sql += ' AND cate1 = ? ';
            records.push(cate1);
        }

        if (cate2 != '') {
            sql += ' AND cate2 = ? ';
            records.push(cate2);
        }

        if (cate3 != '') {
            sql += ' AND cate3 = ? ';
            records.push(cate3);
        }

        if (cate4 != '') {
            sql += ' AND cate4 = ? ';
            records.push(cate4);
        }

        if (cate5 != '') {
            sql += ' AND cate5 = ? ';
            records.push(cate5);
        }

        sql += ` ORDER BY A.idx DESC LIMIT ${page}, 20 `;
// console.log(sql, records);
        db.query(sql, records, function(err, rows, fields) {
            // console.log(rows);
            if (!err) {
                resolve(rows);
            } else {
                console.log(err);
                resolve(err);
            }
        });
    }).then(async function(data) {
        arr = await utils.nvl(data);
    });

    res.send(arr);
});


router.get('/get_list2/:page', setLog, async function(req, res, next) {
    const page = req.params.page * 20;
    const orderby = req.query.orderby;
    var arr = [];

    var sql = `
        SELECT
            count(*) as cnt,
            A.rcp_idx,
            B.idx,
            B.title,
            B.filename0,
            (SELECT name1 FROM BLOGER_tbl WHERE idx = B.writer_idx) as writer_name,
            (SELECT thumb FROM BLOGER_tbl WHERE idx = B.writer_idx) as writer_thumb
        FROM RCP_SEE_tbl as A, RCP_tbl as B
        WHERE A.rcp_idx = B.idx
        GROUP BY rcp_idx
        ${orderby}
        LIMIT ?, 20
    `;
    var params = [page];
    arr = await utils.queryResult(sql, params);
    res.send(arr);
});




router.get('/get_bloger_list', setLog, async function(req, res, next) {
    var arr = [];
    await new Promise(function(resolve, reject) {
        const sql = `SELECT idx, name1, thumb FROM BLOGER_tbl ORDER BY modified DESC`;
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
        arr = await utils.nvl(data);
    });
    res.send(arr);
});

router.get('/get_bloger_and_category_list', setLog, async function(req, res, next) {
    var arr = [];

    await new Promise(function(resolve, reject) {
        const sql = `SELECT idx, name1, true as is_cate FROM CATEGORYS_tbl WHERE gbn = 'cate1' ORDER BY sort1 ASC`;
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
        arr = await utils.nvl(data);
    });

    await new Promise(function(resolve, reject) {
        const sql = `SELECT idx, name1, false as is_cate FROM BLOGER_tbl ORDER BY modified DESC`;
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
            arr.push(obj);
        }
    });
    res.send(arr);
});


router.get('/get_notice', setLog, async function(req, res, next) {
    res.send({
        notice: '',
        link: '',
    });
});



router.get('/', setLog, async function(req, res, next) {

    // var arr = [];
    // await new Promise(function(resolve, reject) {
    //     const sql = ``;
    //     db.query(sql, function(err, rows, fields) {
    //         console.log(rows);
    //         if (!err) {
    //             resolve(rows);
    //         } else {
    //             console.log(err);
    //             resolve(err);
    //         }
    //     });
    // }).then(async function(data) {
    //     arr = await utils.nvl(data);
    // });
    //
    res.send('api');
});



module.exports = router;
