export let latestResults=null;
export let holistic=null;
export let cameraInstance=null;

export async function initHolistic(
video,
canvas
){

if(
cameraInstance
){

try{

cameraInstance.stop();

}catch(e){}
}


holistic=
new Holistic({

locateFile:f=>
`https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${f}`
});


holistic.setOptions({

modelComplexity:2,

smoothLandmarks:true,

enableSegmentation:false,

refineFaceLandmarks:true,

minDetectionConfidence:0.35,

minTrackingConfidence:0.35
});


holistic.onResults(
r=>{

latestResults=r;
});


cameraInstance=
new Camera(
video,
{

onFrame:
async()=>{

if(
!holistic
)
return;

try{

await holistic.send({
image:video
});

}catch(e){}
},

width:
canvas.width,

height:
canvas.height
});


cameraInstance.start();
}