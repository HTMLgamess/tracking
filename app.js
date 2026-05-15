import { initHolistic } from './tracker.js';
import { render } from './render.js';

const video =
document.getElementById('video');

const canvas =
document.getElementById('output');

const ctx =
canvas.getContext(
'2d',
{
alpha:true
}
);

let showCamera=false;
let currentDeviceId=null;
let startingCamera=false;

const isMobile=
/Android|iPhone|iPad|iPod/i
.test(
navigator.userAgent
);


/*
SAFE CAMERA START
*/

async function startCamera(){

if(startingCamera)
return;

startingCamera=true;

try{

/*
FULL CLEANUP
*/

if(video.srcObject){

video.pause();

video.srcObject
.getTracks()
.forEach(
track=>{

track.stop();
}
);

video.srcObject=null;


/*
allow browser time
to release hardware
*/

await new Promise(
r=>setTimeout(
r,
500
)
);
}


/*
LOWER RESOLUTION
for compatibility
*/

let stream=null;

try{

stream=
await navigator
.mediaDevices
.getUserMedia({

audio:false,

video:{

deviceId:
currentDeviceId
? {exact:currentDeviceId}
: undefined,

facingMode:
isMobile
? "user"
: undefined,

width:{
ideal:640
},

height:{
ideal:480
},

frameRate:{
ideal:30,
max:30
}
}
});

}catch(e){

/*
fallback mode
*/

stream=
await navigator
.mediaDevices
.getUserMedia({

audio:false,

video:true
});
}


video.srcObject=
stream;


await video.play();


canvas.width=
video.videoWidth || 640;

canvas.height=
video.videoHeight || 480;


/*
START TRACKER
*/

await initHolistic(
video
);


document
.getElementById(
'dot-cam'
)
.classList.add(
'active'
);

document
.getElementById(
'dot-model'
)
.classList.add(
'active'
);

}catch(err){

console.error(err);

alert(
'Camera error: '+
err.message
);

}finally{

startingCamera=false;
}
}


/*
TOGGLE CAMERA PREVIEW
*/

document
.getElementById(
'toggleCam'
)
.onclick=
()=>{

showCamera=
!showCamera;

document
.getElementById(
'toggleCam'
)
.textContent=

showCamera
? 'HIDE CAM'
: 'SHOW CAM';
};


/*
CAMERA SWITCHER
*/

document
.getElementById(
'cameraBtn'
).onclick=
async()=>{

try{

const devices=
await navigator
.mediaDevices
.enumerateDevices();

const cams=
devices.filter(
d=>
d.kind===
'videoinput'
);


const list=
cams.map(
(c,i)=>
`${i}: ${c.label || 'Camera'}`
).join(
'\\n'
);


const pick=
prompt(
'Choose camera:\\n'+
list
);


if(
pick===null
)
return;


const cam=
cams[
Number(pick)
];


if(!cam)
return;


currentDeviceId=
cam.deviceId;


/*
restart safely
*/

await startCamera();

}catch(err){

console.error(err);
}
};


/*
MAIN RENDER LOOP
*/

function loop(){

requestAnimationFrame(
loop
);

render(
ctx,
canvas,
video,
showCamera
);
}


/*
BOOT
*/

async function init(){

await startCamera();

loop();
}

init();