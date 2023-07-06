const request = require('request');
const cheerio = require('cheerio');
const sortJson = require('sort-json');
var vm = require("vm")
const airport_json = require('./world_airports.json')
var fs = require("fs")
var json = {}
var progress = 0
var tstatus = 0

function requestWebsite(airport) {
    var options = {
        url: "http://192.168.0.201:7000/www.liveatc.net/search/?icao=" + airport,
        timeout: 0,
        followRedirect: false,
        headers: {
            'Connection': 'keep-alive',
            'origin': '*'
        }
    }
    request(options, function (err, res, body) {
        if (err) {
            console.error(err)
        }
        progress++
        console.log(res.statusCode + " [GET] " + airport + " " + progress + "/" + Object.keys(markers).length)
        parseData(body, airport)
    })
}

function parseData(body, airport) {
    if (airport_json[airport]) {
        if (airport_json[airport].country === "US") {
            let a = cheerio.load(body);
            if (json[airport_json[airport].state]) {

            } else if (airport_json[airport].state != "") {
                json[airport_json[airport].state] = {}
            }

            if (json[airport_json[airport].state].airports) {

            } else {
                json[airport_json[airport].state].airports = {}
            }


            json[airport_json[airport].state].airports[airport] = {}
            // console.log(a('div.col1:nth-child(1) > table.body > tbody > tr:nth-child(2) > td').html())
            // var feedName = a('table.body > tbody > tr > td[bgcolor="lightblue"]');
            if (a('font.body > font[color="red"]').html()) {
                //json[airport_json[airport].state].airports[airport].feeds = "ERROR"
            } else {
                var feedName = a('table.body > tbody > tr > td[bgcolor="lightblue"]');
                n = 0
                json[airport_json[airport].state].airports[airport].feeds = {}
                json[airport_json[airport].state].airports[airport].name = airport_json[airport].name
                feedName.each(function () {
                    let title = a(this).find("strong").text();
                    json[airport_json[airport].state].airports[airport].feeds[n] = {}
                    json[airport_json[airport].state].airports[airport].feeds[n].name = title
                    n++
                });
                var pageurl = a('table.body > tbody > tr:nth-child(4) > td')
                i = 0
                pageurl.each(function () {
                    let title = a(this).find("a").attr('href');
                    if (title) {
                        json[airport_json[airport].state].airports[airport].feeds[i].url = title
                        i++
                    }
                });
            }
        }
    }
    if (progress === Object.keys(markers).length) {
        writeFile()
    }
}

var options = {
    url: "https://www.liveatc.net/map/markers.js",
    timeout: 0,
    followRedirect: false,
    headers: {
        'Connection': 'keep-alive',
        'origin': '*'
    }
}
request(options, function (err, res, body) {
    if (err) {
        console.error(err)
    }
    vm.runInThisContext(body)
    for (item in markers) {
        console.log("Progress: " + tstatus)
        setTimeout((function (item) {
            return function () {
                // console.log(airport)
                requestWebsite(markers[item].name);
            }
        })(item), tstatus * 250);
        tstatus++
    };
})



function writeFile() {
    fs.writeFileSync('/var/www/html/reports/liveatc.json', JSON.stringify(json, 0, 4))
    sortJson.overwrite('/var/www/html/reports/liveatc.json');
    console.log("File Written")
}
