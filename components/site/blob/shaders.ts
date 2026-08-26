// Ashima / Stefan Gustavson 3D simplex noise (MIT).
export const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`

/** Low-frequency, slow-drift displacement along the normal. */
export const DISPLACE = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
vec3 displace(vec3 p) {
  float t = uTime;
  float n = snoise(p * uFreq + vec3(t * 0.09, t * 0.07, -t * 0.05));
  n += 0.35 * snoise(p * uFreq * 2.1 - vec3(0.0, t * 0.05, t * 0.08));
  return p + normalize(p) * n * uAmp;
}
`

/** Replaces <beginnormal_vertex>: displace, then rebuild the normal from a local tangent frame. */
export const NORMAL_VERTEX = /* glsl */ `
vec3 displacedPos = displace(position);
vec3 pn = normalize(position);
vec3 tng = normalize(cross(pn, abs(pn.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
vec3 btg = cross(pn, tng);
float eps = 0.015;
vec3 dp1 = displace(position + tng * eps);
vec3 dp2 = displace(position + btg * eps);
vec3 objectNormal = normalize(cross(dp1 - displacedPos, dp2 - displacedPos));
#ifdef USE_TANGENT
  vec3 objectTangent = vec3( tangent.xyz );
#endif
`

export const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

/** Bright pass: keep only HDR energy above the threshold (specular hotspots), soft knee. */
export const BRIGHT_FRAG = /* glsl */ `
uniform sampler2D tScene;
uniform float uThreshold;
uniform float uKnee;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(tScene, vUv).rgb;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float soft = clamp((l - uThreshold + uKnee) / (2.0 * uKnee), 0.0, 1.0);
  soft = soft * soft;
  float w = max(l - uThreshold, soft) / max(l, 1e-4);
  gl_FragColor = vec4(c * w, 1.0);
}
`

/** 9-tap separable gaussian. */
export const BLUR_FRAG = /* glsl */ `
uniform sampler2D tInput;
uniform vec2 uDir;
varying vec2 vUv;
void main() {
  const float w[5] = float[5](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
  vec3 c = texture2D(tInput, vUv).rgb * w[0];
  for (int i = 1; i < 5; i++) {
    vec2 o = uDir * float(i);
    c += texture2D(tInput, vUv + o).rgb * w[i];
    c += texture2D(tInput, vUv - o).rgb * w[i];
  }
  gl_FragColor = vec4(c, 1.0);
}
`

/** Scene + bloom, ACES filmic, linear -> sRGB. Alpha from scene coverage so the page shows through. */
export const COMPOSITE_FRAG = /* glsl */ `
uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform float uIntensity;
varying vec2 vUv;
vec3 aces(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}
vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
void main() {
  vec4 s = texture2D(tScene, vUv);
  vec3 b = texture2D(tBloom, vUv).rgb * uIntensity;
  vec3 hdr = s.rgb + b;
  vec3 ldr = toSRGB(aces(hdr));
  float a = max(s.a, clamp(dot(b, vec3(1.0)), 0.0, 1.0));
  gl_FragColor = vec4(ldr, a);
}
`
