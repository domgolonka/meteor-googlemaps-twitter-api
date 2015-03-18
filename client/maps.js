Tag = new Meteor.Collection("tag");
locStream = new Meteor.Stream('loc');
if (Meteor.isClient) {

    Meteor.startup(function() {
        GoogleMaps.load();

    });

    Template.changeTagForm.events({
        'submit form': function(){
            event.preventDefault();
            Meteor.call('tagNameData', event.target.changeTag.value, function(error, results) {
                Session.set("tagName", results);
            });
        }
    });

    Template.changeTagForm.helpers ({
        tagName: function() {
            return  Session.get("tagName");
        },
        listTags: function() {
            return Tag.find().fetch();
        }
    });

    Template.maps.helpers({
        googleMapOptions: function() {
            // Make sure the maps API has loaded
            if (GoogleMaps.loaded()) {
                return {
                    center: new google.maps.LatLng(25,0),
                    zoom: 3
                };
            }
        }
    });

    Template.maps.created = function() {
        // We can use the `ready` callback to interact with the map API once the map is ready.
            GoogleMaps.ready('googleMap', function(map) {
            locStream.on("update", function(message) {
                var latlong = new google.maps.LatLng(message.lat, message.lon);
                var contentString = '<div id="content">'+
                    '<div id="siteNotice">'+
                    '</div>'+
                    '<h1 id="firstHeading" class="firstHeading">'+message.user+'</h1>'+
                    '<div id="bodyContent">'+
                    '<p>'+message.text+'</p><br><br>'+
                    '<p><img src="'+message.img+'"</p>'+
                    '</div>'+
                    '</div>';
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                var marker = new google.maps.Marker({
                    position: latlong,
                    draggable: false,
                    title: message.text,
                    animation: google.maps.Animation.DROP,
                    map: map.instance
                });


                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.open(map,marker);
                });
            });
                //google.maps.event.addDomListener(window, 'load', initialize);
        });
    };


    var Tweets = new Meteor.Collection(null);

    locStream.on("update", function(message) {
        Tweets.insert({
            user: message.user,
            lat: message.lat,
            lon: message.lon,
            time: message.time,
            text: message.text,
            img: message.img,
            img_url: message.img_url,
            created_at: new Date()
        });
    });

    Template.tweetList.helpers({
        tweets: function() {
            return Tweets.find({}, {
                sort: {
                    created_at: -1
                }
            });
        },
        moment: function() {
            return moment(this.time);
        }
    });

    Template.tweetList.rendered = function() {
        return stroll.bind('#tweetList', {
            live: true
        });
    };

    Template.tweet.created = function() {
        return $('.transition').transition("fadeUp");
    };

}