import { Mat4, Vec3 } from "./math.js";
export class Camera {
  constructor(){
    this.position=[4,3.2,6];this.yaw=-Math.atan2(4,6);this.pitch=-0.25;this.speed=5.0;this.sensitivity=0.0025;
  }
  get forward(){
    return Vec3.normalize([Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),-Math.cos(this.yaw)*Math.cos(this.pitch)]);
  }
  get right(){return Vec3.normalize(Vec3.cross(this.forward,[0,1,0]));}
  getViewMatrix(){return Mat4.lookAt(this.position,Vec3.add(this.position,this.forward),[0,1,0]);}
  move(keys,dt){
    const fast=keys.has("Shift")?3:1,amount=this.speed*fast*dt;
    let move=[0,0,0];
    if(keys.has("w"))move=Vec3.add(move,this.forward);
    if(keys.has("s"))move=Vec3.sub(move,this.forward);
    if(keys.has("d"))move=Vec3.add(move,this.right);
    if(keys.has("a"))move=Vec3.sub(move,this.right);
    if(keys.has("e"))move=Vec3.add(move,[0,1,0]);
    if(keys.has("q"))move=Vec3.sub(move,[0,1,0]);
    if(Math.hypot(...move)>0)this.position=Vec3.add(this.position,Vec3.scale(Vec3.normalize(move),amount));
  }
  look(dx,dy){
    this.yaw-=dx*this.sensitivity;
    this.pitch=Math.max(-1.52,Math.min(1.52,this.pitch-dy*this.sensitivity));
  }
  reset(){this.position=[4,3.2,6];this.yaw=-Math.atan2(4,6);this.pitch=-0.25;}
}