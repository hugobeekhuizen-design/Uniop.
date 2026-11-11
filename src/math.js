// NOVA math library: column-major matrices, right-handed coordinates.
export const Vec3 = {
  add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],
  sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
  scale:(v,s)=>[v[0]*s,v[1]*s,v[2]*s],
  dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  normalize:v=>{const n=Math.hypot(...v)||1;return [v[0]/n,v[1]/n,v[2]/n];}
};

export const Mat4 = {
  identity:()=>new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]),
  multiply:(a,b)=>{
    const out=new Float32Array(16);
    for(let c=0;c<4;c++) for(let r=0;r<4;r++)
      out[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
    return out;
  },
  perspective:(fov,aspect,near,far)=>{
    const f=1/Math.tan(fov/2), nf=1/(near-far), out=new Float32Array(16);
    out[0]=f/aspect;out[5]=f;out[10]=(far+near)*nf;out[11]=-1;out[14]=2*far*near*nf;
    return out;
  },
  lookAt:(eye,target,up)=>{
    const z=Vec3.normalize(Vec3.sub(eye,target));
    const x=Vec3.normalize(Vec3.cross(up,z));
    const y=Vec3.cross(z,x);
    return new Float32Array([
      x[0],y[0],z[0],0, x[1],y[1],z[1],0,
      x[2],y[2],z[2],0,
      -Vec3.dot(x,eye),-Vec3.dot(y,eye),-Vec3.dot(z,eye),1
    ]);
  },
  model:(position,rotationDeg,scale)=>{
    const [rx,ry,rz]=rotationDeg.map(v=>v*Math.PI/180);
    const cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry),cz=Math.cos(rz),sz=Math.sin(rz);
    const rxm=new Float32Array([1,0,0,0, 0,cx,sx,0, 0,-sx,cx,0, 0,0,0,1]);
    const rym=new Float32Array([cy,0,-sy,0, 0,1,0,0, sy,0,cy,0, 0,0,0,1]);
    const rzm=new Float32Array([cz,sz,0,0, -sz,cz,0,0, 0,0,1,0, 0,0,0,1]);
    const sm=new Float32Array([scale[0],0,0,0, 0,scale[1],0,0, 0,0,scale[2],0, 0,0,0,1]);
    const tm=Mat4.identity();tm[12]=position[0];tm[13]=position[1];tm[14]=position[2];
    return Mat4.multiply(tm,Mat4.multiply(rzm,Mat4.multiply(rym,Mat4.multiply(rxm,sm))));
  }
};