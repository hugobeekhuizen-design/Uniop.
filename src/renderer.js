import { Mat4 } from "./math.js";
import { vertexShader, fragmentShader } from "./shaders.js";
import { createCube, createGrid } from "./geometry.js";

function compile(gl,type,source){
  const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
    const message=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(message);
  }
  return shader;
}
function makeProgram(gl){
  const program=gl.createProgram();
  gl.attachShader(program,compile(gl,gl.VERTEX_SHADER,vertexShader));
  gl.attachShader(program,compile(gl,gl.FRAGMENT_SHADER,fragmentShader));
  gl.bindAttribLocation(program,0,"aPosition");gl.bindAttribLocation(program,1,"aNormal");
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  return program;
}
const gridVertex=`#version 300 es
precision highp float;layout(location=0) in vec3 aPosition;uniform mat4 uProjection;uniform mat4 uView;void main(){gl_Position=uProjection*uView*vec4(aPosition,1.0);}`;
const gridFragment=`#version 300 es
precision highp float;out vec4 outColor;void main(){outColor=vec4(0.20,0.31,0.43,0.52);}`;

export class Renderer {
  constructor(canvas){
    this.canvas=canvas;this.gl=canvas.getContext("webgl2",{antialias:true,alpha:false});
    if(!this.gl)throw new Error("WebGL 2 is not available on this system.");
    const gl=this.gl;
    this.program=makeProgram(gl);this.gridProgram=this.linkRaw(gridVertex,gridFragment);
    this.cube=createCube(gl);this.grid=createGrid(gl);
    this.wireframe=false;
    this.locations={
      projection:gl.getUniformLocation(this.program,"uProjection"),
      view:gl.getUniformLocation(this.program,"uView"),
      model:gl.getUniformLocation(this.program,"uModel"),
      color:gl.getUniformLocation(this.program,"uColor"),
      camera:gl.getUniformLocation(this.program,"uCameraPosition"),
      gridProjection:gl.getUniformLocation(this.gridProgram,"uProjection"),
      gridView:gl.getUniformLocation(this.gridProgram,"uView")
    };
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
  }
  linkRaw(vs,fs){
    const gl=this.gl,p=gl.createProgram();
    gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  resize(){
    const quality=this.quality||"balanced";
    const cap=quality==="high"?2:quality==="low"?1:1.5;
    const dpr=Math.min(window.devicePixelRatio||1,cap);
    const w=Math.floor(this.canvas.clientWidth*dpr),h=Math.floor(this.canvas.clientHeight*dpr);
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
    this.gl.viewport(0,0,w,h);
    return [w,h];
  }
  render(camera,objects){
    const gl=this.gl,[w,h]=this.resize();
    gl.clearColor(0.035,0.055,0.085,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const projection=Mat4.perspective(60*Math.PI/180,w/Math.max(h,1),0.1,500);
    const view=camera.getViewMatrix();
    if(this.showGrid!==false){
      gl.useProgram(this.gridProgram);
      gl.uniformMatrix4fv(this.locations.gridProjection,false,projection);
      gl.uniformMatrix4fv(this.locations.gridView,false,view);
      gl.bindVertexArray(this.grid.vao);gl.drawArrays(gl.LINES,0,this.grid.count);
    }
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.locations.projection,false,projection);
    gl.uniformMatrix4fv(this.locations.view,false,view);
    gl.uniform3fv(this.locations.camera,camera.position);
    gl.bindVertexArray(this.cube.vao);
    for(const object of objects){
      gl.uniformMatrix4fv(this.locations.model,false,Mat4.model(object.position,object.rotation,object.scale));
      gl.uniform3fv(this.locations.color,object.color);
      if(this.wireframe){gl.drawElements(gl.LINES,this.cube.lineCount,gl.UNSIGNED_SHORT,0);}
      else gl.drawElements(gl.TRIANGLES,this.cube.indexCount,gl.UNSIGNED_SHORT,0);
    }
    gl.bindVertexArray(null);
  }
}