const express = require('express');
const router = express.Router();
const axios = require("axios");
const urlencode = require('urlencode');
const randomUseragent = require('random-useragent');


async function tokenCheck(req, res, next) {
    if (req.query.token != process.env.TOKEN) {
        res.send('페이지가 없습니다.');
        return;
    }
    next();
}


router.get('/:page', tokenCheck, async function(req, res, next) {
    var page = req.params.page;

    if (!page) {
        page = 1;
    }

    var json = '';
    await axios({
        method: 'get',
        headers: { 
            'referer': 'https://m.blog.naver.com/SectionPostSearch.naver',
            'user-agent': randomUseragent.getRandom(),
        },
        url: `https://m.blog.naver.com/api/recommend/post?directory=RECIPE&itemCount=18&page=${page}&type=post`,
    }).then(async function (res) {
        json = res.data.result;
    }).catch(function(e) {
        console.log(e);
    });    
    res.send(json);
});

router.get('/search/:page/:keyword', tokenCheck, async function(req, res, next) {
    

    var page = req.params.page;
    const keyword = req.params.keyword;

    if (!page) {
        page = 1;
    }

    var json = '';
    await axios({
        method: 'get',
        headers: { 
            'referer': 'https://m.blog.naver.com/SectionPostSearch.naver',
            'user-agent': randomUseragent.getRandom(),
        },
        url: `https://m.blog.naver.com/api/search/post?keyword=${urlencode(keyword)}&page=${page}&sortType=sim`,
    }).then(async function (res) {
        json = res.data.result;
    }).catch(function(e) {
        console.log(e);
    });

    
    res.send(json);
    
});


module.exports = router;
