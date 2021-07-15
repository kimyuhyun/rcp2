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

// const keyArr = ['iWjOVquoXGA','HP3mG703WGA','fMwidi9nVf0','dO0vBa1Ftf0','gW43UFgNsf0','kKlJo42grGA','fPOuBHesQf0','jCh11WoAQGA','e9IwbU1mof0','JJA6bsBbjGA'];
// const keyArr = ['jXQCzrgWGGA','FAt7oAQcFf0','JGsoMpOreGA','fTE4TLGhcf0','KA6e8rcCbGA','kBXQ16mOaGA','EDZPKJvz9f0','DCkQIztL8f0','g1s5y4Iy1F0','INEo4jSG1fA'];
// const keyArr = ['DNYTgY3SyF0','DUhWVZOFYF0','eLQiXMEVWF0','kNRHyhORVfA','eSth0sX6UF0','kO4ulBcktfA','j7yfOzY3sfA','kROb3YanRfA','fQo0wSTiPF0','HD3a488vofA'];
// const keyArr = ['iMqU3kIcOfA','f7piwX3pmF0','H1xHbJGIlfA','iKjNR8zBKfA','j5V30KEnJfA','DCqTKWNZhF0','kXQKndTnhfA','fO2X96VleF0','GFW1li0YdF0','hA2URtjfdfA'];
// const keyArr = ['J1wfEatrcfA','IRYa7JwDCfA','F5UDhFJx0F0','DFEITtFQ7F0','K1mfuAp67fA','KVN9lqvj5fA','dUnC41oX2e0','GOvzgp5TZe0','DCn4sjuUwe0','jWrZ0y0CwFA'];
// const keyArr = ['hLA5pXKOvFA','dCzxDTsHte0','fG899jqASe0','j3WKhx2mrFA','dUyz0dFyQe0','KJIlnz1nQFA','ERNygrQcOe0','HSkkwUwxmFA','kPC5rAbFMFA','JN1uBmLRLFA'];
// const keyArr = ['DS2OWEddKe0','h5LL7hCIjFA','eLEkMA5pge0','iNRTuOH5gFA','hUmI1PFjfFA','gIb5c5H5ee0','gBTaZg5Ade0','fCeVBKchBe0','d9WjbvMtAe0','G936TcWa0e0'];
// const keyArr = ['iOguD0gU9FA','HROxUz8Z7FA','jUqYMViA3eA','DU69MaSlzE0','KBYsUm5yZeA','D1kMH9vjYE0','j5VERFeRxeA','FXOs56eXuE0','KZEvpNcEueA','gBTaJk11TE0'];
// const keyArr = ['iLMOOQoRteA','f1v6Mk6JsE0','hU0miBXbTeA','DStf0U6IrE0','hW2fyyPrpeA','HFXVUoBYoeA','JK6LOf4IOeA','j5TU6ICYNeA','fJCPs6UXmE0','iGcjfmsfmeA'];
// const keyArr = ['fFYPxzNGjE0','fYqg2muRiE0','f9FL4sL9IE0','eLHA19dKHE0','KKcgkCBkheA','jNU8jcKUgeA','FPZ3Y5oiDE0','GH9E8DFvCE0','g5NsZcFvCE0','hMiZ4ecdCeA'];
// const keyArr = ['iEcYeFANBeA','dRM7hBKhAE0','gHGm7qD12d0','EXYjZHig1d0','gBAOjaV0Xd0','DRSYCRsgWd0','d9XOukPwVd0','GMwr7dR2Ud0','DAtB5dYXsd0','i33h7HfGsEA'];
// const keyArr = ['JVEsqwDrrEA','dTLDqfFkqd0','IZBWpR9LREA','KFVXqykwPEA','jCrH7rL7NEA','dO6kQZkKld0','DSeEwlSVkd0','EW0ktcbHKd0','ENULuLnNJd0','eSdhxlQ2Id0'];
// const keyArr = ['D14BSX5vgd0','HHNtUKFCgEA','DFRzcQ1OFd0','HWx3Lof2eEA','d3mbjpRZEd0','iExqkkDhEEA','iTZvtwU7BEA','JOimf7LgAEA','h9WBfsgX9EA','jFRZlX8X9EA'];
// const keyArr = ['iFZEP9g88EA','ER9l2k9G2D0','kXFjG25S1dA','fVQW9mE6ZD0','gWsRDPFTYD0','I3Rk3faJydA','D9SqNRstXD0','iCh98dAEXdA','dGgStQq8VD0','kVRHtNaJudA'];
// const keyArr = ['GVAFo1TUTD0','D5JcNZ8gsD0','jPIDTvFpSdA','iZIzmLIAndA','iEuX4DEAndA','JP9xuN4AndA','iElq6Ce0ndA','JY6oei50ndA','IB5Ec96CLdA','EMyeVlQNjD0'];
// const keyArr = ['G9NZbbCYiD0','kN3HNTTridA','JBI8Au9UhdA','kXUK0Lh6HdA','eYuqpWvFED0','EVWKmlhQDD0','K7xTQy35DdA','eNLz55WhbD0','HLDcwyXI7dA','JGi8q6ev5dA'];
// const keyArr = ['fVL0Xara3D0','H1jZJSxo2DA','KLMFtrvUYDA','hRWh35abxDA','GWiWIoHMWc0','IUh2fQ35WDA','EPAxILoeuc0','gVGRJ1RMSc0','eEbNFKPxRc0','g97x2CBdqc0'];
// const keyArr = ['kUwXQCLdRDA','JTGZCoNyQDA','J5BAFpb7pDA','GObkDwGPmc0','eMeg7KLdmc0','dCr2sSu7Mc0','gK8QAziPlc0','INMmgESzLDA','eJ1S1vRfKc0','iCpQRCFUjDA'];
// const keyArr = ['IBVGdEIvfDA','dBCRdpYTFc0','eH5OTB3fec0','ES2X2hWMdc0','HUjsGyZUbDA','HBOxRQu0BDA','G7eWVC4k0c0','eXSz6VN89c0','JAnjTYCv8DA','KLIWN1zd8DA'];
// const keyArr = ['jIzdIl6l3cA','KJ9YXS6C2cA','ESe1re1dZC0','iYpvvnSPycA','IDKOaU27YcA','kAsQOtydvcA','FCoViiKOUC0','g9BT47fHtC0','iRQhgzwXtcA','FAbHamrTrC0'];
// const keyArr = ['DTTQXYbLMC0','JYa7jY1cHcA','kVG081DEDcA','DXCjwaiubC0','FVXpOLbf8C0','JFP5WFx35cA','DG6y16No3C0','FPNBjBKo3C0','dCmHB8M1Wb0','i7lOsVQ1RCA'];
// const keyArr = ['hX1Xs6q3HbA','jR7yq8qlbbA','DSwZf1zI8B0','eLTX6NCt6B0','j7hInlj06bA','hSyrnma93BA','GUip2EyOXa0','KEoUjpcvwBA','i5Wg9W4SVBA','jTNdi90NtBA'];
// const keyArr = ['KAv2iyEXsBA','FRZwn7XAra0','EZYHQ0oIMa0','hE2UpQWflBA','fAobvaahja0','IHF28PUPJBA','iXFqjVk5iBA','hMuSQFiihBA','hVTR16rZgBA','jMhujD05eBA'];
// const keyArr = ['EIchrgnsCa0','jFZMTWn9CBA','ET9B8xpiaa0','iIwMHi4uABA','G18Bw2Ao1A0','kAhxiUyc2aA','FXAccBJNZA0','eFC9AIWGxA0','FFBheFZPVA0','k9DrnjQgVaA'];
// const keyArr = ['FVFeQXB2UA0','EYymoVkFtA0','hKpMZIXzraA','IT9vFx6HQaA','FE2nWNx9PA0','DOteq7TToA0','FVCCifz7OA0','eSuKip6rNA0','EB5e8EbjlA0','KWzJ4grgMaA'];
// const keyArr = ['iBD797w9laA','fQut9ZpTkA0','gEvPTK4rFA0','JR37A0lkfaA','K9U5FDVKfaA','j3HnZiWh8aA','DVWCzDYz6A0','IAnels1F6aA','DCtptJP2y00','G3xGNg8fY00'];
// const keyArr = ['jZ95mhbtxAA','iInwmkEfXAA','kO4lBeqRtAA','GGm5oMzLs00','GHZVp0iZS00','jBTXlKDKOAA','kZXIFnPXNAA','FQuowpMfM00','IFZLoGlsGAA','eQotvGnff00'];
// const keyArr = ['eCaBBEmCF00','HSjN9r6FDAA','II6m2IogCAA','iJSpZnFtBAA','FIixOAP2000','ILNfmIGj20A','eBP0ihXuZ90','DChcDB2Zw90','iGc45iCuv0A','JRN1mQCCV0A'];
// const keyArr = ['IFZSGy4MU0A','IYprtNR0R0A','F7lycLjNp90','H31Ag8ryP0A','g9OoYabDO90','hQaY0FgSM0A','iFXVKCXEk0A','dEiqZ8M1I90','G5L8p84AG90','ITR6ygj5F0A'];
// const keyArr = ['ISk2cmAKE0A','HSilnCmuD0A','JIv8bfJ1a0A','iRQriODHA0A','FV9bTWFb790','iAsZv0dB80A','kWwpvxXl60A','kSzEzycj39A','J5KtxVu1Z9A','hWk2OC0hy9A'];
// const keyArr = ['IZQuQiJCY9A','e1s7QriTX80','GXTF3heEw80','DFK18A6IV80','kTMHrA7fT9A','K9DnubK4s9A','FMb7jBWZq80','jUy9nCWTp9A','ESsNlVmJM80','JFIzZeCsl9A'];
// const keyArr = ['HPPdqk2ZJ9A','K7equnJIi9A','IJ1bK01fI9A','g5Flz9O7g80','fKj4qK8jf80','HCiv80ESd9A','JNHJOQ5qD9A','HZPOGO2zC9A','fVHhZmDJb80','h7mm4OVn79A'];
// const keyArr = ['iIoD6euX59A','iA2BaA2d49A','DJ3XOF6P170','fEpH8INBX70','DYyslFJZv70','eXDDJ3O2V70','hLX4uOAuV8A','fZQAaNdst70','eBVmkN1QT70','DBZ2qyHgr70'];
// const keyArr = ['JRLA5j8TQ8A','F9Y2s2m8o70','DSjtHD2kO70','dRSJbxrSl70','iEdmhmgMk8A','JP1R0yidJ8A','iLPvJkKxh8A','EMwm2YHhG70','FA8v0kIEe70','FLPLtjTod70'];
// const keyArr = ['F1cMGuatC70','hWieyEabB8A','e3z7y5f3A70','dQodiKPz870','ICeb0v7z88A','H9UP7qKF88A','HUyBoHCLz7A','fPX5L6QNY60','dTVG6repU60','dQk2TjCQs60'];
// const keyArr = ['kYtlvfhGs7A','DHIowvYjR60','H3HoiZU1m7A','kMkAgun8m6A','EOtpWSLMG50','gBDtnoRha50','IWb5dcTa25A','iTZxxB2lw5A','iKedjnVlw5A','eJXvvAqqV40'];
// const keyArr = ['hSahrP8At5A','FVAX2rh9T40','GUuturh9T40','DMcnOrh9T40','DVB0l2R8T40','I726gLCUr5A','DMhD6d9qo40','jQ8DbqeTn5A','IVQxJIqcN5A','dAch6fSNl40'];
// const keyArr = ['IE8ScKlXj5A','JOgh8JyUH5A','k5GmPV6lH5A','F7xlBsvkg40','IFFPgqHAg5A','EAx3iMnBd40','FT1nA2msb40','H5JCMEXsC5A','JVYuvinsb5A','f5ON9I6mB40'];
// const keyArr = ['FH59wfaCa40','DRAVRWjA740','JUzyEdcN45A','ENKQvBKP230','kZPMLbMpx4A','jHR2eXGbv4A','iIzdEJrQu4A','HHAPMPG9u4A','F1iWmBBUr30','kKh5tKaOS4A'];
// const keyArr = ['eVZu1yBWP30','jPTdb2nFp4A','K5A6AL0hP4A','fU4uY1ibo30','GAcv8l35M30','hM2DWsjIl4A','KTGUrCtUk4A','jUpky7vwK4A','jRDJc0ZKh4A','f9OyK0P0f30'];
// const keyArr = ['H12im7YDf4A','dHO6hYnUE30','eROIV6JQ730','jQxhfr1O74A','fMwnGlaf630','FSm1xchy430','e9T74y4w430','gBXuBLFIX29','eRZdHeYBX29','eBDlgKovw29'];
// const keyArr = ['eDOs0fNkS29','FSo56bp7S29','jAs9wvLaS30','iHPbkkEYr30','JGepQTuQr30','dFO5XgPDq29','dLYwNOnpO29','fMo01iQDO29','f5P8pgJvN29','dTC6PVQLN29'];
// const keyArr = ['eVNb0hCJm29','GArZ8aucm29','KVQbL3FPM30','jKzWoNfbi30','HG20leRYH30','I14cY76QH30','KElt1MXag30','gGrrsUIKe29','f5UOOU4ha29','jWr30RJ0B30'];
// const keyArr = ['k10SDEDZa30','fAiwjDgt029','EGgA0uDO029','EDFGdg16429','FK2YHUlw329','eCc3CrxO329','fPVX4jTQ219','eXDBFNJK219','fVGSuLW2y19','h5Kv0zdVu20'];
// const keyArr = ['fAtKjcwbU19','dNRyAiNbt19','hNUexFE7U20','gVTzEz5yT19','HDNdkglhr20','JSa0zRs5r20','K1qxbQ0UR20','k5LLSXJBq20','I7uudhqzp20','kQhpfdTNp20'];
// const keyArr = ['jQwYJhjNP20','IQ0lgt1gP20','HKjG6NE9P20','hHVojtF9M20','kG4z5gaol20','FOdqmckHk19','FBICoCoxK19','JAgTocrgK20','ECaVSIRfJ19','HB9MGb5vJ20'];
// const keyArr = ['KBOtY4QsF20','iHVofkjTe20','IUnjiImge20','KCy4Zfr5E20','FWh6FxgFB19','DX5YFbsTA19','dDVNXpEiA19','KJDHl4M8a20','kRSqwyPFA20','jSkjLWaFA20'];
const keyArr = ['GItE6iHY1z9','JFGmIocl210','dCyFGXfOXz9','fUzSwY2NXz9','ITWDGqcLs10','fAzPhLUKSz9','iE0zUeNhS10','FUrROF9Hrz9','jSxWA0jDS10','dH7lzOnBrz9'];

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


            if (tmp2.includes('재료-')) {
                tmp = tmp2.split('--------------------------');
                tmp = tmp[0];
            } else {
                tmp = tmp2.split('[재료]')[1];
                tmp = tmp.split('[조리')[0];
                tmp = replaceAll(tmp, ' ', '');
                tmp = replaceAll(tmp, ',', '\n');
            }

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
