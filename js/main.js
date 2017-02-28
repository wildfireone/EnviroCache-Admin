/**
 * @Author: John Isaacs <john>
 * @Date:   27-Feb-172017
 * @Filename: main.js
* @Last modified by:   john
* @Last modified time: 28-Feb-172017
 */


$("#badge-list").hide();

$("#badge-show").click(function(){
  $("#badge-list").toggle();
  $("#route-list").toggle();
  $(this).text(function(i, text){
          return text === "Show Badges" ? "Show Routes" : "Show Badges";
      })

});
// initialize the map on the "map" div with a given center and zoom
var routeMap = L.map('route-map', {
    center: [58.4621145, -3.4991727],
    zoom: 9
});

var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

// load a tile layer
var testmaps = L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png', {
    attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
    maxZoom: 17,
    minZoom: 9
});

OpenStreetMap_Mapnik.addTo(routeMap);


var myStyle = {
    "color": "#00a3ff",
    "weight": 5,
    "opacity": 0.65
};

var badgeStyle = {
    "color": "#3ff6bf",
    "weight": 5,
    "opacity": 0.65
};

var routecount =0;
var badgecount =0;
var addedroutes =[];
var addedbadges =[];
var getroutes = database.ref('/routes').once('value').then(function(snapshot) {
    //map tp array from json object, yuk
    var routes = $.map(snapshot.val(), function(el) {
        console.log(el);
        //for(var i=0; i<routes.length;i++){
        //try {
            processdata(el);
            routecount++;
        //} catch (err) {
        //    console.log("the geoJSON is wrong! " + err)

        //}

    });

});
var getbadges = database.ref('/badges').once('value').then(function(snapshot) {
    //map tp array from json object, yuk
    var badges = $.map(snapshot.val(), function(el) {
        console.log(el);
        //for(var i=0; i<routes.length;i++){
        //try {
            processBadge(el);
            badgecount++;
        //} catch (err) {
        //    console.log("the geoJSON is wrong! " + err)

        //}

    });

});

var getusers = database.ref('/users').once('value').then(function(snapshot) {
    //map tp array from json object, yuk
    var content = "<table class='col-md-10'>";

    var users = $.map(snapshot.val(), function(el) {
        console.log(el);
        //for(var i=0; i<routes.length;i++){
        //try {
        content+="<tr><td>"+el.username+"</td><td>"+el.score+"</td></tr>";
        ///    processdata(el);

        //} catch (err) {
        //    console.log("the geoJSON is wrong! " + err)

        //}

    });
    content += "</table>";
    $("#leaderboard").append(content);

});
function processdata(route) {
    var child = route.child;
    var distance = route.distance;
    var difficulty = route.difficulty;
    var dog = route.dog;
    var note = route.note;
    var time = route.time;
    var title = route.title;
    var wheelchair = route.wheelchair;


    var coords = getCoords(route.geoJSON);
    var type = route.geoJSON.geometry.type;


    if(typeof type == "undefined"){
      type = "Point"
    }
    if(type == "Point"){
      coords = coords[0];
    }

    addedroutes.push(coords[0]);


    var geojsonFeature = {
      "type": "Feature",
      "properties": {
          "name": route.title,
          "child" : route.child,
          "distance" : route.distance,
          "difficulty" : route.difficulty,
          "dog" : route.dog,
          "note" : route.note,
          "time" : route.time,
          "title" : route.title,
          "wheelchair" : route.wheelchair,
          "popupContent": route.title
      },
      "geometry": {
          "type": type,
          "coordinates": coords
      }
    }


        L.geoJSON(geojsonFeature ,{style: myStyle}).addTo(routeMap);
        $("#route-list").append("<div id='route"+routecount+"' class='routediv'><strong>"+route.title+"</strong> <ul><li>distance: "+distance+"</li><li>difficulty: "+difficulty+"</li><li>time: "+time+"</li><ul> </div>" );
        $(".routediv").click(function() {
          var index = $(this).index();
          routeMap.setView([addedroutes[index][1],addedroutes[index][0]], 14);
        });


}

function processBadge(badge) {


    var note = badge.note;
    var title = badge.title;
    var radius = badge.radius;


    var coords = getCoords(badge.geoJSON);
    var type = badge.geoJSON.geometry.type;

    addedbadges.push(coords);


    var geojsonFeature = {
      "properties": {
          "name": badge.title,
          "note" : badge.note,
          "title" : badge.title,
          "popupContent": badge.title
      }
    }
    var circle = L.circle(coords, radius, {style: badgeStyle}).addTo(routeMap);

        $("#badge-list").append("<div id='badge"+routecount+"' class='badgediv'><strong>"+title+"</strong> <ul><li>description: "+note+"</li><ul> </div>" );
        $(".badgediv").click(function() {
          var index = $(this).index();
          routeMap.setView(addedbadges[index], 14);
        });


}


function getCoords(json) {
  var coords = json.geometry.coordinates;

  for(var i=0; i<coords.length;i++){
    var temp = coords[i][0];
    coords[i][0] = coords[i][1];
    coords[i][1] = temp;
  }
  return coords;

}
