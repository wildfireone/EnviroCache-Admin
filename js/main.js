/**
 * @Author: John Isaacs <john>
 * @Date:   27-Feb-172017
 * @Filename: main.js
* @Last modified by:   john
* @Last modified time: 09-Mar-172017
 */

$("#badgelink").click(function(){
  $("#badge-list").show();
  $("#route-list").hide();
});

$("#routelink").click(function(){
  $("#badge-list").hide();
  $("#route-list").show();
});

$("#badge-list").hide();

$("#badge-show").click(function() {
    $("#badge-list").toggle();
    $("#route-list").toggle();
    $(this).text(function(i, text) {
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
    "color": "#f6973f",
    "weight": 5,
    "opacity": 0.65
};

var routecount = 0;
var addedroutes = [];
var badgecount = 0;
var addedbadges = [];
console.log("first setup");
updateBadges();
updateRoutes();

function updateRoutes() {
    routecount = 0;
    addedroutes = [];
    var lastkey;
    $("#route-list").empty();
    var getroutes = database.ref('/routes').once('value').then(function(snapshot) {
        //map tp array from json object, yuk

        snapshot.forEach(function(data) {
            //console.log(data.key);
            if (lastkey == data.val()) {

            } else {
                processdata(data.key, data.val());
                routecount++;
            }


        });
    });
}

function updateBadges() {
    console.log("here");
    badgecount = 0;
    addedbadges = [];
    $("#badge-list").html('');
    var lastkey;
    var getbadges = database.ref('/badges').once('value').then(function(snapshot) {
        //map tp array from json object, yuk

        snapshot.forEach(function(data) {
            if (lastkey == data.val()) {

            } else {
                console.log(data.val());
                processBadge(data.key, data.val());
                badgecount++;
            }


        });
    });
    return "Badges Updated";
}

var getusers = database.ref('/users').once('value').then(function(snapshot) {
    //map tp array from json object, yuk
    var content = "<table class='col-md-10'>";

    var users = $.map(snapshot.val(), function(el) {
        console.log(el);
        //for(var i=0; i<routes.length;i++){
        //try {
        content += "<tr><td>" + el.username + "</td><td>" + el.score + "</td></tr>";
        ///    processdata(el);

        //} catch (err) {
        //    console.log("the geoJSON is wrong! " + err)

        //}

    });
    content += "</table>";
    $("#leaderboard").append(content);

});

function processdata(id, route) {
  console.log("processing route");
  if(route.geoJSON){
    console.log(route);
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


    if (typeof type == "undefined") {
        type = "Point"
    }
    if (type == "Point") {
        coords = coords[0];
    }

    addedroutes.push([id, coords[0]]);


    var geojsonFeature = {
        "type": "Feature",
        "properties": {
            "name": route.title,
            "child": route.child,
            "distance": route.distance,
            "difficulty": route.difficulty,
            "dog": route.dog,
            "note": route.note,
            "time": route.time,
            "title": route.title,
            "wheelchair": route.wheelchair,
            "popupContent": route.title
        },
        "geometry": {
            "type": type,
            "coordinates": coords
        }
    }


    L.geoJSON(geojsonFeature, {
        style: myStyle
    }).addTo(routeMap);

    $("#route-list").append("<div id='route" + routecount + "' divid='" + routecount + "' class='routediv'>" +
        "<strong>" + route.title + "</strong>" +
        "<ul><li>distance: " + distance + "</li><li>difficulty: " + difficulty + "</li><li>time: " + time + "</li><ul>" +
        "<button class='btn btn-secondary btn-sm route-edit' buttonid='" + routecount + "'>Edit Route</button>" +
        "</div>");
    $(".routediv").click(function() {
        var index = $(this).index();
        console.log(parseInt($(this).attr("divid")));
        routeMap.setView([addedroutes[parseInt($(this).attr("divid"))][1][1], addedroutes[parseInt($(this).attr("divid"))][1][0]], 14);
    });
    $(".route-edit").unbind().click(function() {
        var index = $(this).index();
        currentRoute = addedroutes[parseInt($(this).attr("buttonid"))][0]
        $("#route-delete").show();
        $("#route-update").show();
        $("#route-submit").hide();
        $("#myModalNorm").modal("show");
        database.ref('/routes/' + currentRoute).once('value').then(function(snapshot) {
            console.log(snapshot.val());
            $("#r-child").prop('checked',snapshot.val().child == true);
            $("#r-dog").prop('checked',snapshot.val().dog == true);
            $("#r-wheelchair").prop('checked',snapshot.val().wheelchair == true);
            $("#r-difficulty").val(snapshot.val().difficulty);
            $("#r-distance").val(snapshot.val().distance);
            $("#route-desc").val(snapshot.val().note);
            $("#r-timetaken").val(snapshot.val().time);
            $("#route-title").val(snapshot.val().title);
        });
    });
    $("#route-delete").unbind().click(function() {
        database.ref('/routes/' + currentRoute).remove();
        $("#myModalNorm").modal("hide");
      updateRoutes();
    })

    $("#route-update").unbind().click(function() {
        database.ref('/routes/' + currentRoute).update({
          "child": ($("#r-child").val() == 'on') ? true : false,
          "difficulty": parseInt($('#r-difficulty').val()),
          "distance": parseInt($('#r-distance').val()),
          "dog": ($('#r-dog').val() == 'on') ? true : false,
          "note": $('#route-desc').val(),
          "time": parseInt($('#r-timetaken').val()),
          "title": $('#route-title').val(),
          "wheelchair": ($('#r-wheelchair').val() == 'on') ? true : false,
        });
        $("#myModalNorm").modal("hide");
        updateRoutes();
    });
}

}

function processBadge(id, badge) {


    var note = badge.note;
    var title = badge.title;
    var radius = badge.radius;
    var image = badge.image;
    var score = badge.score;


    var coords = getCoords(badge.geoJSON);
    var type = badge.geoJSON.geometry.type;

    addedbadges.push([id, coords]);
    $("#badge-title").val('');
    $("#badge-desc").val('');
    $("#badge-score").val('');

    var geojsonFeature = {
        "properties": {
            "name": badge.title,
            "note": badge.note,
            "title": badge.title,
            "popupContent": badge.title
        }
    }
    var circle = L.circle(coords, radius, {color:'green',opacity:1,fillColor: 'green',fillOpacity:.4}).addTo(routeMap);

    $("#badge-list").append("<div id='badge" + badgecount + "' divid='" + badgecount + "'class='badgediv'>" +
        "<strong>" + title + "</strong>" +
        "<p>description: " + note + " </p>" +
        "<p>score: " + score + " </p>" +
        "<img class='img-thumbnail img-circle' width='100' height='100' src='" + image + "'/>" +
        "<button class='btn btn-secondary btn-sm badge-edit' buttonid='" + badgecount + "'>Edit Badge</button>" +
        "</div>");

    $(".badgediv").unbind().click(function() {
        routeMap.setView(addedbadges[parseInt($(this).attr("divid"))][1], 14);
    });
    $(".badge-edit").unbind().click(function() {
        var index = $(this).index();
        currentBadge = addedbadges[parseInt($(this).attr("buttonid"))][0]
        $("#badge-delete").show();
        $("#badge-update").show();
        $("#badge-submit").hide();
        $("#myModalBadge").modal("show");
        currentBadge = addedbadges[parseInt($(this).attr("buttonid"))][0]
        getusers = database.ref('/badges/' + currentBadge).once('value').then(function(snapshot) {
            console.log(snapshot.val());
            $("#badge-title").val(snapshot.val().title);
            $("#badge-desc").val(snapshot.val().note);
            $("#badge-score").val(snapshot.val().score);
        });
    });
    $("#badge-delete").unbind().click(function() {
        database.ref('/badges/' + currentBadge).remove();
        $("#myModalBadge").modal("hide");
        updateBadges();
    })
    $("#badge-update").unbind().click(function() {
        firebase.database().ref('/badges/' + currentBadge).update({
            title: $("#badge-title").val(),
            score: $("#badge-score").val(),
            note: $("#badge-desc").val()
        });
        $("#myModalBadge").modal("hide");
        updateBadges();
    });

}


function getCoords(json) {
var coords = [[0,0]];
  if(json){
    coords = json.geometry.coordinates;

    for (var i = 0; i < coords.length; i++) {
        var temp = coords[i][0];
        coords[i][0] = coords[i][1];
        coords[i][1] = temp;
    }

  }
  return coords;

}
