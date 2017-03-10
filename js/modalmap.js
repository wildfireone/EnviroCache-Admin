/**
 * @Author: John Isaacs <john>
 * @Date:   27-Feb-172017
 * @Filename: modalmap.js
* @Last modified by:   john
* @Last modified time: 09-Mar-172017
 */

var ctype;
var currentRoute;
var drawnItems, drawControl;
$("#new-route").hide();
$("#draw-cancel").hide();
$("#new-badge").hide();

$("#draw-route").click(function() {
    $("#draw-cancel").show();
    $("#new-route").show();
    $("#new-badge").hide();
    ctype = "line";
    drawnItems = new L.FeatureGroup();
    routeMap.addLayer(drawnItems);
    try {
        routeMap.removeControl(drawControl);
        routeMap.removeLayer(drawnItems);
    } catch (err) {}
    drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems
        },
        draw: {
            polygon: false,
            marker: false,
            rectangle: false,
            circle: false
        },
    });
    routeMap.addControl(drawControl);
});

$("#choose-file").click(function() {
    imageupload($(":file"));
});

$("#add-badge").click(function() {
    $("#draw-cancel").show();
    $("#new-badge").show();
    $("#new-route").hide();
    ctype = "badge";

    drawnItems = new L.FeatureGroup();
    routeMap.addLayer(drawnItems);
    try {
        routeMap.removeControl(drawControl);
        routeMap.removeLayer(drawnItems);
    } catch (err) {}
    drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems
        },
        draw: {
            polygon: false,
            marker: false,
            rectangle: false,
            polyline: false
        },
    });
    routeMap.addControl(drawControl);
});

$("#draw-cancel").click(function() {
    $("#draw-cancel").hide();
    $("#new-route").hide();
    $("#new-badge").hide();
    routeMap.removeControl(drawControl);
    routeMap.removeLayer(drawnItems);
});


routeMap.on('draw:created', function(e) {
    var type = e.layerType,
        layer = e.layer,
        ss = "",
        lls;
    if (type === 'marker') {
        layer.bindPopup('A popup!');
        currentRoute = {
            "type": "marker",
            "coordinates": [layer.getLatLng().lat, layer.getLatLng().lng]
        }
    } else if (type === 'circle') {
        currentRoute = {
            "type": "circle",
            "radius": layer.getRadius(),
            "coordinates": [layer.getLatLng().lat, layer.getLatLng().lng]
        };
        $("#myModalBadge").modal("show");
        $("#badge-delete").hide();
        $("#badge-update").hide();
        $("#badge-submit").show();
    } else if (type === 'rectangle' || type === 'polygon' || type === 'polyline') {
        if (type === 'polyline') {
            currentRoute = {
                "type": "polyline",
                "radius": layer.getRadius,
                "coordinates": layer.getLatLngs()
            };
        } else {
            currentRoute = {
                "type": "other",
                "radius": layer.getRadius,
                "coordinates": layer.getLatLngs()
            };
        }


        $("#myModalNorm").modal("show");
        $("#route-delete").hide();
        $("#route-update").hide();
        $("#route-submit").show();

        routeMap.removeControl(drawControl);
        routeMap.removeLayer(drawnItems);
        //document.getElementById('t').innerHTML = "lls = [" + ss + "];";
    } else {
        console.log(type);
        console.log(layer);
    }

    drawnItems.addLayer(layer);

});

$("#route-cancel").click(function() {
    $("#draw-cancel").hide();
    $("#new-route").hide();
    try {
        routeMap.removeControl(drawControl);
        routeMap.removeLayer(drawnItems);
    }catch(err){}
});
$("#route-submit").click(function() {
    $("#draw-cancel").hide();
    $("#new-route").hide();
    try {
        routeMap.removeControl(drawControl);
        routeMap.removeLayer(drawnItems);
        console.log(currentRoute);
    }catch(err){}

    ProcessModal();
    updateRoutes();

});
$("#badge-cancel").click(function() {
    $("#draw-cancel").hide();
    $("#new-route").hide();
    try {
        routeMap.removeControl(drawControl);
        routeMap.removeLayer(drawnItems);
    }catch(err){}
});
$("#badge-submit").click(function() {
    $("#draw-cancel").hide();
    $("#new-route").hide();
    try {
        routeMap.removeControl(drawControl);
        routeMap.removeLayer(drawnItems);
    }catch(err){}

    ProcessModalBadge();
    updateBadges();

});

function clearModal() {

}

function ProcessModal() {

    var routeJSON = generateGeoJSON();
    var storedroute = {
            "child": ($("#r-child").val() == "on") ? true : false,
            "difficulty": parseInt($("#r-difficulty").val()),
            "distance": parseInt($("#r-distance").val()),
            "dog": ($("#r-dog").val() == "on") ? true : false,
            "geoJSON": routeJSON,
            "note": $("#route-desc").val(),
            "time": parseInt($("#r-timetaken").val()),
            "title": $("#route-title").val(),
            "wheelchair": ($("#r-wheelchair").val() == "on") ? true : false,
            "radius": (typeof currentRoute.radius == "undefined") ? 0 : parseInt(currentRoute.radius),
        }
        //console.log(storedroute);
    writeToDatabase(storedroute);
    $("#myModalNorm").modal("hide");

}

function generateGeoJSON() {
    var type = "Point";
    if (currentRoute.type == "polyline") {
        type = "LineString"
    }

    var coordinates = [];
    for (var i = 0; i < currentRoute.coordinates.length; i++) {
        coordinates.push([currentRoute.coordinates[i].lat, currentRoute.coordinates[i].lng]);
    }
    var geometry = {
        "coordinates": coordinates,
        "type": type
    }
    var geoJson = {
        "geometry": geometry,
        "type": "Feature"
    }
    return geoJson;
}

function writeToDatabase(routeData) {
    var newPostKey = database.ref().child('routes').push().key;
    var updates = {};
    updates['/routes/' + newPostKey] = routeData;
    firebase.database().ref().update(updates);
}

function writeToDatabaseBadge(routeData) {
    var newPostKey = database.ref().child('routes').push().key;
    var updates = {};
    updates['/badges/' + newPostKey] = routeData;
    firebase.database().ref().update(updates);
}


$("badge-delete").hide();
$("badge-update").hide();

function ProcessModalBadge() {
    var type = "Point";
    var coordinates = [currentRoute.coordinates[0], currentRoute.coordinates[1]];
    var geometry = {
        "coordinates": coordinates,
        "type": type
    }
    var geoJson = {
        "geometry": geometry,
        "type": "Feature"
    }
    var storedbadge = {
        "geoJSON": geoJson,
        "note": $("#badge-desc").val(),
        "title": $("#badge-title").val(),
        "score": $("#badge-score").val(),
        "code": randomString(6),
        "image": downloadURL,
        "radius": (typeof currentRoute.radius == "undefined") ? 0 : parseInt(currentRoute.radius),
    }
    console.log(storedbadge);
    writeToDatabaseBadge(storedbadge);
    $("#myModalBadge").modal("hide");

}

function randomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
