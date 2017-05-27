var map;                // the map object
var group;              // group id (a number)
var id;                 // member id (a string)
var dest;
var own_marker;
var markers = [];
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
            // var marker = new google.maps.Marker({
            //     position: pos,
            //     map: map
            // });
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
        if(own_marker === undefined) {
            own_marker = new google.maps.Marker({
                position: {lat: position.coords.latitude, lng: position.coords.longitude},
                icon: {
                    labelOrigin: new google.maps.Point(0, -10),
                    // labelOrigin: new google.maps.Point(19-2*("TestTest".length), -10),
                    url: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=Y|3FE31A"
                },
                label: {
                    fontSize: "18px",
                    fontFamily: "Consolas",
                    text: "TestTest"
                },
                map: map
            });
        }
        else {
            own_marker.setPosition({lat: position.coords.latitude, lng: position.coords.longitude});
        }
        // send the location data to server
        $.get("/share/msg/", msg, function(data) {
            if(data !== false) {
                // data is an array of objects storing the information of group members
                // each object has 3 keys: "lat", "lng", "name"
                // TODO: display the above information of all group members on the map
                for(var i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }
                markers = [];
                for(i = 0; i < data.length; i++) {
                    markers.push(new google.maps.Marker({
                        position: {lat: data[i]["lat"], lng: data[i]["lng"]},
                        icon: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569",
                        map: map
                    })
                    );
                }
            }
        });
    });
}

// display information on the page and set a interval task exchanging info with server
function showInfo(data, name) {
    group = data.group;
    id = data.id;
    dest = data.dest;
    $("#part1").css("display", "none");
    $("#part2").css("display", "block");
    $("#i_group").text(group);
    $("#i_name").text(name);
    msgServer();
    repeated_task = setInterval(msgServer, 3000);
}

$(document).ready(function() {
    // create a new group
    $("#create").click(function() {
        $.get("/share/", {
            "type": 0, 
            "name": $("#name1").val(), 
            "dest": $("#dest").val(), 
            // "trans": $("#trans1").val()
        }, function(data) {
            // data is an object containing 3 keys: "group", "dest", "id"
            showInfo(data, $("#name1").val());
        });
    });

    // join a group
    $("#join").click(function() {
        $.get("/share/", {
            "type": 1, 
            "name": $("#name2").val(), 
            "group": $("#group").val(), 
            // "trans": $("#trans2").val()
        }, function(data) {
            if(data === false) {
                alert("The group number does not exist.");
            }
            else {
                // data is an object containing 3 keys: "group", "dest", "id"
                showInfo(data, $("#name2").val());
            }
        });
    });

    // exit a group
    $("#exit").click(function() {
        $.get("/share/stop/", {
            "group": group, 
            "id": id
        }, function(data) {
            clearInterval(repeated_task);
            own_marker.setMap(null);
            own_marker = undefined;
            for(var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers = [];
            $("#part1").css("display", "block");
            $("#part2").css("display", "none");
        });
    })
});
