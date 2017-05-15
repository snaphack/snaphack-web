function buildItem(id, type, length, src, preview, link, seen, time) {
  return {
      "id": id,
      "type": type,
      "length": length,
      "src": src,
      "preview": preview,
      "link": link,
      "seen": seen,
      "time": time
  };
}

var initDemo = function() {
  var header = document.getElementById("header");
  var skin = location.href.split('skin=')[1];

  if(!skin) {
    skin = 'Snapgram';
  }

  if(skin.indexOf('#') !== -1){
    skin = skin.split('#')[0];
  }

  var skins = {
    'Snapgram': {
      'avatars': true,
      'list': false,
      'autoFullScreen': false,
      'cubeEffect': true
    },

    'VemDeZAP': {
      'avatars': false,
      'list': true,
      'autoFullScreen': false,
      'cubeEffect': false
    },

    'FaceSnap': {
      'avatars': true,
      'list': false,
      'autoFullScreen': true,
      'cubeEffect': false
    },

    'Snapssenger': {
      'avatars': false,
      'list': false,
      'autoFullScreen': false,
      'cubeEffect': false
    }
  };

  function getStoriesArray(callback) {
    var storyName = "Group Story";
    var storyId = "group-story";
    var items = [];

    axios.get('/get-snaps')
      .then(function(response) {
        var snaps = response.data;

        for(var i = 0; i < snaps.length; i++) {
          var snap = snaps[i];
          var filename = snap.filename;
          // is it a video?
          var ext = filename.substring( filename.indexOf('.') , filename.length );
          var type = "photo";
          if(ext === ".mp4") {
            type = "video"
          }

          var item = buildItem(filename, type, snap.length, snap.url, snap.url, '', false, snap.date);
          items.push(item);
        }

        var storyPreview = items[0].preview;

        if(items[0].type === "video") {
          for(var i = 0; i < items.length; i++) {
            if(items[i].type === "photo") {
              storyPreview = items[i].preview;
              break;
            }
          }
        }

        callback([{
            id: storyId,
            photo: storyPreview,
            name: storyName,
            link: '',
            lastUpdated: items[items.length - 1].time,
            items: items
          }]);
      })
      .catch(function(error) {
        console.log("Error getting snaps!");
        console.log(error);
      });
  }

  initZuck();

  function initZuck() {
    getStoriesArray(function(storiesResponse) {
      var stories = new Zuck('stories', {
        backNative: true,
        autoFullScreen: skins[skin]['autoFullScreen'],
        skin: skin,
        avatars: skins[skin]['avatars'],
        list: skins[skin]['list'],
        cubeEffect: skins[skin]['cubeEffect'],
        localStorage: true,
        stories: storiesResponse
      });
    });
  }

  var el = document.querySelectorAll('#skin option');
  var total = el.length;
  for (var i = 0; i < total; i++) {
    var what = (skin == el[i].value) ? true : false;
    if(what) {
      el[i].setAttribute('selected', what);

      header.innerHTML = skin;
      header.className = skin;
    } else {
      el[i].removeAttribute('selected');
    }
  }
  document.body.style.display = 'block';

};

initDemo();
