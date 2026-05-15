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
oldPt.x*0.55+
newPt.x*0.45,

y:
oldPt.y*0.55+
newPt.y*0.45
};
}