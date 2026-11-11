export const vertexShader = `#version 300 es
precision highp float;
in vec3 aPosition;
in vec3 aNormal;
uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
out vec3 vNormal;
out vec3 vWorldPosition;
void main() {
  vec4 world = uModel * vec4(aPosition, 1.0);
  vWorldPosition = world.xyz;
  vNormal = mat3(transpose(inverse(uModel))) * aNormal;
  gl_Position = uProjection * uView * world;
}`;

export const fragmentShader = `#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vWorldPosition;
uniform vec3 uColor;
uniform vec3 uCameraPosition;
out vec4 outColor;
void main() {
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(vec3(-0.45, 0.85, 0.55));
  float diffuse = max(dot(normal, lightDir), 0.0);
  float ambient = 0.28;
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
  vec3 halfDir = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfDir), 0.0), 48.0) * 0.22;
  vec3 color = uColor * (ambient + diffuse * 0.78) + vec3(specular);
  outColor = vec4(color, 1.0);
}`;