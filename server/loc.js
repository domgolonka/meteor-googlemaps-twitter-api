Tag = new Meteor.Collection("tag");

Meteor.startup(function(){
    //DELETES OLD DATABASE ON START UP
    var globalObject=Meteor.isClient?window:global;
    for(var property in globalObject){
        var object=globalObject[property];
        if(object instanceof Meteor.Collection){
            object.remove({});
        }
    }


});
if (Tag.find() == null) {
    Tag.insert({
        name: ''
    });
}


locStream = new Meteor.Stream("loc");

if (Meteor.isServer) {

    Meteor.methods({
      'tagNameData': function(tagData){
          Tag.insert({
            name:tagData
          });
            tagName = tagData;
          createStream(tagName);
          return tagData;
      }
    });

    // USEFUL FOR MULTIPLE TWEETS
    /*Tag.find().observeChanges({
       added: function() {
           hashArray = Researches.find().fetch();
           hashCount = Researches.find().count();
           for(i=0; i<hashCount; i++){
               hashArray[i]= hashArray[i].hashtag;
           }
       }
    }); */


    // connect the twitter api
    var twit = new TwitMaker({
      consumer_key: 'KCFDBTcKhvkW3TlipwTkq9uZn',
      consumer_secret: 'tofuUJwaMjpl0JgZlUjB2zecmkJUxQtYhgCf6fByj6INTjExzN',
      access_token: '18024838-VtjQLAPoZCYEK0ySy3o8egfHq6xFFpdovu24Sd923',
      access_token_secret: 'hybifExERzEnEXT7OG74lpQKhKh81k7pLV9ae5YHL3TFR'
    });


    createStream = function(tagName) {
        var stream = twit.stream('statuses/filter', {track: tagName});
        console.log(tagName);
        stream.on('tweet', Meteor.bindEnvironment(function (tweet) {
            if (tweet.geo) {
                var userName = tweet.user.screen_name;
                var userTweet = tweet.text;
                var lat = tweet.geo.coordinates[0];
                var lon = tweet.geo.coordinates[1];
                var time = tweet.created_at;
                var text = tweet.text;
                var img = tweet.user.profile_image_url;
                var img_url = tweet.user.profile_image_url_https;
                console.log(userName + " says: " + userTweet + "at " + lat + lon);
                locStream.emit('update', {
                    user: tweet.user.screen_name,
                    lat: tweet.geo.coordinates[0],
                    lon: tweet.geo.coordinates[1],
                    time: tweet.created_at,
                    img: tweet.user.profile_image_url,
                    img_url: tweet.user.profile_image_url_https,
                    lang: tweet.lang,
                    text: tweet.text
                });

            }
        }));
    }

};
