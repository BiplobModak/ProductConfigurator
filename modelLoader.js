// Sketchfab Viewer API: Start/Stop/Control Animation

var version = '1.12.1';
var uid = 'd60856c9beb54e11b0d1c0f992eaf3c7';
var iframe = document.getElementById('api-frame');
var client = new window.Sketchfab(version, iframe);

var error = function error() {
  console.error('Sketchfab API error');
};

// scatchfab api
let api;

// material
let material;


// for dinamic chage it to list or arrey or struct list
const textures = {
  'green-orange': {
    url: 'https://raw.githubusercontent.com/BiplobModak/ProductConfigurator/main/images/BodyPaint_ABS_BaseColor_V1.png',// change it ot public link
    name: 'Blue',
    uid: null
  },
  'yellow-blue': {
    url: 'https://raw.githubusercontent.com/BiplobModak/ProductConfigurator/main/images/BodyPaint_ABS_BaseColor_V2.png',
    name: 'Black',
    uid: null
  },
  'red-purple': {
    url: 'https://raw.githubusercontent.com/BiplobModak/ProductConfigurator/main/images/BodyPaint_ABS_BaseColor_V3.png',
    name: 'Red',
    uid: null
  }
};

var _pollTime, duration;

var timeSlider;
var isSeeking;
var animationsList;
var current_anim;
var apiSkfb;
_pollTime = function pollTime() {
  apiSkfb.getCurrentTime(function (err, time) {
    if (!isSeeking) {
      var percentage = 100 * time / duration;
      timeSlider.value = percentage;
    }
    requestAnimationFrame(_pollTime);
  });
};

var pingpong = false;
var timeFactor = 1.0;

var success = function success(api) {
  apiSkfb = api;
  api.start(function () {
    api.addEventListener('viewerready', function () {
      ////////////////////////////////////////////
      // ANIMATION: WAIT FOR LOADING ////////////
      //////////////////////////////////////////
      api.getAnimations(function (err, animations) {
        console.log(animations);
        animationsList = animations;

        if (animations.length > 0) {
          current_anim = 0;
          api.setCurrentAnimationByUID(animations[current_anim][0]);
          duration = animations[current_anim][2];

          isSeeking = false;

          timeSlider = document.getElementById('timeSlider');

          _pollTime();

          timeSlider.addEventListener('change', function () {
            isSeeking = false;
            api.play();
          });

          timeSlider.addEventListener('input', function () {
            isSeeking = true;
            var time = duration * timeSlider.value / 100;
            api.pause();
            api.seekTo(time, function () {
              api.play();
            });
          });
        }
      });


      api.getMaterialList((err, materials) => {
        material = materials[5]; // There's only one material in this case

        for (const texture in textures) {
          api.addTexture(textures[texture].url, (err, uid) => {
            if (!err) {
              textures[texture].uid = uid;

              window.console.log(`Registered new texture, ${textures[texture].name}, uid: ${uid}`);

              var elements = document.getElementsByClassName(`texture-${texture}`);
              for (var i = 0; i < elements.length; i++) {
                elements[i].addEventListener('click', () => {

                  let materialToUpdate = material;
                  materialToUpdate.channels.AlbedoPBR.texture.uid = textures[texture].uid;
                  materialToUpdate.channels.AlbedoPBR.enable = true;
                  console.log("matrialCheck");
                  //displeCheck(elements[i]);
                  api.setMaterial(materialToUpdate, () => {
                    
                    // console.log(elements[i].id);
                    // var text = elements[i].id;
                    // text = text.slice(0, -1);
                    
                    // var buttons = document.getElementsByClassName("texture-button");

                    // for (let j = 0; j < buttons.length; j++) {
                    //   var currentid = buttons[j].id;
                    //   currentid = currentid.slice(0, -1);
                    //   if (currentid === text) {
                    //     document.getElementById(text + "1-child").style.display = "block";

                    //     document.getElementById(text + "2-child").style.display = "block";

                    //   }
                    //   else {
                    //     document.getElementById(buttons[j].id + "-child").style.display = "none";
                    //   }
                    // }
                    //ActvateCheckMark(elements);
                  });
                });
              }
            }
          });
        }
      });
      // buttons start here
      var checkbox = document.querySelectorAll('input[type="checkbox"]');
      for (let j = 0; j < checkbox.length; j++) {
        checkbox[j].addEventListener('change', function () {
          if (checkbox[j].checked) {
            api.play();
          }
          else {
            api.pause();
          }
        });

      }

      // check ids.
      document.getElementById('play').addEventListener('click', function () {
        api.play();
      });
      document.getElementById('pause').addEventListener('click', function () {
        api.pause();
      });
      document.getElementById('pingpong').addEventListener('click', function () {
        pingpong = !pingpong;
      });

      document.getElementById('previous').addEventListener('click', function () {
        if (current_anim === 0) current_anim = animationsList.length;
        current_anim--;
        api.setCurrentAnimationByUID(animationsList[current_anim][0]);
        api.seekTo(0);
        duration = animationsList[current_anim][2];
        console.log(duration);
      });

      document.getElementById('next').addEventListener('click', function () {
        current_anim++;
        if (current_anim === animationsList.length) current_anim = 0;
        api.setCurrentAnimationByUID(animationsList[current_anim][0]);
        api.seekTo(0);
        duration = animationsList[current_anim][2];
        console.log(duration);
      });

      api.addEventListener('animationChange', function (a) {
        current_anim = 0;

        for (var i = 0; i < animationsList.length; i++) {
          if (animationsList[i][0] === a) {
            duration = animationsList[i][2];
            current_anim = i;
            break;
          }
        }

        console.log('animationChange', a);
      });

      api.addEventListener('animationEnded', function () {
        if (pingpong) timeFactor *= -1;
        api.setSpeed(timeFactor);
        console.log('animationEnded', timeFactor);
      });
      api.addEventListener('animationPlay', function () {
        console.log('animationPlay');
      });
      api.addEventListener('animationStop', function () {
        console.log('animationStop');
      });

    });
  });
};



client.init(uid, {
  success: success,
  error: error,
  autostart: 1,
  preload: 1
});

function displeCheck(e) {
  console.log(e.id);
  var text = e.id;
  text = text.slice(0, -1);
  var buttons = document.getElementsByClassName("texture-button");
  for (let j = 0; j < buttons.length; j++) {
    var currentid = buttons[j].id;
    currentid = currentid.slice(0, -1);
    if (currentid === text) {
      

      document.getElementById(text + "1-child").style.opacity = 1;
      
      document.getElementById(text + "2-child").style.opacity = 1;

    }
    else {
      document.getElementById(buttons[j].id + "-child").style.opacity = 0;
    }
  }

}

