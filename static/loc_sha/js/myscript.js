function initMap() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {lat: position.coords.latitude, lng: position.coords.longitude};
            var map = new google.maps.Map(document.getElementById("map"), {
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
        alert("Geolocation is not supported by your browser.")
    }
}

var group = -1;
var id = -1;

function msgServer(position) {
    var msg = {"group": group, "id": id, "lat": position.coords.latitude, "lng": position.coords.longitude};

    $.get("/msg/", msg, function(data) {

    });
}

$(document).ready(function() {
    $("#create").click(function() {
        var dest = $("#dest").val();
        var trans = $("#trans1").val();

        $.get("/share/", {"type": 0, "dest": dest, "trans": trans}, function(data) {
            group = data.group;
            id = data.id;
        });
    });

    $("#join").click(function() {
        var grp = $("#group").val();
        var trans = $("#trans2").val();

        $.get("/share/", {"type": 1, "group": grp, "trans": trans}, function(data) {
            if(data === false) {
                alert("The group number does not exist.");
            }
            else {
                group = data.group;
                id = data.id;
            }
        });
    });

    // while(true) {
    //     if(group >= 0) {
    //         navigator.geolocation.getCurrentPosition(msgServer);
    //     }
    //     // wait 1 second
    //
    // }
});