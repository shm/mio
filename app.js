var express = require('express');
var request = require('request') ;
var _ = require('underscore') ;

var app = express();

var stripCallback = function(jsonString) {
    return body.substring(body.indexOf('({')+1, body.indexOf('})')+1);
}

app.get('/', function (req, res) {

    var num = 50 ;
    var total_pages = 0 ;
    var total_posts = 0 ;
    var page = 0 ;

    var diaries = "" ;


    var loadAllPages = function(pageId) {
      if(pageId == total_pages) {
        res.setHeader("content-type", "text/plain") ;
        res.setHeader('Cache-Control', 'public, max-age=86400'); // one year
        res.send(diaries) ;
        return ;
      }

      request("http://musicdiaries.tumblr.com/api/read/json?callback=yo&filter=text&num="+num + "&start=" + (pageId * num), function (error, response, body) {
          var jsonString = stripCallback(body) ;

          json = JSON.parse(jsonString);

                var myData = json ;
                _.each(myData.posts, function(e) {
                    var caption = e['video-caption'] || e['quote-source'] ;
                    var info = ["", ""];
                    if( caption != undefined ) {
                        caption = caption.replace("<p>", "").replace("</p>", "") ;
                        info = caption.split(" - ") ;
                    }
                    var title = "" ;
                    var link = e['url'] ;
                    var artist = info[0] ;
                    if( info.length == 2 ) {
                        title = info[1] ;
                    }
                    if( caption != undefined ) {
                        diaries += "" + artist + " - " + title + "\n" ;
                    }
                }) ;

                pageId += 1 ;
                loadAllPages(pageId) ;

            }) ;
    } ;



    request("http://musicdiaries.tumblr.com/api/read/json?callback=yo&num="+num, function (error, response, body) {

     var jsonString = stripCallback(body) ;
     json = JSON.parse(jsonString);

     total_posts = parseInt(json["posts-total"]) ;
     total_pages = parseInt( total_posts / num ) + 1 ;

     loadAllPages(0) ;
  }) ;

});

var server = app.listen(3000, function () {

    var host = server.address().address;
      var port = server.address().port;
        console.log('Example app listening at http://%s:%s', host, port);

});
