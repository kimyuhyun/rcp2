const menu = [{
        "title": "회원관리",
        "child": [{
                "title": "권한 관리",
                "link": "/adm/grade"
            },
            {
                "title": "관리자 관리",
                "link": "/adm/manager/1"
            },
            {
                "title": "회원 관리",
                "link": "/adm/user/1"
            }
        ]
    },
    {
        "title": "게시판",
        "child": [
            {
                "title": "공지사항",
                "link": "/adm/board/notice/1"
            },
            {
                "title": "고객센터",
                "link": "/adm/board/cscenter/1"
            },
            {
                "title": "신고",
                "link": "/adm/board/singo/1"
            },
        ]
    },
    {
        "title": "레시피",
        "child": [
            {
                "title": "레시피",
                "link": "/rcp/1"
            },
            {
                "title": "블로거 등록",
                "link": "/rcp/bloger/1"
            },
        ]
    },
    {
        "title": "카테고리",
        "child": [
            {
                "title": "종류별",
                "link": "/rcp/category/cate1/1"
            },
            {
                "title": "상황별",
                "link": "/rcp/category/cate2/1"
            },
            {
                "title": "재료별",
                "link": "/rcp/category/cate3/1"
            },
            {
                "title": "방법별",
                "link": "/rcp/category/cate4/1"
            },
            {
                "title": "테마별",
                "link": "/rcp/category/cate5/1"
            },
        ]
    },
    {
        "title": "통계",
        "child": [{
                "title": "전체방문자",
                "link": "/analyzer/graph1"
            },
            {
                "title": "트래픽수",
                "link": "/analyzer/graph2"
            },
            {
                "title": "시간대별",
                "link": "/analyzer/graph3"
            },
            {
                "title": "현재접속자",
                "link": "/analyzer/liveuser"
            }
        ]
    }
];

module.exports = menu;
