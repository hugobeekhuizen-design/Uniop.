import { Renderer } from "./renderer.js";
import { Camera } from "./camera.js";

const configScreen=document.querySelector("#configScreen");
const appShell=document.querySelector("#appShell");
const canvas=document.querySelector("#viewport");
const fpsLabel=document.querySelector("#fps");
const frameLabel=document.querySelector("#frameTime");
const resolutionLabel=document.querySelector("#resolution");
const viewport=document.querySelector("#viewportWrap");
const camera=new Camera();
let renderer=null;
let runtimeSettings={quality:"balanced",showGrid:true,showHelp:true};

const objects=[
  {name:"Cube",position:[0,0.65,0],rotation:[0,25,0],scale:[1,1,1],color:[0.10,0.52,0.92]},
  {name:"Cube 2",position:[-2.25,0.5,-1.2],rotation:[12,-20,8],scale:[0.72,0.72,0.72],color:[0.10,0.78,0.72]},
  {name:"Cube 3",position:[2.0,0.4,-1.4],rotation:[-8,35,12],scale:[0.58,0.58,0.58],color:[0.56,0.39,0.92]}
];
const keys=new Set();
let lastTime=performance.now(),frames=0,fpsTimer=0,playing=false;
const $=id=>document.getElementById(id);

function readSavedSettings(){
  try{
    const saved=localStorage.getItem("nova-startup-settings");
    if(!saved)return;
    const s=JSON.parse(saved);
    if(s.quality)$("qualitySelect").value=s.quality;
    if(s.windowMode)$("windowSelect").value=s.windowMode;
    if(typeof s.showHelp==="boolean")$("showHelp").checked=s.showHelp;
    if(typeof s.showGrid==="boolean")$("showGrid").checked=s.showGrid;
    if(typeof s.remember==="boolean")$("rememberSettings").checked=s.remember;
    if(s.startupMode)document.querySelector(`input[name="startupMode"][value="${s.startupMode}"]`).checked=true;
  }catch(error){console.warn("Could not read NOVA settings:",error);}
}
readSavedSettings();

function updateInspector(){
  const cube=objects[0];
  [["posX",0,"position"],["posY",1,"position"],["posZ",2,"position"],
   ["rotX",0,"rotation"],["rotY",1,"rotation"],["rotZ",2,"rotation"],
   ["scaleX",0,"scale"],["scaleY",1,"scale"],["scaleZ",2,"scale"]].forEach(([id,index,key])=>{
    $(id).value=cube[key][index];
    $(id).addEventListener("change",e=>{cube[key][index]=Number(e.target.value)||0;});
  });
}

function launch(){
  const startupMode=document.querySelector('input[name="startupMode"]:checked').value;
  runtimeSettings={
    quality:$("qualitySelect").value,
    windowMode:$("windowSelect").value,
    showHelp:$("showHelp").checked,
    showGrid:$("showGrid").checked,
    startupMode
  };
  if($("rememberSettings").checked){
    localStorage.setItem("nova-startup-settings",JSON.stringify({...runtimeSettings,remember:true}));
  }else{
    localStorage.removeItem("nova-startup-settings");
  }
  if(startupMode==="safe"){
    runtimeSettings.quality="low";
    runtimeSettings.showGrid=false;
  }
  configScreen.hidden=true;
  appShell.hidden=false;
  $("helpOverlay").style.display=runtimeSettings.showHelp?"flex":"none";
  if(runtimeSettings.windowMode==="fullscreen" && document.documentElement.requestFullscreen){
    document.documentElement.requestFullscreen().catch(()=>{});
  }
  try{
    renderer=new Renderer(canvas);
    renderer.quality=runtimeSettings.quality;
    renderer.showGrid=runtimeSettings.showGrid;
  }catch(error){
    viewport.innerHTML=`<div style="padding:30px;color:#ff9b9b;font:13px Segoe UI">NOVA could not start its renderer.<br><br>${error.message}<br><br>Update your graphics drivers and use a GPU that supports WebGL 2.</div>`;
    return;
  }
  updateInspector();
  requestAnimationFrame(loop);
}

$("launchEditor").addEventListener("click",launch);
$("quitApp").addEventListener("click",()=>window.close());

function loop(now){
  const dt=Math.min((now-lastTime)/1000,0.05);lastTime=now;
  camera.move(keys,dt);
  renderer.render(camera,objects);
  frames++;fpsTimer+=dt;
  if(fpsTimer>=0.5){
    fpsLabel.textContent=`FPS ${Math.round(frames/fpsTimer)}`;
    frameLabel.textContent=`${(1000*fpsTimer/frames).toFixed(1)} ms`;
    resolutionLabel.textContent=`${canvas.width} × ${canvas.height}`;
    frames=0;fpsTimer=0;
  }
  requestAnimationFrame(loop);
}

$("resetCamera").addEventListener("click",()=>camera.reset());
$("wireframe").addEventListener("click",()=>{
  renderer.wireframe=!renderer.wireframe;
  $("renderMode").textContent=renderer.wireframe?"WIREFRAME":"SOLID";
  $("wireframe").classList.toggle("active",renderer.wireframe);
});
$("playButton").addEventListener("click",()=>{
  playing=!playing;
  $("playButton").classList.toggle("running",playing);
  $("playButton").innerHTML=playing?"■ <span>STOP</span>":"▶ <span>PLAY</span>";
  $("helpOverlay").style.display=playing||!runtimeSettings.showHelp?"none":"flex";
});
document.querySelectorAll(".tree-item").forEach(item=>item.addEventListener("click",()=>{
  document.querySelectorAll(".tree-item").forEach(el=>el.classList.remove("selected"));item.classList.add("selected");
}));

window.addEventListener("keydown",e=>{
  if(["w","a","s","d","q","e","Shift"].includes(e.key)) {keys.add(e.key==="Shift"?"Shift":e.key.toLowerCase());e.preventDefault();}
});
window.addEventListener("keyup",e=>keys.delete(e.key==="Shift"?"Shift":e.key.toLowerCase()));
window.addEventListener("blur",()=>keys.clear());

let rightMouse=false,lastMouseX=0,lastMouseY=0;
canvas.addEventListener("contextmenu",e=>e.preventDefault());
canvas.addEventListener("mousedown",e=>{
  if(e.button===2){rightMouse=true;lastMouseX=e.clientX;lastMouseY=e.clientY;canvas.style.cursor="grabbing";}
});
window.addEventListener("mouseup",e=>{if(e.button===2){rightMouse=false;canvas.style.cursor="crosshair";}});
window.addEventListener("mousemove",e=>{
  if(!rightMouse)return;
  camera.look(e.clientX-lastMouseX,e.clientY-lastMouseY);lastMouseX=e.clientX;lastMouseY=e.clientY;
});