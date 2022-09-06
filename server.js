var express = require('express');
var http = require('http');
var https = require('https');
var moment = require('moment-timezone');
var app = express();

moment.tz.setDefault('Europe/Paris');

app.get('/', function (req, res) {
  var stopId = req.query.stopId;
  var route = req.query.route;

//	console.log(stopId, route);
  if (!stopId) return res.status(200).json({
    "frames": [{
      "text": "", "icon": null
    }]
  });
  if (!route) return res.status(200).send("Lametric Grenoble");

  if (stopId.split(':')[0] == "GIN") return parseGinko(stopId, route, res);
  if (stopId.split(':')[0] == "SEM") return parseTag(stopId, route, res);

});

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 6789;
//var ip = ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
app.listen(port);
console.info('Ok started on ' + port);

parseTag = function (stopId, route, res) {
  var url = 'https://data.mobilites-m.fr/api/routers/default/index/clusters/' + stopId + '/stoptimes?route=' + route;
  var line = route.split(':')[1];
  var icon = getIcon(line);

  https.get(url, {
    headers: {
      origin: 'https://www.mobilites-m.fr'
    }
  }, function (response) {
    var body = '';

    response.on('data', function (chunk) {
      body += chunk;
    })

    response.on('error', function (err) {
      console.log(err);
      return res.status(500).send("An error occured");
    });

    response.on('end', function () {
      var data = JSON.parse(body);
      if (!data || data.length == 0) {
        return res.json({
          "frames": [{"text": "Service terminé", "icon": icon}, {
            "text": "...", "icon": icon
          }, {"text": "Service terminé", "icon": icon}, {"text": "...", "icon": icon}]
        });
      }

      var times = {
        1: [], 2: []
      };

      var dests = [];

      for (var i = 0; i < data.length; i++) {
        var dir = data[i].pattern.dir;

        dests[dir] = data[i].pattern.desc;

        for (var j = 0; j < data[i].times.length; j++) {
          times[dir].push(data[i].times[j]);
        }
      }


      for (var i = 1; i <= Object.keys(times).length; i++) {
        times[i].sort(function (a, b) {
          at = a.realtime ? a.realtimeArrival : a.scheduledArrival;
          at += a.serviceDay;
          bt = b.realtime ? b.realtimeArrival : b.scheduledArrival;
          bt += b.serviceDay;

          if (at < bt) return -1;
          if (at > bt) return 1;
          return 0;
        });
      }
//			console.log(times);
      var dest1 = dests[1]//.split(' ')[1]//.split(' -')[0];
      var dest2 = dests[2]//.split(' ')[1]//.split(' -')[0];
      var next1 = times[1][0];
      var next2 = times[2][0];
      var second1 = times[1][1];
      var second2 = times[2][1];
      var nextTime1 = getTime(next1);
      var nextTime2 = getTime(next2);
      var secondTime1 = getTime(second1);
      var secondTime2 = getTime(second2);
      res.json({
        "frames": [{"text": dest1, "icon": icon}, {"text": nextTime1 + "  " + secondTime1}, {
          "text": dest2, "icon": icon
        }, {"text": nextTime2 + "  " + secondTime2}]
      });
    })
  });
}

parseGinko = function (stopId, routeId, res) {
  var stop = stopId.split(':')[1];
  var route = routeId.split(':')[1];

  var icon = getIcon(route);

  var url = "https://api.ginko.voyage/TR/getTempsLieu.do?nom=" + stop + "&apiKey=" + process.env.BESANCON_API_KEY;
  //console.log(url);
  https.get(url, function (response) {
    var body = '';

    response.on('data', function (chunk) {
      body += chunk;
    })

    response.on('error', function (err) {
      console.log(err);
      return res.status(500).send("An error occured");
    });

    response.on('end', function () {
      var data = JSON.parse(body);

      if(!data.ok) return res.json({
        "frames": [{"text": "Fin de service", "icon": icon}, {
          "text": "...", "icon": icon
        }, {"text": "Fin de service", "icon": icon}, {"text": "...", "icon": icon}]
      });

      var times = {
        aller: [], retour: []
      };

      for (var i = 0; i < data.objets.listeTemps.length; i++) {
        i
        if (data.objets.listeTemps[i].idLigne != route) continue;
        if (data.objets.listeTemps[i].sensAller) {
          times.aller.push(data.objets.listeTemps[i]);
        } else {
          times.retour.push(data.objets.listeTemps[i]);
        }
      }

      var next1 = times.aller[0];
      var next2 = times.retour[0];
      var second1 = times.aller[1];
      var second2 = times.retour[1];

      if (!next1) next1 = next2;
      if (!next2) next2 = next1;


      if (!next1 && !next2) return res.json({
        "frames": [{"text": "Fin de service", "icon": icon}, {
          "text": "...", "icon": icon
        }, {"text": "Fin de service", "icon": icon}, {"text": "...", "icon": icon}]
      });

      return res.json({
        "frames": [{
          "text": next1.destination, "icon": icon
        }, {"text": next1.temps}, {"text": next2.destination, "icon": icon}, {"text": next2.temps}]
      });

    })
  });
}


getIcon = function (line) {
  var linesIcon = {
    "A": "a4870",
    "B": "a5182",
    "C": "a4875",
    "D": "a5186",
    "E": "a5187",
    "C1": "a4874",
    "C2": "a5189",
    "C3": "a5190",
    "C4": "a4898",
    "C5": "a4871",
    "C6": "a5193",
    "11": "a5194",
    "12": "a5195",
    "13": "a4873",
    "16": "a5136",
    "17": "a5200",
    "19": "a5201",
    "40": "a5285",
    "41": "a5286",
    "42": "a5287",
    "43": "a5352",
    "44": "a5353",
    "45": "a5354",
    "46": "a5356",
    "47": "a5357",
    "48": "a5358",
    "49": "a5359",
    "50": "a5360",
    "51": "a5361",
    "52": "a5362",
    "53": "a5364",
    "54": "a5365",
    "55": "a5367",
    "56": "a5368",
    "60": "a5369",
    "61": "a5370",
    "62": "a5371",
    "63": "a5372",
    "64": "a5373",
    "65": "a5374",
    "66": "a5375",
    "67": "a5376",
    "68": "a5377",
    "69": "a5378",
    "101": "a5165",
    "102": "a5166",
    "3": "a5167",
    "5": "a5169",
    "6": "a5170",
    "10": "a22786",
    "11": "a5172",
    "14": "a5173",
    "15": "a5174",
    "20": "a5175",
    "21": "a5180",
    "22": "a5177",
    "23": "a5178",
    "24": "a5179"
  };

  return linesIcon[line] || "i541";
}

getTime = function (timeObject) {
  if (!timeObject) return "...";
  var arrival = timeObject.realtime ? timeObject.realtimeArrival : timeObject.scheduledArrival;
  arrival = arrival * 1000;
  var baseTimestamp = timeObject.serviceDay;
  baseTimestamp = baseTimestamp * 1000;
  var now = moment();

  if (baseTimestamp + arrival - now < 1800000) {
    if (baseTimestamp + arrival - now < 60000) {
      return "0m";
    }
    return moment(baseTimestamp + arrival - now).format('m') + "m";
  }
  return moment(baseTimestamp + arrival).format('H:mm');
}
