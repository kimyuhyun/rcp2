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

    var sql2 = '';

    if (j0 != '' && j1 != '' && j2 != '') {
        sql2 = `${sql} LIKE '%${j0}%' AND jaelyo LIKE '%${j1}%' AND jaelyo LIKE '%${j2}%' `;
        var arr = await utils.queryResult(sql2, null);
        resultObj.arr0 = arr;

        sql2 = `${sql} LIKE '%${j0}%' AND jaelyo LIKE '%${j1}%' `;
        var arr = await utils.queryResult(sql2, null);
        resultObj.arr1 = arr;

        sql2 = `${sql} LIKE '%${j0}%' AND jaelyo LIKE '%${j2}%' `;
        var arr = await utils.queryResult(sql2, null);
        resultObj.arr2 = arr;

        sql2 = `${sql} LIKE '%${j1}%' AND jaelyo LIKE '%${j2}%' `;
        var arr = await utils.queryResult(sql2, null);
        resultObj.arr3 = arr;

        sql2 = `${sql} LIKE '%${j0}%' `;
        var arr = await utils.queryResult(sql2, null);
        resultObj.arr4 = arr;

        sql2 = `${sql} LIKE '%${j1}%' `;
        var arr = await utils.queryResult(sql2, null);
        resultObj.arr5 = arr;

        sql2 = `${sql} LIKE '%${j2}%' `;
        var arr = await utils.queryResult(sql2, null);
        resultObj.arr6 = arr;


    } else if (j0 != '' && j1 != '') {
        sql2 = `${sql} LIKE '%${j0}%' AND jaelyo LIKE '%${j1}%' `;
        var arr = await utils.queryResult(sql2, null);
        resultObj.arr0 = arr;

        sql2 = `${sql} LIKE '%${j0}%' `;
        var arr = await utils.queryResult(sql2, null);
        resultObj.arr1 = arr;

        sql2 = `${sql} LIKE '%${j1}%' `;
        var arr = await utils.queryResult(sql2, null);
        resultObj.arr2 = arr;
    } else {
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
    }

    res.send(resultObj);
});

router.get('/extra', async function(req, res, next) {

    var arr = [];
    await new Promise(function(resolve, reject) {
        const sql = `SELECT idx, jaelyo FROM RCP_tbl WHERE cate1 != '' AND cate2 != '' AND writer_idx IN (3,4) ORDER BY IDX DESC `;
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
                    var tmp2 = replaceAll(tmp1[0], '\r', '');

                    tmp2 = replaceAll(tmp2, ' ', '');

                    tmp2 = replaceAll(tmp2, '스테이크용', '');
                    tmp2 = replaceAll(tmp2, '굵은', '');
                    tmp2 = replaceAll(tmp2, '갈은', '');
                    tmp2 = replaceAll(tmp2, '감미료', '');
                    tmp2 = replaceAll(tmp2, '고들빼기', '');
                    tmp2 = replaceAll(tmp2, '기름', '');
                    tmp2 = replaceAll(tmp2, 'LA갈비', '');
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
                    tmp2 = replaceAll(tmp2, '뚝배기', '');
                    tmp2 = replaceAll(tmp2, '불린', '');
                    tmp2 = replaceAll(tmp2, '삷은', '');
                    tmp2 = replaceAll(tmp2, '사천', '');
                    tmp2 = replaceAll(tmp2, '신', '');
                    tmp2 = replaceAll(tmp2, '쌀뜨물', '');
                    tmp2 = replaceAll(tmp2, '짠지', '');
                    tmp2 = replaceAll(tmp2, '코코넛밀크음료', '');
                    tmp2 = replaceAll(tmp2, '갈비탕', '');
                    tmp2 = replaceAll(tmp2, '불고기용', '');
                    tmp2 = replaceAll(tmp2, '양념한', '');
                    tmp2 = replaceAll(tmp2, '재워둔', '');
                    tmp2 = replaceAll(tmp2, '잡채용', '');
                    tmp2 = replaceAll(tmp2, '국수장국건더기', '');
                    tmp2 = replaceAll(tmp2, '국수장국', '');
                    tmp2 = replaceAll(tmp2, '슬라이스', '');
                    tmp2 = replaceAll(tmp2, '후주', '');
                    tmp2 = replaceAll(tmp2, '기본쌈장', '');
                    tmp2 = replaceAll(tmp2, '다진', '');
                    tmp2 = replaceAll(tmp2, '땅콩가루', '');
                    tmp2 = replaceAll(tmp2, '으깬', '');
                    tmp2 = replaceAll(tmp2, '인삼농축액', '');
                    tmp2 = replaceAll(tmp2, '일반', '');
                    tmp2 = replaceAll(tmp2, '작은', '');
                    tmp2 = replaceAll(tmp2, '잘게썬', '');
                    tmp2 = replaceAll(tmp2, '재첩국', '');
                    tmp2 = replaceAll(tmp2, '저당두유', '');
                    tmp2 = replaceAll(tmp2, '중국', '');
                    tmp2 = replaceAll(tmp2, '중', '');
                    tmp2 = replaceAll(tmp2, '진장', '');
                    tmp2 = replaceAll(tmp2, '집장', '');
                    tmp2 = replaceAll(tmp2, '찬', '');
                    tmp2 = replaceAll(tmp2, '채썬', '');
                    tmp2 = replaceAll(tmp2, '천일염', '');
                    tmp2 = replaceAll(tmp2, '청갓', '');
                    tmp2 = replaceAll(tmp2, '청고추', '고추');
                    tmp2 = replaceAll(tmp2, '추젓', '');
                    tmp2 = replaceAll(tmp2, '치킨', '');
                    tmp2 = replaceAll(tmp2, '카놀라유', '');
                    tmp2 = replaceAll(tmp2, '크루통', '');
                    tmp2 = replaceAll(tmp2, '통도라지', '');
                    tmp2 = replaceAll(tmp2, '파의심부분', '');
                    tmp2 = replaceAll(tmp2, '편으로썬생강', '');
                    tmp2 = replaceAll(tmp2, '풀국', '');
                    tmp2 = replaceAll(tmp2, '플레인요구르트', '');
                    tmp2 = replaceAll(tmp2, '해바라기씨', '');
                    tmp2 = replaceAll(tmp2, '홍고추다진것', '고추');
                    tmp2 = replaceAll(tmp2, '홍고추', '고추');
                    tmp2 = replaceAll(tmp2, '황기', '');
                    tmp2 = replaceAll(tmp2, '흑미', '');
                    tmp2 = replaceAll(tmp2, '삶은', '');
                    tmp2 = replaceAll(tmp2, '사카린', '');
                    tmp2 = replaceAll(tmp2, '박대', '');
                    tmp2 = replaceAll(tmp2, '유채', '');
                    tmp2 = replaceAll(tmp2, '반개', '');
                    tmp2 = replaceAll(tmp2, '뿌리', '');
                    tmp2 = replaceAll(tmp2, '열장', '');
                    tmp2 = replaceAll(tmp2, '흑', '');
                    tmp2 = replaceAll(tmp2, '액젖', '액젓');
                    tmp2 = replaceAll(tmp2, '말린', '');
                    tmp2 = replaceAll(tmp2, '맵쌀', '');
                    tmp2 = replaceAll(tmp2, '차조', '');
                    tmp2 = replaceAll(tmp2, '수삼', '');
                    tmp2 = replaceAll(tmp2, '아귀', '');
                    tmp2 = replaceAll(tmp2, '토막', '');
                    tmp2 = replaceAll(tmp2, '멸치와밴댕이', '');
                    tmp2 = replaceAll(tmp2, '맥주', '');
                    tmp2 = replaceAll(tmp2, '팔각', '');
                    tmp2 = replaceAll(tmp2, '찜용', '');
                    tmp2 = replaceAll(tmp2, '케이퍼배리', '');
                    tmp2 = replaceAll(tmp2, '암', '');
                    tmp2 = replaceAll(tmp2, '마른', '');
                    tmp2 = replaceAll(tmp2, '오징어먹물', '');
                    tmp2 = replaceAll(tmp2, '게살통조림', '');
                    tmp2 = replaceAll(tmp2, '냉동', '');
                    tmp2 = replaceAll(tmp2, '데친', '');
                    tmp2 = replaceAll(tmp2, '봄나물겉절이', '');
                    tmp2 = replaceAll(tmp2, '맛나니', '');
                    tmp2 = replaceAll(tmp2, '깍두기국물', '');
                    tmp2 = replaceAll(tmp2, '식만능소스', '');
                    tmp2 = replaceAll(tmp2, '달걀프라이', '');
                    tmp2 = replaceAll(tmp2, '홍어', '');
                    tmp2 = replaceAll(tmp2, '오이소박이', '');
                    tmp2 = replaceAll(tmp2, '교나', '');
                    tmp2 = replaceAll(tmp2, '바닐라에센스', '');
                    tmp2 = replaceAll(tmp2, '각종과일', '');

                    tmp2 = replaceAll(tmp2, '청양고추or꽈리고추', '고추');
                    tmp2 = replaceAll(tmp2, '부침가루:전분', '');
                    tmp2 = replaceAll(tmp2, '어묵', '');
                    tmp2 = replaceAll(tmp2, '쪽파김치국물', '');
                    tmp2 = replaceAll(tmp2, '씻은', '');
                    tmp2 = replaceAll(tmp2, '들적당히', '');
                    tmp2 = replaceAll(tmp2, '마늘한숟가락', '마늘');
                    tmp2 = replaceAll(tmp2, '햇배추', '배추');
                    tmp2 = replaceAll(tmp2, '밤고구마', '');
                    tmp2 = replaceAll(tmp2, '마늘,후추', '');
                    tmp2 = replaceAll(tmp2, '밀가루풀', '');
                    tmp2 = replaceAll(tmp2, '콜라', '');
                    tmp2 = replaceAll(tmp2, '화당', '');
                    tmp2 = replaceAll(tmp2, '추첫', '');
                    tmp2 = replaceAll(tmp2, '수게', '');
                    tmp2 = replaceAll(tmp2, '하귤', '귤');
                    tmp2 = replaceAll(tmp2, '청귤', '귤');
                    tmp2 = replaceAll(tmp2, '묵은김치국물', '');
                    tmp2 = replaceAll(tmp2, '생멸치', '멸치');
                    tmp2 = replaceAll(tmp2, '모듬전', '');
                    tmp2 = replaceAll(tmp2, '도미', '');
                    tmp2 = replaceAll(tmp2, '한줌', '');
                    tmp2 = replaceAll(tmp2, '보리굴비', '');
                    tmp2 = replaceAll(tmp2, '계란물', '');
                    tmp2 = replaceAll(tmp2, '전분물', '전분');
                    tmp2 = replaceAll(tmp2, '마카로니', '');
                    tmp2 = replaceAll(tmp2, '만능', '');
                    tmp2 = replaceAll(tmp2, '반큰술', '');
                    tmp2 = replaceAll(tmp2, '큰술', '');
                    tmp2 = replaceAll(tmp2, '남은', '');
                    tmp2 = replaceAll(tmp2, '구운돼지불고기', '');
                    tmp2 = replaceAll(tmp2, '만능된', '');
                    tmp2 = replaceAll(tmp2, '춘', '');
                    tmp2 = replaceAll(tmp2, '집에있는채소', '');
                    tmp2 = replaceAll(tmp2, '감자채반죽', '');
                    tmp2 = replaceAll(tmp2, '흰후춧가루', '후춧가루');
                    tmp2 = replaceAll(tmp2, '흑설탕', '설탕');
                    tmp2 = replaceAll(tmp2, '황설탕', '설탕');
                    tmp2 = replaceAll(tmp2, '통깨·참기름', '통깨');
                    tmp2 = replaceAll(tmp2, '간돼지고기', '돼지고기');
                    tmp2 = replaceAll(tmp2, '김치만두소', '만두');
                    tmp2 = replaceAll(tmp2, '흰후춧가루', '후춧가루');

                    tmp2 = replaceAll(tmp2, '식용유대체가능)', '');
                    tmp2 = replaceAll(tmp2, '오므라이스소스', '');
                    tmp2 = replaceAll(tmp2, '납작', '');
                    tmp2 = replaceAll(tmp2, '한숟갈', '');
                    tmp2 = replaceAll(tmp2, '돼지고기찌개용', '돼지고기');
                    tmp2 = replaceAll(tmp2, '돼지고기사태', '돼지고기');
                    tmp2 = replaceAll(tmp2, '돼지고기목살', '돼지고기');
                    tmp2 = replaceAll(tmp2, '돼지고기또는소고기', '돼지고기');
                    tmp2 = replaceAll(tmp2, '돼지고기한컵', '돼지고기');
                    tmp2 = replaceAll(tmp2, '돼지고기안심', '돼지고기');
                    tmp2 = replaceAll(tmp2, '돼지고기홍두깨살', '돼지고기');

                    tmp2 = replaceAll(tmp2, '돼지또는소', '');
                    tmp2 = replaceAll(tmp2, '호랑이강낭콩', '');
                    tmp2 = replaceAll(tmp2, '세이보리', '');
                    tmp2 = replaceAll(tmp2, '올리고당', '');
                    tmp2 = replaceAll(tmp2, '딜', '');
                    tmp2 = replaceAll(tmp2, '일본', '');
                    tmp2 = replaceAll(tmp2, '갈빗살', '');
                    tmp2 = replaceAll(tmp2, '생강새끼손톱만큼', '');
                    tmp2 = replaceAll(tmp2, '한숟가락', '');
                    tmp2 = replaceAll(tmp2, '양념', '');
                    tmp2 = replaceAll(tmp2, '팟타이소스', '');
                    tmp2 = replaceAll(tmp2, '그레이비소스', '');
                    tmp2 = replaceAll(tmp2, '소불', '');
                    tmp2 = replaceAll(tmp2, '찌개용맛', '');
                    tmp2 = replaceAll(tmp2, '쌈채소', '');
                    tmp2 = replaceAll(tmp2, '한움큼', '');
                    tmp2 = replaceAll(tmp2, '불', '');
                    tmp2 = replaceAll(tmp2, '양조한', '');
                    tmp2 = replaceAll(tmp2, '마늘한', '');
                    tmp2 = replaceAll(tmp2, '대파소량', '');
                    tmp2 = replaceAll(tmp2, '대파,청양고추', '고추');
                    tmp2 = replaceAll(tmp2, '대파,참', '');
                    tmp2 = replaceAll(tmp2, '양파,대파', '');
                    tmp2 = replaceAll(tmp2, '육젓', '');
                    tmp2 = replaceAll(tmp2, '두릅', '');
                    tmp2 = replaceAll(tmp2, '머리', '');
                    tmp2 = replaceAll(tmp2, '통깨한꼬집', '');
                    tmp2 = replaceAll(tmp2, '묵은지반포기', '');
                    tmp2 = replaceAll(tmp2, '내제거한멸치', '멸치');
                    tmp2 = replaceAll(tmp2, '내장제거한멸치', '멸치');
                    tmp2 = replaceAll(tmp2, '토르티야', '');
                    tmp2 = replaceAll(tmp2, '손질한', '');
                    tmp2 = replaceAll(tmp2, '반모', '');
                    tmp2 = replaceAll(tmp2, '한모', '');
                    tmp2 = replaceAll(tmp2, '톳', '');
                    tmp2 = replaceAll(tmp2, '꼬시래기', '');
                    tmp2 = replaceAll(tmp2, '유부주머니', '');
                    tmp2 = replaceAll(tmp2, '화면', '');
                    tmp2 = replaceAll(tmp2, '제주은', '');
                    tmp2 = replaceAll(tmp2, '세발', '');
                    tmp2 = replaceAll(tmp2, '먹', '');
                    tmp2 = replaceAll(tmp2, '.', '');
                    tmp2 = replaceAll(tmp2, '딱돔', '');
                    tmp2 = replaceAll(tmp2, '흰자', '');
                    tmp2 = replaceAll(tmp2, '고추가루두', '');
                    tmp2 = replaceAll(tmp2, '생강즙', '');
                    tmp2 = replaceAll(tmp2, '도다리', '');
                    tmp2 = replaceAll(tmp2, '생수', '');
                    tmp2 = replaceAll(tmp2, '국물용멸치', '');
                    tmp2 = replaceAll(tmp2, '소금물', '');
                    tmp2 = replaceAll(tmp2, '댓잎', '');
                    tmp2 = replaceAll(tmp2, '베이크드빈스', '');
                    tmp2 = replaceAll(tmp2, '참쌀풀', '');
                    tmp2 = replaceAll(tmp2, '생굴', '굴');
                    tmp2 = replaceAll(tmp2, '반건조코다리', '코다리');
                    tmp2 = replaceAll(tmp2, '노각', '');
                    tmp2 = replaceAll(tmp2, '병어', '');
                    tmp2 = replaceAll(tmp2, '핫도그빵', '');
                    tmp2 = replaceAll(tmp2, '자숙새우', '');
                    tmp2 = replaceAll(tmp2, '뒷다리살', '');
                    tmp2 = replaceAll(tmp2, '통생강', '');
                    tmp2 = replaceAll(tmp2, '감자전분가루', '전분');
                    tmp2 = replaceAll(tmp2, '구운팬케이크', '');
                    tmp2 = replaceAll(tmp2, '팬케이크반죽', '');
                    tmp2 = replaceAll(tmp2, '팬케이크가루', '');
                    tmp2 = replaceAll(tmp2, '알배기배추', '배추');
                    tmp2 = replaceAll(tmp2, '드라이카레', '카레');
                    tmp2 = replaceAll(tmp2, '바게트빵', '바게트');
                    tmp2 = replaceAll(tmp2, '양조장한', '');
                    tmp2 = replaceAll(tmp2, '땅', '');
                    tmp2 = replaceAll(tmp2, '김치국물', '');
                    tmp2 = replaceAll(tmp2, '전복내장', '');
                    tmp2 = replaceAll(tmp2, '청야고추', '고추');
                    tmp2 = replaceAll(tmp2, '맛장', '');
                    tmp2 = replaceAll(tmp2, '양고추', '고추');
                    tmp2 = replaceAll(tmp2, '통멸치', '멸치');
                    tmp2 = replaceAll(tmp2, '찹쌀풀', '');
                    tmp2 = replaceAll(tmp2, '문어', '');
                    tmp2 = replaceAll(tmp2, '여리고추', '고추');
                    tmp2 = replaceAll(tmp2, '달캴', '');
                    tmp2 = replaceAll(tmp2, '국장한', '');
                    tmp2 = replaceAll(tmp2, '얼음물', '얼음');
                    tmp2 = replaceAll(tmp2, '커스터드크림', '');
                    tmp2 = replaceAll(tmp2, '과일', '');
                    tmp2 = replaceAll(tmp2, '지단', '');
                    tmp2 = replaceAll(tmp2, '하젓', '');
                    tmp2 = replaceAll(tmp2, '청량고추', '고추');
                    tmp2 = replaceAll(tmp2, '건고추', '고추');
                    tmp2 = replaceAll(tmp2, '건호고추', '고추');
                    tmp2 = replaceAll(tmp2, '감자전분', '전분');
                    tmp2 = replaceAll(tmp2, '감자풀', '');
                    tmp2 = replaceAll(tmp2, '검은콩', '콩');
                    tmp2 = replaceAll(tmp2, '콩버터', '버터');
                    tmp2 = replaceAll(tmp2, '계피', '');
                    tmp2 = replaceAll(tmp2, '고등어통조림', '고등어');
                    tmp2 = replaceAll(tmp2, '과메기', '');
                    tmp2 = replaceAll(tmp2, '공심채', '');
                    tmp2 = replaceAll(tmp2, '꼴뚜기', '');
                    tmp2 = replaceAll(tmp2, '꽁치통조림', '꽁치');
                    tmp2 = replaceAll(tmp2, '날치알', '');
                    tmp2 = replaceAll(tmp2, '녹두', '');
                    tmp2 = replaceAll(tmp2, '노가리', '');
                    tmp2 = replaceAll(tmp2, '다시팩', '');
                    tmp2 = replaceAll(tmp2, '단무지', '');
                    tmp2 = replaceAll(tmp2, '달걀노른자', '달걀');
                    tmp2 = replaceAll(tmp2, '닭날개', '닭');
                    tmp2 = replaceAll(tmp2, '닭다리', '닭');
                    tmp2 = replaceAll(tmp2, '닭다리살', '닭');
                    tmp2 = replaceAll(tmp2, '닭발', '닭');
                    tmp2 = replaceAll(tmp2, '닭봉', '닭');
                    tmp2 = replaceAll(tmp2, '대하', '');
                    tmp2 = replaceAll(tmp2, '돼지감자', '감자');
                    tmp2 = replaceAll(tmp2, '들', '');
                    tmp2 = replaceAll(tmp2, '마늘종', '마늘');
                    tmp2 = replaceAll(tmp2, '마늘쫑', '마늘');
                    tmp2 = replaceAll(tmp2, '만두소', '만두');
                    tmp2 = replaceAll(tmp2, '매생이', '');
                    tmp2 = replaceAll(tmp2, '매실액', '');
                    tmp2 = replaceAll(tmp2, '매실청', '');
                    tmp2 = replaceAll(tmp2, '멸치가루', '멸치');
                    tmp2 = replaceAll(tmp2, '멸치육수', '멸치');
                    tmp2 = replaceAll(tmp2, '명란젓', '명란');
                    tmp2 = replaceAll(tmp2, '모자반', '');
                    tmp2 = replaceAll(tmp2, '무말랭이', '무');
                    tmp2 = replaceAll(tmp2, '묵은지', '');
                    tmp2 = replaceAll(tmp2, '물고추', '고추');
                    tmp2 = replaceAll(tmp2, '미더덕', '');
                    tmp2 = replaceAll(tmp2, '반건조', '');
                    tmp2 = replaceAll(tmp2, '봄동', '');
                    tmp2 = replaceAll(tmp2, '북어대가리', '북어');
                    tmp2 = replaceAll(tmp2, '북어대가리육수', '북어');
                    tmp2 = replaceAll(tmp2, '북어채', '북어');
                    tmp2 = replaceAll(tmp2, '비지', '');
                    tmp2 = replaceAll(tmp2, '빨고추', '고추');
                    tmp2 = replaceAll(tmp2, '사각', '');
                    tmp2 = replaceAll(tmp2, '사이다', '');
                    tmp2 = replaceAll(tmp2, '새뱅이', '');
                    tmp2 = replaceAll(tmp2, '샐러리', '');
                    tmp2 = replaceAll(tmp2, '셀러리', '');
                    tmp2 = replaceAll(tmp2, '소라', '');
                    tmp2 = replaceAll(tmp2, '소주', '');
                    tmp2 = replaceAll(tmp2, '실고추', '고추');
                    tmp2 = replaceAll(tmp2, '시뺀건고추', '고추');
                    tmp2 = replaceAll(tmp2, '아무액젓', '');
                    tmp2 = replaceAll(tmp2, '아몬드', '');
                    tmp2 = replaceAll(tmp2, '아욱', '');
                    tmp2 = replaceAll(tmp2, '알감자', '감자');
                    tmp2 = replaceAll(tmp2, '알배추', '배추');
                    tmp2 = replaceAll(tmp2, '양겨자', '겨자');
                    tmp2 = replaceAll(tmp2, '올리브오일', '');
                    tmp2 = replaceAll(tmp2, '올리브유', '');
                    tmp2 = replaceAll(tmp2, '우렁이', '');
                    tmp2 = replaceAll(tmp2, '월계수잎', '');
                    tmp2 = replaceAll(tmp2, '육수', '');
                    tmp2 = replaceAll(tmp2, '육수멸치', '멸치');
                    tmp2 = replaceAll(tmp2, '육수팩', '');
                    tmp2 = replaceAll(tmp2, '은행', '');
                    tmp2 = replaceAll(tmp2, '이북식고추장', '');
                    tmp2 = replaceAll(tmp2, '이북식장', '');
                    tmp2 = replaceAll(tmp2, '잔멸치', '멸치');
                    tmp2 = replaceAll(tmp2, '잣가루', '잣');
                    tmp2 = replaceAll(tmp2, '전분가루', '전분');
                    tmp2 = replaceAll(tmp2, '전어', '');
                    tmp2 = replaceAll(tmp2, '조갯살', '조개');
                    tmp2 = replaceAll(tmp2, '조청', '');
                    tmp2 = replaceAll(tmp2, '죽순', '');
                    tmp2 = replaceAll(tmp2, '줄장쥐포', '');
                    tmp2 = replaceAll(tmp2, '쭈꾸미', '');
                    tmp2 = replaceAll(tmp2, '청주', '');
                    tmp2 = replaceAll(tmp2, '청피망', '피망');
                    tmp2 = replaceAll(tmp2, '칠게', '');
                    tmp2 = replaceAll(tmp2, '커피가루', '');
                    tmp2 = replaceAll(tmp2, '풀치', '');
                    tmp2 = replaceAll(tmp2, '편마늘', '마늘');
                    tmp2 = replaceAll(tmp2, '풋고추', '고추');
                    tmp2 = replaceAll(tmp2, '한치', '');
                    tmp2 = replaceAll(tmp2, '홍피망', '피망');
                    tmp2 = replaceAll(tmp2, '황태껍질', '황태');
                    tmp2 = replaceAll(tmp2, '황태육수', '황태');
                    tmp2 = replaceAll(tmp2, '고추씨', '고추');
                    tmp2 = replaceAll(tmp2, '고추냉이', '고추');
                    tmp2 = replaceAll(tmp2, '깻가루', '');
                    tmp2 = replaceAll(tmp2, '치액젓', '액젓');
                    tmp2 = replaceAll(tmp2, '참액젓', '액젓');
                    tmp2 = replaceAll(tmp2, '참치통조림', '참치');
                    tmp2 = replaceAll(tmp2, '통마늘', '마늘');
                    tmp2 = replaceAll(tmp2, '통연근', '연근');
                    tmp2 = replaceAll(tmp2, '메밀묵', '');
                    tmp2 = replaceAll(tmp2, '메로', '');
                    tmp2 = replaceAll(tmp2, '씨뺀고추', '고추');
                    tmp2 = replaceAll(tmp2, '쑥갓', '쑥');
                    tmp2 = replaceAll(tmp2, '고추장아찌', '고추');
                    tmp2 = replaceAll(tmp2, '어리굴젓', '');
                    tmp2 = replaceAll(tmp2, '어장', '');
                    tmp2 = replaceAll(tmp2, '소꼬리', '');
                    tmp2 = replaceAll(tmp2, '양조장', '');
                    tmp2 = replaceAll(tmp2, '돼지호박', '호박');
                    tmp2 = replaceAll(tmp2, '곤약', '');
                    tmp2 = replaceAll(tmp2, '꼬리고추', '고추');
                    tmp2 = replaceAll(tmp2, '건멸치', '멸치');
                    tmp2 = replaceAll(tmp2, '건대추', '대추');
                    tmp2 = replaceAll(tmp2, '돼지등뼈', '');
                    tmp2 = replaceAll(tmp2, '총각무', '무');
                    tmp2 = replaceAll(tmp2, '총각김치', '김치');
                    tmp2 = replaceAll(tmp2, '총각무김치', '김치');
                    tmp2 = replaceAll(tmp2, '무김치', '김치');
                    tmp2 = replaceAll(tmp2, '카레가루', '카레');
                    tmp2 = replaceAll(tmp2, '분말카레', '카레');
                    tmp2 = replaceAll(tmp2, '손두부', '두부');
                    tmp2 = replaceAll(tmp2, '오이고추', '고추');
                    tmp2 = replaceAll(tmp2, '재래된장', '된장');
                    tmp2 = replaceAll(tmp2, '주키니호박', '호박');
                    tmp2 = replaceAll(tmp2, '쪽파김치', '김치');
                    tmp2 = replaceAll(tmp2, '게맛살', '맛살');
                    tmp2 = replaceAll(tmp2, '레드와인', '와인');
                    tmp2 = replaceAll(tmp2, '화이트와인', '와인');
                    tmp2 = replaceAll(tmp2, '열김치', '김치');
                    tmp2 = replaceAll(tmp2, '파김치', '김치');
                    tmp2 = replaceAll(tmp2, '호박잎', '호박');
                    tmp2 = replaceAll(tmp2, '파인애플통조림', '파인애플');
                    tmp2 = replaceAll(tmp2, '사과식초', '식초');




                    //한글자 처리!
                    if (tmp2 == '참' || tmp2 == '팩' || tmp2 == '장' || tmp2 == '어' || tmp2 == '생' || tmp2 == ' 생강' || tmp2 == '전' || tmp2 == '파' || tmp2 == '고기') {
                        tmp2 = '';
                    }

                    if (tmp2 != '') {
                        //숫자를 포함하는지 체크!
                        var pattern1 = /[0-9]/;
                        if (!pattern1.test(tmp2)) {
                            tmp2 = replaceAll(tmp2, ' ', '');
                            arr.push(tmp2);
                        }
                    }
                }
            }
        }
    });

    const set = new Set(arr);
    const uniqueArr = [...set];


    // var a = [];
    // for (name1 of uniqueArr) {
    //     a.push(name1);
    // }
    // res.send(a);
    // return;


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
