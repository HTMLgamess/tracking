export let latestResults=null;
export let holistic=null;
export let cameraInstance=null;

let processing=false;

export async function initHolistic(
video,
canvas
){

/*
stop previous camera loop
*/

if(
cameraInstance
){

try{

cameraInstance.stop();

}catch(e){}
}


/*
close previous holistic instance
*/

if(
holistic
){

try{

await holistic.close();

}catch(e){}
}


/*
new holistic instance
*/

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


processing=false;


/*
new camera pipeline
*/

cameraInstance=
new Camera(
video,
{

onFrame:
async()=>{

if(
processing
)
return;

if(
!holistic
)
return;

processing=true;

try{

await holistic.send({
image:video
});

}catch(e){

console.error(e);

}finally{

processing=false;
}
},

width:
canvas.width,

height:
canvas.height
});


cameraInstance.start();
}
