import {
initHolistic,
latestResults,
holistic,
cameraInstance
}
from "./tracker.js";

import {
render,
previousPose
}
from "./render.js";

const video=
document.getElementById('video');

const canvas=
document.getElementById('output');

const ctx=
canvas.getContext(
'2d',
{
alpha:false
}
);

let currentDeviceId=null;
let showCamera=false;

const isMobile=
/Android|iPhone|iPad|iPod/i
.test(
navigator.userAgent
);


async function startCamera(){

try{

if(
video.srcObject
){

video.srcObject
.getTracks()
.forEach(
t=>t.stop()
);
}


const stream=
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
: "user",

width:{ideal:1280},
height:{ideal:720}
}
});


video.srcObject=
stream;


await new Promise(
resolve=>{

video.onloadedmetadata=
()=>resolve();
}
);


await video.play();


canvas.width=
video.videoWidth;

canvas.height=
video.videoHeight;


previousPose.length=0;


await initHolistic(
video,
canvas
);

latestResults=null;


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

}
catch(err){

console.error(err);

alert(
'Camera access failed.\n\nMake sure:\n- You are on HTTPS\n- Camera permissions are allowed\n- No other app is locking the camera'
);
}
}


document
.getElementById(
'toggleCam'
).onclick=
()=>{

showCamera=
!showCamera;

document
.getElementById(
'toggleCam'
).textContent=

showCamera
? 'HIDE CAM'
: 'SHOW CAM';
};


document
.getElementById(
"cameraBtn"
).onclick=
async()=>{

const devices=
await navigator
.mediaDevices
.enumerateDevices();

const cams=
devices.filter(
d=>
d.kind==="videoinput"
);

const list=
cams.map(
(c,i)=>
`${i}: ${c.label}`
).join(
"\n"
);

const pick=
prompt(
"Choose camera:\n"+
list
);

if(
pick===null
)
return;


currentDeviceId=
cams[
Number(pick)
]?.deviceId;


await startCamera();
};


document
.getElementById(
'obsBtn'
).onclick=
()=>{

alert(
'In OBS:\n\n1. Add Browser Source\n2. Paste your GitHub Pages URL\n3. Set Width=1920 Height=1080\n4. Enable "Refresh browser when scene becomes active"'
);
};


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


await startCamera();

loop();