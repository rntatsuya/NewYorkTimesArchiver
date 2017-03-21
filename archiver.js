var request = require('request');
var json2csv = require('json2csv');
const fs = require('fs');

const year = process.argv[2]
const month = process.argv[3]

const options = {
  url: 'https://api.nytimes.com/svc/archive/v1/'+year+'/'+month+'.json?api-key=f2d79c8553dc45a4aee6f9a15c754121',
}

const fields = ['url', 'pub_date'];

var articleData = []

function retrieveData(callback) {
  request.get(options, function(err, response, body) {
    body = JSON.parse(body);
    // console.log(body);
    // console.log(body.response.docs);
    var count = 0
    for (var i=0; i<body.response.docs.length; i++) {
      // can use this for articles before Janurary 2007
      if (year < 2007) {
        for (var j=0; j<body.response.docs[i].keywords.length; j++) {
          if (body.response.docs[i].keywords[j].value === "POLITICS AND GOVERNMENT" && body.response.docs[i].document_type === "article") { // && body.response.docs[i].section_name === "U.S."
            articleData.push(createjsonElement(body.response.docs[i]));
            count++;
          }
        }
      }
      else {
      // use this for articles from Janurary 2007 onwards
        for (var k=0; k<body.response.docs[i].keywords.length; k++) {
          if (body.response.docs[i].keywords[k].value === "United States Politics and Government" && body.response.docs[i].document_type === "article") {
            // console.log(body.response.docs[i]);
            articleData.push(createjsonElement(body.response.docs[i]));
            count++;
          }
        }
      }
    }
    if (!err && response.statusCode === 200) {
      console.log(count);
      console.log(articleData);
      callback(articleData);// call the function here to ensure execution after articleData is created
   }

  })
}

function createCSV(data) {
  var csv = json2csv({ data: data, fields: fields });

  fs.writeFile(year+'-'+month+'.csv', csv, function(err) {
    if (err) throw err;
    console.log('file saved');
  });
}

function createjsonElement(thing) {
  return {
    "url": thing.web_url,
    "pub_date": thing.pub_date,
  }
}


retrieveData(createCSV);
