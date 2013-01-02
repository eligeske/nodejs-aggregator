var util = require('util'),
	http = require('http'),
	express = require('./node_modules/express/lib/express.js'),
	mustache = require('./node_modules/mustache/mustache.js'),
	rest = require('./node_modules/restler/lib/restler.js'),
	sax = require('./node_modules/sax/lib/sax.js'),
	request = require('./node_modules/request/main.js'),
	addressparser = require('./node_modules/addressparser/index.js'),
	feedparser = require('./node_modules/feedparser/main.js'),
	
	// url = require('url'),
	fs = require('fs'),
	xml2js = require('./node_modules/xml2js/lib/xml2js');

// LOAD TEMPLATE
var searchResHamlTemplate = fs.readFileSync('./templates/search-res.haml').toString();
var parser = new feedparser();

var feeds = [
	{ 
		name: "eligeske.com",
		url: "http://eligeske.com/feed/",
		dataType: "xml",
		itemsPath: '["rss"]["channel"][0]["item"]',
		itemTitlePath: '["title"][0]',
		itemDescriptionPath: '["description"][0]',
		itemContentPath: '["content:encoded"][0]'
	}
]


var app = express();

var demoData = [
	{ name: "here is the name" }
]

app.get('/:slug', function(req, res){ // get the url and slug info
	
	var slug =[req.params.slug][0]; // grab the page slug
	
	
	var feedit = new feedMe(req,res,feeds,function(items){
		
		//var rData = {feed:items}; // wrap the data in a global object... (mustache starts from an object then parses)
		//var page = fs.readFileSync(slug, "utf8"); // bring in the HTML file
		//var html = mustache.to_html(page, rData); // replace all of the data
		//res.send(html); // send to client
		
		
		
	});
	
	
	
});
app.listen(8888);// start the server listening
console.log('Server running at http://127.0.0.1:3000/'); // server start up message


// CREATE SERVER
// http.createServer(function(req,res){
	// // catch exceptions
	// process.addListener('uncaughtException',function(err){
		// util.puts('Caught Exception: '+err);
		// res.writeHead(500,'text/plain')
		// res.end('error!');
	// });
	// // output
	// // console.log(req);
	// var feedit = new feedMe(req,res,feeds);
// 	
// }).listen(8888, "127.0.0.1");
// 
// util.puts('server running');





var getItemsFromPath = function(data,itemsPath){
	eval("ret = data."+itemsPath);
	return ret;
}

var feedMe = function(req,res, feeds, callback){
	var self = that = this;
	this.req = req;
	this.res = res;
	this.callback = callback;
	this.items = []; // { title: "", content: "", link: "" }
		
	
	function __Default(){
		that.getFeedItems();		
	}
	
	this.getFeedItems = function(){
		console.log("feed length:"+feeds.length);
		for(i=0;i<feeds.length;i++){
			that.getFeed(feeds[i]);
		}
	}
	
	this.getFeed = function(feedObj){
		
		
		var req = {
		  uri: feedObj.url
		};
		
		feedparser.parseUrl(req)
		  .on('response', function (response) {
		    console.log(response);
		  });

		
		// parser.parseUrl(feedObj.url).on('channel', function(feed){			
			// console.log(feed);
		// });
		
		
		return;
		// request = rest.get(feedObj.url);
		// if(feedObj.dataType == "xml"){
			// var xmlparser = new xml2js.Parser();		
			// request.addListener('success', function(data) {
				// parser.parseString(data, function (err, parsedData) {	        
				    // eval("var items = parsedData"+feedObj.itemsPath);
// 				    
				    // for(ii=0;ii<items.length;ii++){
				    	// eval('var title = items['+ii+']'+feedObj.itemTitlePath+';')
				    	// eval('var description = items['+ii+']'+feedObj.itemDescriptionPath+';');
				    	// var str = "item = { title: '"+title+"', description: '"+description+"' } ";				    	
					    // eval(str);					    
					    // that.items.push(item);	
				    	// //console.log(items[ii].title[0]);
				    // }    
				    // that.callback(that.items);
				// });
			// });	
		// }   
				
		request.addListener('error', function(data) {
		  console.log('error:' + data);
		});
		
	}
	
	
	this.myRestCall = function(){
		request = rest.get(that.feedUrl);   
		var parser = new xml2js.Parser();		
		request.addListener('success', function(data) {
			parser.parseString(data, function (err, result) {	        
			    that.output(JSON.stringify(result));
			});
		// console.log(JSON.stringify(result));
		});		
		request.addListener('error', function(data) {
		  console.log('error:' + data);
		});	
	}
	
	this.output = function(out){
		that.res.writeHead(200, {'Content-Type': 'text/html'});
		var html = "<html><head></head><body><script> var data = "+out+"</script></body></html>"
		that.res.end(html);
	}
	
	
	
	__Default();	
}



// function output(out){
	// res.writeHead(200, {'Content-Type': 'text/html'});
	// var html = "<html><head></head><body><script> var data = "+out+"</script></body></html>"
	// res.end(html);
// }
// function myRestCall(url){	
	// request = rest.get(url);   
	// var parser = new xml2js.Parser();
//     
    // request.addListener('success', function(data) {
    	 // parser.parseString(data, function (err, result) {	        
	        // output(JSON.stringify(result));
	    // });
// 	    
        // // console.log(JSON.stringify(result));
    // });
//     
    // request.addListener('error', function(data) {
      // console.log('error:' + data);
    // });
// }
// 
// // MY AGGREGATOR METHODS
// function myRequest(){
// 	
	// var feedUrl = 'http://eligeske.com/feed/';
// 	
	// // get feed xml
	// myRestCall(feedUrl);
// 	
// 	
//  	
// 	
	// return;
    // switch(path) {
      // case '/aggregate':
        // //extract search predicate
        // // var query = urlParsed.query;
        // // if(query != undefined) {
          // // predicate = query.q;
        // // } else {
          // // res.writeHead(400);
          // // res.end('Query expected. Use q=... in the URL');
          // // return;
        // // }
        // async.parallel([
          // // function(callback) {
            // // callRestService(serviceUrls['goo'] + predicate, 'goo', callback);
          // // },
          // function(callback) {
            // callRestService(serviceUrls['twit'], 'twit', callback);
          // }
        // ],
        // //callback
        // function (err, results) {
          // //use the results argument and a haml template to form the view.
          // //results accumulated two arrays of search results, 
          // //for google and twitter respectively.
// 
          // res.writeHead(200, {'Content-Type': 'text/html'});
          // var searchItems = [];
          // for(i=0;i<results.length;i++) {
            // for(sr in results[i]) {
              // searchItems.push(results[i][sr]);
            // }
          // }
           // console.log(searchItems);
//           
          // var op = haml.render(searchResHamlTemplate, {locals: {items: searchItems}});
          // console.log(op); 
          // res.end(op);
        // }
      // );
      // break;
      // default: res.writeHead(200, {'Content-Type': 'text/html'}); res.end("try <a href='/aggregate'>aggregate</a>"); break;
// }


// function callRestService(url, serviceName, callback) {
        // request = rest.get(url);
//         
        // request.addListener('success', function(data) {
            // searchResults = [];
            // if(serviceName == 'goo') {
              // dataJson = JSON.parse(data).responseData.results;
              // for(sr in dataJson) {
                // searchResult = {}
                // searchResult.url = dataJson[sr].url;
                // searchResult.text = dataJson[sr].title;
                // searchResults.push(searchResult);
              // }
            // } else if(serviceName == 'twit') {
              // dataJson = data.results;  
              // for(sr in dataJson) {
                // searchResult = {}
                // searchResult.url = 'http://twitter.com/' + dataJson[sr].from_user + '/status/' + dataJson[sr].id;
                // searchResult.text = dataJson[sr].text;
                // searchResults.push(searchResult);
              // }
            // }
          // callback(null, searchResults);
        // });
        // request.addListener('error', function(data) {
          // util.puts('Error fetching [' + url + ']. Body:\n' + data);
          // callback(null, ' ');
        // });
    // }
// }


