module.exports = async function (context, req) {
    
    var searchString = req.query.station;
    
    try {
        var result = await searchStringGetRequest(searchString)
        var jsonResult = JSON.stringify(result)
    }
    catch (error) {
        console.error(error);
    }
    
    if (result != Error) {
        context.res = {
            status: 200,
            body: jsonResult
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
}

async function searchStringGetRequest(searchString) {
    var request = require("request");
    var dictionary = require('./dictionary')
    var searchedArray = []

    var options = {
        method: 'GET',
        url: 'https://nwrapi.tvc-cmsanywhere.co.uk/api/emu/listings',
        qs:
        {
            displayStart: '0',
            displayLength: '1000',
            sortColumn: '7',
            SortOrder: 'asc',
            search: searchString
        },
        headers:
        {
            'cache-control': 'no-cache',
            Connection: 'keep-alive',
            'accept-encoding': 'deflate',
            Host: 'nwrapi.tvc-cmsanywhere.co.uk',
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            Authorization: 'Bearer '
        }
    };

    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (error) return reject(error);
            console.log("Data received")

            body = JSON.parse(body)
            var stationsArray = body.data

            for (const station in stationsArray) {
                if (stationsArray.hasOwnProperty(station)) {
                    var stationObject = {};

                    const element = stationsArray[station];
                    stationObject.name = element.emuName

                    if (element.outOfCommission || element.notReceiving === "true") {
                        stationObject.status = "out of order"
                    }
                    else {
                        stationObject.status = "operational"
                    }

                    var emuCode = element.emuCode.toString();
                    console.log(emuCode)

                    if (dictionary[emuCode]) {
                        console.log('hit1')
                        stationObject.emuCode = element.emuCode
                        Object.assign(stationObject, dictionary[emuCode])
                    }
                    searchedArray.push(stationObject)
                }

            }
            resolve(searchedArray);
        });
    }
    )
}
