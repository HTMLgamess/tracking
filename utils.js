export function smoothPoint(
newPt,
oldPt
){

if(
!oldPt
)
return newPt;

return{

x:
oldPt.x*0.62+
newPt.x*0.38,

y:
oldPt.y*0.62+
newPt.y*0.38
};
}
