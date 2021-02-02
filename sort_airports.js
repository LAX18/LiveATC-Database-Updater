const airport_json = require('../../json/world_airports.json')
var fs = require("fs")
var json = {}
var progress = 0
for (airport in airport_json) {
    progress++
    if (airport_json[airport].country === "US") {
        /* if (json[airport_json[airport].state]) {

        } else {
            json[airport_json[airport].state] = {}
        }

        if (json[airport_json[airport].state].airports) {

        } else {
            json[airport_json[airport].state].airports = {}
        }
        json[airport_json[airport].state].airports[airport] = {}
        json[airport_json[airport].state].airports[airport] = airport_json[airport] */
        json[airport] = airport_json[airport]
    }
    console.log("[GET] " + airport + " " + progress + "/" + Object.keys(airport_json).length)
}

setTimeout(function() {
    if (progress === Object.keys(airport_json).length) {
        fs.writeFileSync('../../json/us_airports.json', JSON.stringify(json, 0, 4))
        console.log("File Written!")
        return;
    }

}, 50)