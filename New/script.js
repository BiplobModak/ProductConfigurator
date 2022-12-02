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
    url: 'http://127.0.0.1:5500/BodyPaint_ABS_BaseColor_V1.png',// change it ot public link
    name: 'Blue',
    color: "bg-info",
    uid: null
  },
  'yellow-blue': {
    url: 'http://127.0.0.1:5500/BodyPaint_ABS_BaseColor_V2.png',
    name: 'Black',
    color: "bg-secondary",
    uid: null
  },
  'red-purple': {
    url: 'http://127.0.0.1:5500/BodyPaint_ABS_BaseColor_V3.png',
    name: 'Red',
    color: "bg-danger",
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

        console.log(materials);
        for (const texture in textures) {
          api.addTexture(textures[texture].url, (err, uid) => {
            if (!err) {
              textures[texture].uid = uid;

              window.console.log(`Registered new texture, ${textures[texture].name}, uid: ${uid}`);

              document.getElementById(`texture-${texture}`).addEventListener('click', () => {

                let materialToUpdate = material;
                materialToUpdate.channels.AlbedoPBR.texture.uid = textures[texture].uid;
                materialToUpdate.channels.AlbedoPBR.enable = true;

                api.setMaterial(materialToUpdate, () => {
                  window.console.log('Updated material.');
                });
              });

            }
          });
        }
      });
      // buttons start here
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

      //api.setCycleMode('all');
      ////////////////
      // ANIMATION END
      ////////////////

    });
  });
};


//////////////////////////////////
// GUI Code
//////////////////////////////////style="background-image: url(${textures[texture].url})"


//action
function initGui() {
  var controls = document.getElementById('TextureButtons');
  var buttonsText = "";
  var i = 0;
  for (const texture in textures) {
    if (i === 0) {
      i = 1;
      buttonsText += `<button id="texture-${texture}" class="texture-button col-1 rounded-circle m-3 active green-orange border border-5 border-dark" 
      data-url="${textures[texture].url}")"></button>`;
    }
    else if (i === 1) {
      i = 3
      buttonsText += `<button id="texture-${texture}" class="texture-button col-1 rounded-circle m-3 yellow-blue border border-5 border-light" 
      data-url="${textures[texture].url}")"></button>`;

    }
    else {
      buttonsText += `<button id="texture-${texture}" class="texture-button col-1 rounded-circle m-3 red-purpl border border-5 border-light" 
      data-url="${textures[texture].url}")"></button>`;

    }
  }
  controls.innerHTML = buttonsText;

}

//
initGui();

//////////////////////////////////
// GUI Code end
//////////////////////////////////

client.init(uid, {
  success: success,
  error: error,
  autostart: 1,
  preload: 1
});
