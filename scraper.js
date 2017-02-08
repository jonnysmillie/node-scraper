"use strict";

// Dependencies
var fs = require("fs"); // Node module for file system
var request = require("request"); // Node module for HTTP requests
var cheerio = require("cheerio"); // Node module for jQuery 
var json2csv = require("json2csv"); // Node module converts json to csv
var timestamp = require("time-stamp"); // Node module stamp time

// Variables
var dir = "./data";
var homeURL = "http://shirts4mike.com/";
var dataURL = homeURL + "shirts.php";
var data = [];
var shirtArrayURLs = [];
var today = new Date(); // Date and time formatting block
var dd = today.getDate();
var mm = today.getMonth() + 1 ;
var yyyy = today.getFullYear();
var csvFileName = yyyy + "-" + mm + "-" + dd + ".csv"; // CSV filename, e.g. 2017-01-11.csv
var time = timestamp("HH:mm:ss");
var csvFields = ["Title", "Price", "ImageURL", "URL", "Time"]; // Column headers

/////////////////////////////////////////////////////////////////
// Make request to tshirt page and get all of the tshirt URL data
request(dataURL, function(error, response, body) {
   if(!error && response.statusCode === 200) {
      var $ = cheerio.load(body);
      var shirts = $("a[href*='shirt']");
      // Create array of tshirt links
      shirts.each(function() {
         var fullPath = homeURL + $(this).attr("href");
         if(shirtArrayURLs.indexOf(fullPath) === -1) {
            shirtArrayURLs.push(fullPath);
         }
      });
      // Remove URLs that are not needed
      shirtArrayURLs.splice(0,1);
      // Pass URLs to function
      processShirts(shirtArrayURLs); 
   } else {
      console.error("There was a problem with gathering URLS from " + homeURL, error);
   }
});

/////////////////////////////////////////////////////////////////
// Process harvested URLs and write them to file
function processShirts(urls) {
   for (var i = 0; i < shirtArrayURLs.length; i++) {
      request(shirtArrayURLs[i], function(error, response, body) {
         if (!error && response.statusCode === 200) {
            var $ = cheerio.load(body);
            var shirtObj = {}; // Container for harvested data about shirt
            shirtObj.Title  = $("title").text();
            shirtObj.Price = $(".price").text();
            shirtObj.ImageURL = homeURL + $(".shirt-picture img").attr("src");
            shirtObj.URL = response.request.href;
            shirtObj.Time = time;
            data.push(shirtObj);
            // Look for data folder, create one if none exist 
            if (!fs.existsSync(dir)) {
               fs.mkdirSync(dir);
            }
            /////////////////////////////////////////////////////////////////
            // write data to csv
            json2csv({data:data, fields:csvFields}, function(err, csv) {
               if (err) throw err;
               fs.writeFile(dir + "/" + csvFileName, csv, function(err) {
                  if (err) throw err;
                  console.log("Success! Data just written to " + csvFileName + ".");
               });
            });
         } else {
            console.error("There was a problem when cycling through the shirts at " + response.request.href, error);
         }
      });
   }
}