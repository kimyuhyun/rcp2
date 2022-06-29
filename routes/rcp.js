const express = require('express');
const router = express.Router();
const db = require('../db');
const utils = require('../Utils');
const menus = require('../menu');
const { data } = require('cheerio/lib/api/attributes');

global.menus = menus;
global.showMenuLinkArr;

async function checking(req, res, next) {
    if (!req.session.mid) {
        res.redirect('/adm/login');
        return;
    }

    var sql = `SELECT show_menu_link FROM GRADE_tbl WHERE level1 = ?`;
    var params = [req.session.level1];
    var arr = await utils.queryResult(sql, params);
    console.log(arr[0].show_menu_link);
    if (arr) {
        showMenuLinkArr = arr[0].show_menu_link.substr(1, 9999).split(',');
    }
    next();
}

router.get('/:page/:menu1/:menu2', checking, async function(req, res, next) {
    var { page, menu1, menu2 } = req.params;
    var s_column = req.query.s_column;
    var s_value = req.query.s_value;
    var orderby = req.query.orderby;

    var where = ` WHERE 1=1 `;
    var records = [];

    if (s_value) {
        where += ` AND ${s_column} LIKE ? `;
        records.push(`%${s_value}%`);
    } else {
        s_column = '';
        s_value = '';
    }

    if (orderby) {
        if (orderby.toLowerCase().includes('delete') || orderby.toLowerCase().includes('update') || orderby.toLowerCase().includes('select')) {
            console.log('err', orderby);
            res.send(orderby);
            return;
        }
    } else {
        orderby = ' idx DESC ';
    }

    var sql = `SELECT COUNT(*) as cnt FROM RCP_tbl ${where}`;
    var arr = await utils.queryResult(sql, records);
    const pageHeler = utils.pageHelper(page, arr[0].cnt);

    records.push(pageHeler.skipSize);
    records.push(pageHeler.contentSize);

    sql = ` SELECT idx, is_ios, title, filename0, created, modified FROM RCP_tbl ${where} ORDER BY ${orderby} LIMIT ?, ? `;
    arr = await utils.queryResult(sql, records);

    console.log(sql, records);
    var list = [];
    for (row of arr) {
        row.created = utils.utilConvertToMillis(row.created);
        row.modified = utils.utilConvertToMillis(row.modified);
        list.push(row);
    }

    var data = pageHeler;
    data.orderby = orderby;
    data.s_column = s_column;
    data.s_value = s_value;
    data.list = list;

    res.render('./adm/rcp.html', {
        myinfo: req.session,
        menu1: req.params.menu1,
        menu2: req.params.menu2,
        data,
    });

});

router.get('/write', checking, async function(req, res, next) {
    const idx = req.query.idx;
    const return_url = req.query.return_url;
    
    var row = {};
    
    if (idx) {
        var sql = ` SELECT * FROM RCP_tbl WHERE idx = ? `;
        var params = [idx];
        var arr = await utils.queryResult(sql, params);
        row = arr[0];
    }

    console.log(row);

    //category 불러오기!
    sql = ` SELECT name1 FROM CATEGORYS_tbl WHERE gbn = 'cate1' ORDER BY sort1 ASC `;
    var cate1List = await utils.queryResult(sql, []);

    sql = ` SELECT name1 FROM CATEGORYS_tbl WHERE gbn = 'cate2' ORDER BY sort1 ASC `;
    var cate2List = await utils.queryResult(sql, []);

    sql = ` SELECT name1 FROM CATEGORYS_tbl WHERE gbn = 'cate3' ORDER BY sort1 ASC `;
    var cate3List = await utils.queryResult(sql, []);

    sql = ` SELECT name1 FROM CATEGORYS_tbl WHERE gbn = 'cate4' ORDER BY sort1 ASC `;
    var cate4List = await utils.queryResult(sql, []);

    sql = ` SELECT name1 FROM CATEGORYS_tbl WHERE gbn = 'cate5' ORDER BY sort1 ASC `;
    var cate5List = await utils.queryResult(sql, []);
    //

    //크리에이터 불러오기!
    sql = ` SELECT idx, name1 FROM BLOGER_tbl ORDER BY idx ASC `;
    var writerList = await utils.queryResult(sql, []);


    res.render('./adm/rcp_write.html', {
        myinfo: req.session,
        return_url,
        row,
        cate1List,
        cate2List,
        cate3List,
        cate4List,
        cate5List,
        writerList,
    });
});


router.get('/bloger/:page/:menu1/:menu2', checking, async function(req, res, next) {
    var { page, menu1, menu2 } = req.params;
    var search = req.query.search;
    var orderby = req.query.orderby;

    var where = ` WHERE 1=1 `;
    var records = [];
    
    if (search) {
        where += ` AND name1 LIKE ? `;
        records.push(`%${search}%`);
    } else {
        search = '';
    }

    if (!orderby) {
        orderby = ` idx DESC `;
    }

    var sql = `SELECT COUNT(*) as cnt FROM BLOGER_tbl ${where}`;
    var arr = await utils.queryResult(sql, records);

    const pageHeler = utils.pageHelper(page, arr[0].cnt);

    records.push(pageHeler.skipSize);
    records.push(pageHeler.contentSize);

    sql = ` SELECT * FROM BLOGER_tbl ${where} ORDER BY ${orderby} LIMIT ?, ? `;
    arr = await utils.queryResult(sql, records);
    console.log(sql, records);
    var list = [];
    for (row of arr) {
        row.created = utils.utilConvertToMillis(row.created);
        row.modified = utils.utilConvertToMillis(row.modified);
        list.push(row);
    }

    var data = pageHeler;
    data.orderby = orderby;
    data.search = search;
    data.list = list;

    res.render(`./adm/bloger.html`, {
        myinfo: req.session,
        menu1: req.params.menu1,
        menu2: req.params.menu2,
        data,
    });

});

router.get('/bloger/write', checking, async function(req, res, next) {
    const idx = req.query.idx;
    const return_url = req.query.return_url;
    
    var row = {};
    
    if (idx) {
        var sql = `SELECT * FROM BLOGER_tbl WHERE idx = ?`;
        var params = [idx];
        var arr = await utils.queryResult(sql, params);
        row = arr[0];
    }
    
    res.render(`./adm/bloger_write.html`, {
        myinfo: req.session,
        return_url,
        row,
    });
});

router.get('/category/:gbn/:page/:menu1/:menu2', checking, async function(req, res, next) {
    var { page, gbn, menu1, menu2 } = req.params;

    var sql = `SELECT COUNT(*) as cnt FROM CATEGORYS_tbl WHERE gbn = ?`;
    var arr = await utils.queryResult(sql, [gbn]);

    const pageHeler = utils.pageHelper(page, arr[0].cnt);
    
    var sql = ` SELECT * FROM CATEGORYS_tbl WHERE gbn = ? ORDER BY sort1 ASC  LIMIT ?, ? `;
    var arr = await utils.queryResult(sql, [gbn, pageHeler.skipSize, pageHeler.contentSize]);
    var list = [];
    for (row of arr) {
        row.created = utils.utilConvertToMillis(row.created);
        row.modified = utils.utilConvertToMillis(row.modified);
        list.push(row);
    }

    var data = pageHeler;
    data.list = list;
    data.gbn = gbn;
    
    res.render(`./adm/categorys.html`, {
        myinfo: req.session,
        menu1: req.params.menu1,
        menu2: req.params.menu2,
        data,
    });

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
