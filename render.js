import {
smoothPoint
}
from "./utils.js";

import {
latestResults
}
from "./tracker.js";

export let previousPose=[];

export function render(
ctx,
canvas,
video,
showCamera
){

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);


/*
CAMERA PREVIEW
*/

if(
showCamera
){

ctx.save();

ctx.globalAlpha=.25;

ctx.scale(
-1,
1
);

ctx.drawImage(
video,
-canvas.width,
0,
canvas.width,
canvas.height
);

ctx.restore();
}


if(
!latestResults
)
return;


const pose=
latestResults.poseLandmarks;

if(
!pose
)
return;


/*
BODY (UNCHANGED)
*/

const JOINTS=
pose.map(
(
lm,
i
)=>{

const raw={

x:
(1-lm.x)
*canvas.width,

y:
lm.y*
canvas.height
};


const smooth=
smoothPoint(
raw,
previousPose[i]
);


previousPose[i]=
smooth;

return smooth;
});


const shoulders={

x:
(
JOINTS[11].x+
JOINTS[12].x
)/2,

y:
(
JOINTS[11].y+
JOINTS[12].y
)/2
};


const hips={

x:
(
JOINTS[23].x+
JOINTS[24].x
)/2,

y:
(
JOINTS[23].y+
JOINTS[24].y
)/2
};


/*
NECK: X follows shoulder midpoint,
Y sits between shoulders and pose nose (JOINTS[0])
so it tracks the actual body rather than a fixed offset
*/
const neck={

x:
shoulders.x,

y:
shoulders.y*0.7+
JOINTS[0].y*0.3
};


const extra={

neck,

spine:{

x:
(
neck.x+
hips.x
)/2,

y:
(
neck.y+
hips.y
)/2
},

hips
};


ctx.lineWidth=2;
ctx.strokeStyle='#00f5ff';
ctx.fillStyle='#00f5ff';

// declared here so BONES section can reference it even if FACE block is skipped
let jawMid=null;


/*
FACE RIG (CLEANED SKULL - NO FLOATING LINES)
*/

const FACE=
latestResults.faceLandmarks;

if(
FACE
){

/*
CORE ANCHORS
*/
const chin=FACE[152];
const nose=FACE[1];
const noseTip=FACE[4];

const leftEye=FACE[33];
const rightEye=FACE[263];

const leftCheek=FACE[234];
const rightCheek=FACE[454];

const forehead=FACE[10];

const jawLeft=FACE[172];
const jawRight=FACE[397];

const crown=FACE[10];
const leftTemple={x:FACE[127].x+0.02, y:Math.max(FACE[127].y-0.05, crown.y+0.01)};
const rightTemple={x:FACE[356].x-0.02, y:Math.max(FACE[356].y-0.05, crown.y+0.01)};


/*
MID SKULL (kept but stabilized)
*/
const leftSkullMid={
x: (leftTemple.x + forehead.x) / 2,
y: (leftTemple.y + forehead.y) / 2 - 0.02
};

const rightSkullMid={
x: (rightTemple.x + forehead.x) / 2,
y: (rightTemple.y + forehead.y) / 2 - 0.02
};


/*
RIG POINTS
*/
const faceRigRaw=[

forehead,
leftEye,
rightEye,
nose,
noseTip,
chin,
jawLeft,
jawRight,
leftCheek,
rightCheek,
crown,
leftTemple,
rightTemple,
leftSkullMid,
rightSkullMid
];


/*
SMOOTHING
*/
const facePts=faceRigRaw.map((lm,i)=>{

const raw={

x:
(1-lm.x)
*canvas.width,

y:
lm.y*
canvas.height
};


const index=
500+i;


const prev=
previousPose[index];


const final=
smoothPoint(
raw,
prev
);


previousPose[index]=final;

return final;
});


/*
JAW MIDPOINT (screen space, smoothed via facePts)
facePts[6] = jawLeft, facePts[7] = jawRight
Used to connect the body neck to the face jaw base
*/
jawMid={
x:(facePts[6].x+facePts[7].x)/2,
y:(facePts[6].y+facePts[7].y)/2
};

/*
FIXED SKULL CONNECTIONS (NO EXTERNAL ESCAPING LINES)
*/
const FACE_BONES=[

/* face core */
[0,1],
[0,2],
[0,3],
[1,3],
[2,3],

/* nose */
[3,4],
[4,5],

/* jaw */
[6,5],
[5,7],
[6,7],

/* cheeks */
[8,1],
[9,2],

/* face frame */
[8,6],
[9,7],

/* forehead up to crown */
[0,10],

/* temples to crown */
[11,10],
[12,10],

/* connect back INTO face only (no outward leaks) */
[11,8],
[12,9]
];


for(
const [a,b]
of FACE_BONES
){

const p1=
facePts[a];

const p2=
facePts[b];


/*
SAFETY CHECK (prevents stray lines)
*/
if(
!p1||
!p2
||
isNaN(p1.x)||
isNaN(p1.y)||
isNaN(p2.x)||
isNaN(p2.y)
)
continue;


ctx.beginPath();

ctx.moveTo(
p1.x,
p1.y
);

ctx.lineTo(
p2.x,
p2.y
);

ctx.stroke();
}

/*
PUPILS (UNCHANGED)
*/
const LEFT_PUPIL=468;
const RIGHT_PUPIL=473;


for(
const i of
[
LEFT_PUPIL,
RIGHT_PUPIL
]
){

const lm=FACE[i];

const p={

x:
(1-lm.x)
*canvas.width,

y:
lm.y*
canvas.height
};


const index=600+i;

const prev=previousPose[index];

const final=smoothPoint(p,prev);

previousPose[index]=final;


ctx.beginPath();

ctx.arc(
final.x,
final.y,
3,
0,
Math.PI*2
);

ctx.fill();
}
}


/*
BODY BONES (UNCHANGED)
*/

// jawMid is computed inside the FACE block above;
// fall back to neck position if face not detected
const jawMidPoint = jawMid || extra.neck;

const BONES=[

['jawMidPt','neck'],

[11,12],

['neck','spine'],
['spine','hips'],

[11,13],
[13,15],

[12,14],
[14,16],

[23,25],
[25,27],
[27,31],

[24,26],
[26,28],
[28,32]
];

const boneExtra={
...extra,
jawMidPt: jawMidPoint
};


for(
const [a,b]
of BONES
){

const p1=
typeof a==="number"
? JOINTS[a]
: boneExtra[a];

const p2=
typeof b==="number"
? JOINTS[b]
: boneExtra[b];

if(
!p1||
!p2
)
continue;


ctx.beginPath();

ctx.moveTo(
p1.x,
p1.y
);

ctx.lineTo(
p2.x,
p2.y
);

ctx.stroke();
}


/*
HANDS (UNCHANGED)
*/

const HANDS=[

latestResults.leftHandLandmarks,
latestResults.rightHandLandmarks
];


const WRISTS=[
JOINTS[15],
JOINTS[16]
];


const HAND_CONN=[

[0,1],[1,2],[2,3],[3,4],
[0,5],[5,6],[6,7],[7,8],
[0,9],[9,10],[10,11],[11,12],
[0,13],[13,14],[14,15],[15,16],
[0,17],[17,18],[18,19],[19,20]
];


for(
let h=0;
h<HANDS.length;
h++
){

const hand=
HANDS[h];

if(
!hand
)
continue;


const wrist=
WRISTS[h];


const rawPts=
hand.map(
lm=>({

x:
(1-lm.x)
*canvas.width,

y:
lm.y*
canvas.height
})
);


const offsetX=
wrist.x-
rawPts[0].x;


const offsetY=
wrist.y-
rawPts[0].y;


const pts=
rawPts.map(
(
p,
i
)=>{

const aligned={

x:
p.x+offsetX,

y:
p.y+offsetY
};


const index=
100+h*21+i;


const prev=
previousPose[index];


let finalPoint=
aligned;


if(
prev
){

const dx=
aligned.x-prev.x;

const dy=
aligned.y-prev.y;

const dist=
Math.sqrt(
dx*dx+
dy*dy
);


if(
dist>70
){

finalPoint=aligned;

}else{

finalPoint=
smoothPoint(
aligned,
prev
);
}
}


previousPose[index]=
finalPoint;

return finalPoint;
});


for(
const [a,b]
of HAND_CONN
){

ctx.beginPath();

ctx.moveTo(
pts[a].x,
pts[a].y
);

ctx.lineTo(
pts[b].x,
pts[b].y
);

ctx.stroke();
}


for(
const p of pts
){

ctx.beginPath();

ctx.arc(
p.x,
p.y,
2.5,
0,
Math.PI*2
);

ctx.fill();
}
}
}