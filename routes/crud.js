const express = require('express');
const router = express.Router();
const fs = require('fs')
const db = require('../db');
const utils = require('../Utils');
const FormData = require('form-data');
const axios = require('axios');

async function checking(req, res, next) {
    if (!req.session.mid) {
        res.redirect('/adm/login');
        return;
    }
    next();
}

router.get('/write', checking, async function(req, res, next) {
    var { idx, return_url, table, view, board_id, gbn } = req.query;
    
    var row = {};
    
    if (idx) {
        var sql = `SELECT * FROM ?? WHERE idx = ?`;
        var params = [table, idx];
        var arr = await utils.queryResult(sql, params);
        row = arr[0];
        console.log(sql, params);
    }

    if (board_id) {
        row.board_id = board_id;
    }

    if (gbn) {
        row.gbn = gbn;
    }

    
    res.render(`./adm/${view}_write.html`, {
        myinfo: req.session,
        return_url,
        row,
    });
});

router.post('/write', checking, async function(req, res, next) {
    const return_url = req.body.return_url;
    const table = req.query.table;
    const idx = req.body.idx;
    delete req.body.idx;
    delete req.body.return_url;
    
    var isDateColnumn = true;

    //날짜 컬럼이 있는지 확인!
    var sql = `SHOW COLUMNS FROM ${table} LIKE 'created'`;
    var arr = await utils.queryResult(sql, []);
    if (!arr[0]) {
        isDateColnumn = false;
    }
    
    sql = '';
    var records = [];

    for (key in req.body) {
        if (req.body[key] != 'null') {
            if (key == 'pass1') {
                if (req.body[key]) {
                    sql += key + '= PASSWORD(?), ';
                    records.push(req.body[key]);
                }
            } else {
                sql += key + '= ?, ';
                records.push(req.body[key]);
            }
        }
    }

    if (idx) {
        records.push(idx);
        if (isDateColnumn) {
            sql = `UPDATE ${table} SET ${sql} modified = NOW() WHERE idx = ?`;
        } else {
            sql = `UPDATE ${table} SET ${sql.slice(0, -2)}  WHERE idx = ?`;
        }
    } else {
        if (isDateColnumn) {
            sql = `INSERT INTO ${table} SET ${sql} created = NOW(), modified = NOW()`;
        } else {
            sql = `INSERT INTO ${table} SET ${sql.slice(0, -2)}`;
        }
    }

    console.log(`@@@@ ${sql}`, records);

    var rs = await utils.queryResult(sql, records);

    if (return_url) {
        res.redirect(return_url);
    } else {
        res.send(rs);
    }

    
    
});

router.get('/delete', checking, async function(req, res, next) {
    const return_url = req.query.return_url;
    const table = req.query.table;
    const idxArr = req.query.idx;
    
    for (idx of idxArr) {
        console.log(idx);
        db.query(`DELETE FROM ${table} WHERE idx = ?`, idx);
    }

    if (return_url) {
        res.redirect(return_url);
    } else {
        res.send('1');
    }

    
});


router.get('/add_code', checking, async function(req, res, next) {
    const return_url = req.query.return_url;
    const parentCode = req.query.code1;
    const codeLength = parentCode.length;
    var code = '';
    var sort = 0;

    var sql = '';
    if (parentCode == 'root') {
        sql = ` SELECT code1, sort1 FROM CODES_tbl WHERE LENGTH(code1) = 2 ORDER BY code1 DESC LIMIT 0, 1`;
    } else {
        sql = ` SELECT code1, sort1 FROM CODES_tbl WHERE LEFT(code1, ${codeLength}) = ? AND LENGTH(code1) = ${codeLength+2} ORDER BY code1 DESC LIMIT 0, 1`;
    }
    console.log(sql, parentCode);

    var arr = await utils.queryResult(sql, [parentCode]);
    var data = arr[0];
    if (data) {
        console.log(data.code1.length);
        if (data.code1.length == 2) {
            sort = 999;
            code = eval(data.code1) + 1;
            if (code < 10) {
                code = `0${code}`;
            }
            db.query(`INSERT INTO CODES_tbl SET code1 = ?, name1 = ?, sort1 = ?`, [code, code, sort]);

        } else if (data.code1.length == 4) {
            sort = eval(data.sort1) - 1;
            code = data.code1.substr(2, 2);
            code = eval(code) + 1;
            if (code < 10) {
                code = `0${code}`;
            }
            code = `${parentCode}${code}`;
            db.query(`INSERT INTO CODES_tbl SET code1 = ?, name1 = ?, sort1 = ?`, [code, code, sort]);
        } else if (data.code1.length == 6) {
            sort = eval(data.sort1) - 1;
            code = data.code1.substr(4, 2);
            code = eval(code) + 1;
            if (code < 10) {
                code = `0${code}`;
            }
            code = `${parentCode}${code}`;
            db.query(`INSERT INTO CODES_tbl SET code1 = ?, name1 = ?, sort1 = ?`, [code, code, sort]);
        }
    } else {
        if (parentCode == 'root') {
            sort = 999;
            code = '01';
        } else if (parentCode.length == 2) {
            sort = 999;
            code = `${parentCode}01`;
        } else if (parentCode.length == 4) {
            sort = 999;
            code = `${parentCode}01`;
        } else {
            return;
        }
        db.query(`INSERT INTO CODES_tbl SET code1 = ?, name1 = ?, sort1 = ?`, [code, code, sort]);
    }

    res.redirect(return_url);
});


module.exports = router;
