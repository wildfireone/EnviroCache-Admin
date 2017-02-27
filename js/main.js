/**
 * @Author: John Isaacs <john>
 * @Date:   27-Feb-172017
 * @Filename: main.js
* @Last modified by:   john
* @Last modified time: 27-Feb-172017
 */



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
// Initialize Firebase
var config = {
    apiKey: "AIzaSyBQpfz-F4H8EcQXFmXSjVFCWcLJR3znVtM",
    authDomain: "envirocache-232c1.firebaseapp.com",
    databaseURL: "https://envirocache-232c1.firebaseio.com",
    storageBucket: "envirocache-232c1.appspot.com",
    messagingSenderId: "241058341316"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

var myStyle = {
    "color": "#00a3ff",
    "weight": 5,
    "opacity": 0.65
};

var routecount =0;
var addedroutes =[];
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

function getCoords(json) {
  var coords = json.geometry.coordinates;

  for(var i=0; i<coords.length;i++){
    var temp = coords[i][0];
    coords[i][0] = coords[i][1];
    coords[i][1] = temp;
  }
  return coords;

}
