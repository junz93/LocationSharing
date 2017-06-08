var map;                // the map object
var group;              // group id (a number)
var id;                 // member id (a string)
var own_marker;
var dest_marker;
var markers = [];
var repeated_task;      // id of setInterval (the return value of setInterval() method)

// load the map
function initMap() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {lat: position.coords.latitude, lng: position.coords.longitude};
            map = new google.maps.Map(document.getElementById("map"), {
                center: pos,
                zoom: 14
            });

            var input = document.getElementById('dest');
            var searchBox = new google.maps.places.SearchBox(input);
            map.addListener('bounds_changed', function() {
                searchBox.setBounds(map.getBounds());
            });
            searchBox.addListener('places_changed', function() {
                var places = searchBox.getPlaces();
                if (places.length === 0) {
                    return;
                }
                if(dest_marker !== undefined) {
                    dest_marker.setMap(null);
                }
                // Create a marker for the place selected as the destination
                dest_marker = new google.maps.Marker({
                    position: places[0].geometry.location,
                    icon: {
                        labelOrigin: new google.maps.Point(10, -10),
                        url: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=D|6593EC"
                    },
                    title: places[0].name,
                    map: map
                });
                if (places[0].geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                }
                else {
                    bounds.extend(place.geometry.location);
                }

                map.fitBounds(bounds);
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
        if(own_marker === undefined) {
            own_marker = new google.maps.Marker({
                position: {lat: position.coords.latitude, lng: position.coords.longitude},
                icon: {
                    labelOrigin: new google.maps.Point(10, -10),
                    url: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=Y|3FE31A"
                },
                label: {
                    fontSize: "18px",
                    fontFamily: "Consolas",
                    text: "You"
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
                        icon: {
                            labelOrigin: new google.maps.Point(10, -10),
                            // url: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569",
                            url: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld="
                                + data[i]["name"][0].toUpperCase() + "|FE7569"
                        },
                        label: {
                            fontSize: "18px",
                            fontFamily: "Consolas",
                            text: data[i]["name"]
                        },
                        map: map
                    })
                    );
                }
            }
        });
    });
}

// display information on the page and set a interval task exchanging information with server
function showInfo(data, name) {
    // data is an object containing 4 keys: "group", "dest_lat", "dest_lng", "id"
    group = data.group;
    id = data.id;
    $("#part1").css("display", "none");
    $("#part2").css("display", "block");
    $("#i_group").text(group);
    $("#i_name").text(name);
    msgServer();
    repeated_task = setInterval(msgServer, 3000);
    if(dest_marker === undefined) {
        dest_marker = new google.maps.Marker({
            position: {lat: data.dest_lat, lng: data.dest_lng},
            icon: {
                labelOrigin: new google.maps.Point(10, -10),
                url: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=D|6593EC"
            },
            map: map
        });
    }
}

$(document).ready(function() {
    // create a new group
    $("#create").click(function() {
        if(dest_marker === undefined) {
            alert("Please set a destination!");
            return;
        }
        $.get("/share/", {
            "type": 0, 
            "name": $("#name1").val(), 
            "dest_lat": dest_marker.getPosition().lat(),
            "dest_lng": dest_marker.getPosition().lng()
        }, function(data) {
            showInfo(data, $("#name1").val());
        });
    });

    // join a group
    $("#join").click(function() {
        $.get("/share/", {
            "type": 1, 
            "name": $("#name2").val(), 
            "group": $("#group").val()
            // "trans": $("#trans2").val()
        }, function(data) {
            if(data === false) {
                alert("The group number does not exist.");
            }
            else {
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
