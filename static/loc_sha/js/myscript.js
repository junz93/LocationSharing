var map;                // the map object
var group;              // group number
var id;                 // client id in a group
var dest;
var repeated_task;      // id of setInterval (the return value of setInterval() method)

// load the map
function initMap() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {lat: position.coords.latitude, lng: position.coords.longitude};
            map = new google.maps.Map(document.getElementById("map"), {
                center: pos,
                zoom: 12
            });
            var marker = new google.maps.Marker({
                position: pos,
                map: map
            });
        });
    }
    else {
        alert("Geolocation is not supported by this browser.");
        $("#part1").css("display", "none");
    }
}

// send location to and receive locations of group members from server
function msgServer() {
    navigator.geolocation.getCurrentPosition(function(position) {
        var msg = {"group": group, "id": id, "lat": position.coords.latitude, "lng": position.coords.longitude};
        // send the location data to server
        $.get("/share/msg/", msg, function(data) {
            if(data !== false) {
                // data is an array of the information of group members
                // an item of this array has the following structure:
                // [latitude, longitude, transportation, name]
                // TODO: display the above information of all group members on the map

            }
        });
    });
}

function showInfo(data) {
    group = data.group;
    id = data.id;
    dest = data.dest;
    $("#part1").css("display", "none");
    $("#part2").css("display", "block");
    $("#i_group").text(group);
    $("#i_name").text(name);
    repeated_task = setInterval(msgServer, 2000);
}

$(document).ready(function() {
    // create a new group
    $("#create").click(function() {
        $.get("/share/", {
            "type": 0, 
            "name": $("#name1").val(), 
            "dest": $("#dest").val(), 
            "trans": $("#trans1").val()
        }, function(data) {
            // data is an object containing 3 keys: "group", "dest", "id"
            showInfo(data);
        });
    });

    // join a group
    $("#join").click(function() {
        $.get("/share/", {
            "type": 1, 
            "name": $("#name2").val(), 
            "group": $("#group").val(), 
            "trans": $("#trans2").val()
        }, function(data) {
            if(data === false) {
                alert("The group number does not exist.");
            }
            else {
                // data is an object containing 3 keys: "group", "dest", "id"
                showInfo(data);
            }
        });
    });

    // exit a group
    $("#exit").click(function() {
        $.get("/share/exit/", {
            "group": group, 
            "id": id
        }, function(data) {
            clearInterval(repeated_task);
            $("#part1").css("display", "block");
            $("#part2").css("display", "none");
        });
    })
});