var util = require('util'),
	http = require('http'),
	rest = require('./node_modules/restler/lib/restler'),
	async = require('./node_modules/async/lib/async'),
	haml = require('./node_modules/haml/lib/haml'),
	url = require('url'),
	fs = require('fs');

// LOAD TEMPLATE
var searchResHamlTemplate = fs.readFileSync('./templates/search-res.haml').toString();


// CREATE SERVER
http.createServer(function(req,res){
	
	// catch exceptions
	process.addListener('uncaughtException',function(err){
		util.puts('Caught Exception: '+err);
		res.writeHead(500,'text/plain')
		res.end('error!');
	});
	// output
	myRequest(req,res);
	
}).listen(8888, "127.0.0.1");

util.puts('server running');


// MY AGGREGATOR METHODS
function myRequest(req,res){
	
	var serviceUrls = {};
    serviceUrls.twit = 'https://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name=eligeske&count=2';
    serviceUrls.goo = 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=';
    var urlParsed = url.parse(req.url, true);
    var path = urlParsed.pathname;

	
	
	



    switch(path) {
      case '/aggregate':
        //extract search predicate
        // var query = urlParsed.query;
        // if(query != undefined) {
          // predicate = query.q;
        // } else {
          // res.writeHead(400);
          // res.end('Query expected. Use q=... in the URL');
          // return;
        // }
        async.parallel([
          // function(callback) {
            // callRestService(serviceUrls['goo'] + predicate, 'goo', callback);
          // },
          function(callback) {
            callRestService(serviceUrls['twit'], 'twit', callback);
          }
        ],
        //callback
        function (err, results) {
          //use the results argument and a haml template to form the view.
          //results accumulated two arrays of search results, 
          //for google and twitter respectively.

          res.writeHead(200, {'Content-Type': 'text/html'});
          var searchItems = [];
          for(i=0;i<results.length;i++) {
            for(sr in results[i]) {
              searchItems.push(results[i][sr]);
            }
          }
           console.log(searchItems);
          
          var op = haml.render(searchResHamlTemplate, {locals: {items: searchItems}});
          console.log(op); 
          res.end(op);
        }
      );
      break;
      default: res.writeHead(200, {'Content-Type': 'text/html'}); res.end("try <a href='/aggregate'>aggregate</a>"); break;
}

function callRestService(url, serviceName, callback) {
        request = rest.get(url);
        
        request.addListener('success', function(data) {
            searchResults = [];
            if(serviceName == 'goo') {
              dataJson = JSON.parse(data).responseData.results;
              for(sr in dataJson) {
                searchResult = {}
                searchResult.url = dataJson[sr].url;
                searchResult.text = dataJson[sr].title;
                searchResults.push(searchResult);
              }
            } else if(serviceName == 'twit') {
              dataJson = data.results;  
              for(sr in dataJson) {
                searchResult = {}
                searchResult.url = 'http://twitter.com/' + dataJson[sr].from_user + '/status/' + dataJson[sr].id;
                searchResult.text = dataJson[sr].text;
                searchResults.push(searchResult);
              }
            }
          callback(null, searchResults);
        });
        request.addListener('error', function(data) {
          util.puts('Error fetching [' + url + ']. Body:\n' + data);
          callback(null, ' ');
        });
    }
}

