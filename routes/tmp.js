const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const db = require('../db');
const utils = require('../Utils');
const moment = require('moment');
const axios = require('axios');
const webdriver = require('selenium-webdriver');
const { By, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const cheerio = require('cheerio');

router.get('/', async function(req, res, next) {
    return;

    var config = {
        method: 'get',
        url: 'http://ncv.hongslab.shop/Sumi/get_all_json',

    };

    axios(config).then(async function (response) {
        var jsonStr = JSON.stringify(response.data);
        var json = JSON.parse(jsonStr);

        var i = 0;
        var tmp = '';

        for (obj of json) {
            var row = {};

            tmp = replaceAll(obj.MEMO, ', ', '\n');
            tmp = replaceAll(tmp, ' ', '');

            row.title = obj.TITLE;
            row.jaelyo = tmp;
            row.writer_idx = 4;

            for (var j in obj.IMGS) {
                eval('row.filename' + j + '= obj.IMGS[j];');
            }

            await new Promise(function(resolve, reject) {
                const sql = `INSERT INTO RCP_tbl SET ?`;
                db.query(sql, row, function(err, rows, fields) {
                    if (!err) {
                        resolve(rows);
                    } else {
                        console.log(err);
                    }
                });
            }).then(function(data) {

            });

            // i++;
            // if (i == 2) {
            //     break;
            // }
        }
    }).catch(function (error) {
        console.log(error);
    });



    res.send('tmp');
});

var keyArr = ['iWjOVquoXGA','HP3mG703WGA','fMwidi9nVf0','dO0vBa1Ftf0','gW43UFgNsf0','kKlJo42grGA','fPOuBHesQf0','jCh11WoAQGA','e9IwbU1mof0','JJA6bsBbjGA',
'jXQCzrgWGGA','FAt7oAQcFf0','JGsoMpOreGA','fTE4TLGhcf0','KA6e8rcCbGA','kBXQ16mOaGA','EDZPKJvz9f0','DCkQIztL8f0','g1s5y4Iy1F0','INEo4jSG1fA',
'DNYTgY3SyF0','DUhWVZOFYF0','eLQiXMEVWF0','kNRHyhORVfA','eSth0sX6UF0','kO4ulBcktfA','j7yfOzY3sfA','kROb3YanRfA','fQo0wSTiPF0','HD3a488vofA',
'iMqU3kIcOfA','f7piwX3pmF0','H1xHbJGIlfA','iKjNR8zBKfA','j5V30KEnJfA','DCqTKWNZhF0','kXQKndTnhfA','fO2X96VleF0','GFW1li0YdF0','hA2URtjfdfA',
'J1wfEatrcfA','IRYa7JwDCfA','F5UDhFJx0F0','DFEITtFQ7F0','K1mfuAp67fA','KVN9lqvj5fA','dUnC41oX2e0','GOvzgp5TZe0','DCn4sjuUwe0','jWrZ0y0CwFA',
'hLA5pXKOvFA','dCzxDTsHte0','fG899jqASe0','j3WKhx2mrFA','dUyz0dFyQe0','KJIlnz1nQFA','ERNygrQcOe0','HSkkwUwxmFA','kPC5rAbFMFA','JN1uBmLRLFA',
'DS2OWEddKe0','h5LL7hCIjFA','eLEkMA5pge0','iNRTuOH5gFA','hUmI1PFjfFA','gIb5c5H5ee0','gBTaZg5Ade0','fCeVBKchBe0','d9WjbvMtAe0','G936TcWa0e0',
'iOguD0gU9FA','HROxUz8Z7FA','jUqYMViA3eA','DU69MaSlzE0','KBYsUm5yZeA','D1kMH9vjYE0','j5VERFeRxeA','FXOs56eXuE0','KZEvpNcEueA','gBTaJk11TE0',
'iLMOOQoRteA','f1v6Mk6JsE0','hU0miBXbTeA','DStf0U6IrE0','hW2fyyPrpeA','HFXVUoBYoeA','JK6LOf4IOeA','j5TU6ICYNeA','fJCPs6UXmE0','iGcjfmsfmeA',
'fFYPxzNGjE0','fYqg2muRiE0','f9FL4sL9IE0','eLHA19dKHE0','KKcgkCBkheA','jNU8jcKUgeA','FPZ3Y5oiDE0','GH9E8DFvCE0','g5NsZcFvCE0','hMiZ4ecdCeA',
'iEcYeFANBeA','dRM7hBKhAE0','gHGm7qD12d0','EXYjZHig1d0','gBAOjaV0Xd0','DRSYCRsgWd0','d9XOukPwVd0','GMwr7dR2Ud0','DAtB5dYXsd0','i33h7HfGsEA',
'JVEsqwDrrEA','dTLDqfFkqd0','IZBWpR9LREA','KFVXqykwPEA','jCrH7rL7NEA','dO6kQZkKld0','DSeEwlSVkd0','EW0ktcbHKd0','ENULuLnNJd0','eSdhxlQ2Id0',
'D14BSX5vgd0','HHNtUKFCgEA','DFRzcQ1OFd0','HWx3Lof2eEA','d3mbjpRZEd0','iExqkkDhEEA','iTZvtwU7BEA','JOimf7LgAEA','h9WBfsgX9EA','jFRZlX8X9EA',
'iFZEP9g88EA','ER9l2k9G2D0','kXFjG25S1dA','fVQW9mE6ZD0','gWsRDPFTYD0','I3Rk3faJydA','D9SqNRstXD0','iCh98dAEXdA','dGgStQq8VD0','kVRHtNaJudA',
'GVAFo1TUTD0','D5JcNZ8gsD0','jPIDTvFpSdA','iZIzmLIAndA','iEuX4DEAndA','JP9xuN4AndA','iElq6Ce0ndA','JY6oei50ndA','IB5Ec96CLdA','EMyeVlQNjD0',
'G9NZbbCYiD0','kN3HNTTridA','JBI8Au9UhdA','kXUK0Lh6HdA','eYuqpWvFED0','EVWKmlhQDD0','K7xTQy35DdA','eNLz55WhbD0','HLDcwyXI7dA','JGi8q6ev5dA'];





const service = new chrome.ServiceBuilder('./chromedriver_mac').build();
chrome.setDefaultService(service);
// const opts = new chrome.Options().addArguments(['user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X)"']);
const driver = new webdriver.Builder().forBrowser('chrome')
                        .setChromeOptions(new chrome.Options().headless().windowSize({ width: 640, height: 1480 }))
                        // .setChromeOptions(new chrome.Options().windowSize({ width: 640, height: 1080 }))
                        .build();

router.get('/z', async function(req, res, next) {

    // var tmp = [];
    // var tmp2 = [];
    //
    // await new Promise(async function(resolve, reject) {
    //     fs.readFile("rcp.txt", 'utf-8', function(err, data) {
    //         // console.log(data);
    //         tmp = data.split('data-model="_kCwk28.');
    //
    //         resolve(tmp);
    //     });
    // }).then(function(data) {
    //     console.log(tmp.length);
    // });
    //
    // for (i in tmp) {
    //     var a = tmp[i].split('"><div data-kant-group="feed.u"');
    //     if (a[0].length < 20) {
    //         tmp2.push(a[0]);
    //     }
    // }
    //
    // var tmp = '';
    // for (i in tmp2) {
    //     // console.log(i, tmp2[i]);
    //     if ((i % 10) == 0) {
    //         tmp += '];';
    //         console.log(tmp);
    //
    //         tmp = "const keyArr = ['" + tmp2[i] + "'";
    //     } else {
    //         tmp += ",'" + tmp2[i] + "'";
    //     }
    //
    // }
    keyArr = keyArr.reverse();

    get_images(0);

    res.send('tmp/z');
});


async function get_images(index) {
    await new Promise(async function(resolve, reject) {
        var url = 'https://story.kakao.com/ch/tvnzipbob/' + keyArr[index];
        console.log(url);
        await driver.get(url);
        setTimeout(async() => {
            const body = await driver.findElement(By.css('body')).getAttribute("innerHTML");
            const $ = cheerio.load(body);

            var row = {};

            try {

                var tmp = $('.tit_channel').text();
                var tmp2 = $('._content').text();

                if (tmp) {
                    tmp = replaceAll(tmp, "'", "");
                } else {
                    tmp = tmp2.split("'");
                    tmp = tmp[1];
                }

                row.title = tmp.trim();
                row.writer_idx = 3;


                if (tmp2.includes('[재료]')) {
                    tmp = tmp2.split('[재료]')[1];
                    tmp = tmp.split('[조리')[0];
                } else {
                    tmp = tmp2.split('--------------------------');
                    tmp = tmp[0];
                }
                tmp = replaceAll(tmp, ' ', '');
                tmp = replaceAll(tmp, ',', '\n');

                row.jaelyo = tmp.trim();

                const images = $('div.img_wrap');

                images.find('._mediaImage').each(function(i, e) {
                    // console.log(i, $(e).attr('src'));
                    eval('row.filename' + i + '= $(e).attr("src");');
                });

                const sql = `INSERT INTO RCP_tbl SET ?`;
                db.query(sql, row, function(err, rows, fields) {
                    if (!err) {
                        resolve(rows);
                    } else {
                        console.log(err);
                    }
                });
                // resolve(row);
            } catch (e) {
                row.title = url;

                const sql = `INSERT INTO RCP_tbl SET ?`;
                db.query(sql, row, function(err, rows, fields) {
                    if (!err) {
                        resolve(rows);
                    } else {
                        console.log(err);
                    }
                });
            }

        }, 1000);
    }).then(function(data) {
        console.log(data);
    });


    if (keyArr.length-1 == index) {
        await driver.quit();
        console.log('end 스크래핑');
    } else {
        setTimeout(function() {
            index++;
            get_images(index);
        }, 1000);
    }
}

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

module.exports = router;
