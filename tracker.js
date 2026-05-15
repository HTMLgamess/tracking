export let latestResults = null;
let holistic = null;

export async function initHolistic(video){

if(holistic){
await holistic.close();
}

holistic = new Holistic({
locateFile:f=>
`https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${f}`
});

holistic.setOptions({
modelComplexity:1,
smoothLandmarks:true,
refineFaceLandmarks:true,
enableSegmentation:false,
minDetectionConfidence:0.5,
minTrackingConfidence:0.5
});

holistic.onResults(r=>{
latestResults = r;
});

async function loop(){

if(video.readyState >= 2){

await holistic.send({
image:video
});
}

requestAnimationFrame(loop);
}

loop();
}
