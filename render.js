import {smoothPoint} from "./utils.js";
import {latestResults} from "./tracker.js";

export let previousPose=[];

export function render(
ctx,
canvas,
video,
showCamera
){

ctx.fillStyle='#000';

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);


if(
showCamera
){

ctx.save();

ctx.globalAlpha=
.25;

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
latestResults
.poseLandmarks;

if(
!pose
)
return;


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
lm.y
*canvas.height
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


const neck={

x:
shoulders.x,

y:
shoulders.y-40
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


const FACE=
latestResults
.faceLandmarks;


if(
FACE
){

const facePts=
FACE.map(
lm=>({

x:
(1-lm.x)
*canvas.width,

y:
lm.y
*canvas.height
})
);

extra.chin=
facePts[152];


const OUTLINE=[
10,297,284,389,454,361,
397,379,400,152,176,
150,172,132,234,162,
54,67,10
];


const LEFT_EYE=
[33,133,159,145,33];


const RIGHT_EYE=
[362,263,386,374,362];


const NOSE=
[168,6,197,195,5,4];


const MOUTH=
[61,291,13,17];


for(
let i=0;
i<OUTLINE.length-1;
i++
){

ctx.beginPath();

ctx.moveTo(
facePts[
OUTLINE[i]
].x,

facePts[
OUTLINE[i]
].y
);

ctx.lineTo(
facePts[
OUTLINE[i+1]
].x,

facePts[
OUTLINE[i+1]
].y
);

ctx.stroke();
}


for(
let i=0;
i<NOSE.length-1;
i++
){

ctx.beginPath();

ctx.moveTo(
facePts[
NOSE[i]
].x,

facePts[
NOSE[i]
].y
);

ctx.lineTo(
facePts[
NOSE[i+1]
].x,

facePts[
NOSE[i+1]
].y
);

ctx.stroke();
}


for(
const i of
[
...LEFT_EYE,
...RIGHT_EYE,
...MOUTH
]
){

ctx.beginPath();

ctx.arc(
facePts[i].x,
facePts[i].y,
2.5,
0,
Math.PI*2
);

ctx.fill();
}
}


const BONES=[

['chin','neck'],

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


for(
const [a,b]
of BONES
){

const p1=
typeof a==="number"
? JOINTS[a]
: extra[a];

const p2=
typeof b==="number"
? JOINTS[b]
: extra[b];

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


const HANDS=[

latestResults
.leftHandLandmarks,

latestResults
.rightHandLandmarks
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
lm.y
*canvas.height
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
p=>({

x:
p.x+offsetX,

y:
p.y+offsetY
})
);


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