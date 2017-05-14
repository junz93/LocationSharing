var map;                // the map object
var group = -1;         // group number
var id = -1;            // client id

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
        alert("Geolocation is not supported by this browser.")
    }
}

function msgServer(position) {
    var msg = {"group": group, "id": id, "lat": position.coords.latitude, "lng": position.coords.longitude};

    $.get("/share/msg/", msg, function(data) {
        // data is an array of the information of group members
        // an item of this array has the following structure:
        // [latitude, longitude, transportation, name]
        // we should display the above information of all group members on the map
    });
}

// update the map every 2 seconds
setInterval(function() {
    if(group >= 0)
        navigator.geolocation.getCurrentPosition(msgServer);
}, 2000);

$(document).ready(function() {
    $("#create").click(function() {
        var name = $("#name1").val();
        var dest = $("#dest").val();
        var trans = $("#trans1").val();

        $.get("/share/", {"type": 0, "name": name, "dest": dest, "trans": trans}, function(data) {
            group = data.group;
            id = data.id;
            $("form").css("display", "none");
            $("#ingroup").css("display", "block");
            $("#i_group").text(group);
            $("#i_name").text(name);
        });
    });

    $("#join").click(function() {
        var name = $("#name2").val();
        var grp = $("#group").val();
        var trans = $("#trans2").val();

        $.get("/share/", {"type": 1, "name": name, "group": grp, "trans": trans}, function(data) {
            if(data === false) {
                alert("The group number does not exist.");
            }
            else {
                group = data.group;
                id = data.id;
                $("form").css("display", "none");
                $("#ingroup").css("display", "block");
                $("#i_group").text(group);
                $("#i_name").text(name);
            }
        });
    });

    $("#exit").click(function() {

    })
});