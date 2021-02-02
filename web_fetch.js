const request = require('request');
const cheerio = require('cheerio');
const io = require('@pm2/io')
const airport_json = require('json/us_airports.json')
var fs = require("fs")
var json = {}
var progress = 0
var tstatus = 0

function requestWebsite(airport) {
    var options = {
        url: "http://localhost:8080/www.liveatc.net/search/?icao=" + airport,
        timeout: 0,
        followRedirect: false,
        headers: {
            'Connection': 'keep-alive',
            'origin': '*'
        }
    }
    request(options, function(err, res, body) {
        if (err) {
            console.error(err)
        }
        progress++
        console.log(res.statusCode + " [GET] " + airport + " " + progress + "/" + Object.keys(airport_json).length)
        currentAirportName.set(airport)
        currentAirportNumber.set(progress)
        parseData(body, airport)
    })
}

function parseData(body, airport) {
    let a = cheerio.load(body);
    if (json[airport_json[airport].state]) {

    } else {
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
        json[airport_json[airport].state].airports[airport].feeds = "ERROR"
    } else {
        var feedName = a('table.body > tbody > tr > td[bgcolor="lightblue"]');
        n = 0
        json[airport_json[airport].state].airports[airport].feeds = {}
        json[airport_json[airport].state].airports[airport].name = airport_json[airport].name
        feedName.each(function() {
            let title = a(this).find("strong").text();
            json[airport_json[airport].state].airports[airport].feeds[n] = {}
            json[airport_json[airport].state].airports[airport].feeds[n].name = title
            n++
        });
        var pageurl = a('table.body > tbody > tr:nth-child(4) > td')
        i = 0
        pageurl.each(function() {
            let title = a(this).find("a").attr('href');
            if (title) {
                json[airport_json[airport].state].airports[airport].feeds[i].url = title
                i++
            }
        });
    }
    if (progress === Object.keys(airport_json).length) {
        writeFile()
    }
}

const totalairports = io.metric({
    name: 'Total Airports'
})

const currentAirportName = io.metric({
    name: 'Current Airport Name'
});

const currentAirportNumber = io.metric({
    name: 'Current Airport Number'
});

totalairports.set(Object.keys(airport_json).length)

for (airport in airport_json) {
    console.log("Progress: " + tstatus)
    setTimeout((function(airport) {
        return function() {
            // console.log(airport)
            requestWebsite(airport_json[airport].icao);
        }
    })(airport), tstatus * 450);
    tstatus++
};

function writeFile() {
    fs.writeFileSync('liveatc.json', JSON.stringify(json, 0, 4))
    console.log("File Written")
}