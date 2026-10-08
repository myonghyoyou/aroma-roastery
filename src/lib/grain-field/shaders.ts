/* The grain field shaders, unchanged from the approved draft (drafts/index.html). */

export const VERTEX_SHADER = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }`;

export const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uLens;
  uniform float uPage;   // 0..1 over the whole page: palette roasts and drifts
  uniform float uFloor;  // 1 while the hero is on screen: darker lower half under the headline
  uniform float uDark;   // overall dimming of the colour field
  uniform float uShade;  // 1 when copy sits on a photo: photo dims, more on the left
  uniform float uW[6];   // photo weights (sum <= 1)
  uniform vec2 uSz[6];   // photo pixel sizes
  uniform sampler2D uT0;
  uniform sampler2D uT1;
  uniform sampler2D uT2;
  uniform sampler2D uT3;
  uniform sampler2D uT4;
  uniform sampler2D uT5;

  const vec3 G0 = vec3(0.027, 0.569, 0.231);
  const vec3 G1 = vec3(0.486, 0.765, 0.416);
  const vec3 Y0 = vec3(0.929, 0.745, 0.000);
  const vec3 Y1 = vec3(0.984, 0.890, 0.627);
  const vec3 R0 = vec3(0.757, 0.004, 0.063);
  const vec3 R1 = vec3(0.918, 0.275, 0.035);
  const vec3 O0 = vec3(0.855, 0.286, 0.078);
  const vec3 O1 = vec3(0.937, 0.439, 0.000);
  const vec3 ROAST = vec3(0.165, 0.075, 0.043);

  // Ashima / Stefan Gustavson 3D simplex noise
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
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
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

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  // softer falloff than before (2.4 -> 2.0) so neighbouring colours blend instead of forming lumps
  float wgt(vec2 w, vec2 a) {
    return 1.0 / (pow(length(w - a), 2.0) + 0.03);
  }

  // calm mesh gradient: four leaf anchors through a light two-step domain warp
  vec3 field(vec2 p, float t, float low, out float key) {
    vec2 q = vec2(snoise(vec3(p * 0.6, t)), snoise(vec3(p * 0.6 + vec2(5.2, 1.3), t)));
    vec2 w = p + 0.32 * q;
    vec2 r = vec2(snoise(vec3(w * 1.0 + vec2(1.7, 9.2), t * 1.2)), snoise(vec3(w * 1.0 + vec2(8.3, 2.8), t * 1.2)));
    w += 0.15 * r;
    key = r.x;

    vec2 aG = vec2(-0.58 + 0.18 * sin(t * 1.7), 0.28 + 0.12 * cos(t * 1.3));
    vec2 aY = vec2(0.56 + 0.16 * cos(t * 1.1), 0.36 + 0.12 * uFloor + 0.10 * sin(t * 1.9));
    vec2 aR = vec2(-0.32 + 0.16 * cos(t * 1.5), -0.40 + 0.10 * sin(t * 1.2));
    vec2 aO = vec2(0.42 + 0.14 * sin(t * 1.3), -0.30 + 0.12 * cos(t * 1.6));
    // the page "roasts" as it goes: green and yellow give way to red and orange
    float wG = wgt(w, aG) * mix(1.0, 0.45, uPage);
    float wY = wgt(w, aY) * mix(1.0, 0.3, uPage) * mix(1.0, 0.35, low * uFloor);
    float wR = wgt(w, aR) * mix(1.0, 1.4, uPage);
    float wO = wgt(w, aO);

    vec3 cG = mix(G0, G1, 0.5 + 0.4 * q.y);
    vec3 cY = mix(Y0, Y1, 0.35 + 0.3 * r.y);
    vec3 cR = mix(R0, R1, 0.5 + 0.4 * q.x);
    vec3 cO = mix(O0, O1, 0.5 + 0.4 * r.x);
    vec3 col = (cG * wG + cY * wY + cR * wR + cO * wO) / (wG + wY + wR + wO);

    // broad, gentle roasted valleys keep the field warm without bumps
    float shade = smoothstep(-0.9, 0.9, snoise(vec3(w * 0.7 + vec2(3.0, 7.0), t * 0.6)));
    col = mix(col * 0.72 + ROAST * 0.2, col, shade);
    return col;
  }

  vec2 coverUv(vec2 uv, float screenAspect, float imageAspect) {
    vec2 s = vec2(1.0);
    if (screenAspect > imageAspect) { s.y = imageAspect / screenAspect; }
    else { s.x = screenAspect / imageAspect; }
    return (uv - 0.5) * s + 0.5;
  }

  vec3 photo(sampler2D tex, vec2 sz, vec2 uv, float aspect, float zoom) {
    vec2 puv = coverUv(uv, aspect, sz.x / sz.y);
    puv = (puv - 0.5) * zoom + 0.5;
    return texture2D(tex, clamp(puv, 0.0, 1.0)).rgb;
  }

  void main () {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
    vec2 d = p - m;
    float dist = length(d);
    float lens = uLens * (1.0 - smoothstep(0.0, 0.34, dist));
    // screen-fixed lower region under the headline (does not move with scroll, so no sliding edge)
    float low = 1.0 - smoothstep(-0.5, 0.45, p.y);

    // lens: a gentle magnification toward the cursor
    vec2 pl = p - d * lens * 0.22;
    float t = uTime * 0.022;
    // palette drift with page progress: the field turns slowly and slides up
    float ang = uPage * 0.9;
    mat2 rot = mat2(cos(ang), sin(ang), -sin(ang), cos(ang));
    vec2 drift = vec2(0.0, uPage * 0.6);
    float key;
    vec3 col = field(rot * (pl * 0.95) + drift, t, low, key);

    if (lens > 0.002) {
      vec2 dir = d / (dist + 0.0001);
      float k2;
      vec3 cr = field(rot * ((pl + dir * 0.015 * lens) * 0.95) + drift, t, low, k2);
      vec3 cb = field(rot * ((pl - dir * 0.015 * lens) * 0.95) + drift, t, low, k2);
      col = vec3(cr.r, col.g, cb.b);
      col += lens * lens * 0.08 * vec3(1.0, 0.93, 0.82);
      col *= 1.0 + 0.06 * lens;
    }

    // soft vignette, then the hero floor
    float vig = 1.0 - smoothstep(0.25, 1.3, length(p * vec2(0.8, 1.0)));
    col *= mix(0.76, 1.0, vig);
    col *= mix(1.0, 0.5, low * uFloor);
    vec3 base = col;

    // overall dimming as the page moves away from the hero
    col = mix(col, col * 0.35 + ROAST * 0.12, uDark);

    // photos surface through the field
    float wsum = uW[0] + uW[1] + uW[2] + uW[3] + uW[4] + uW[5];
    if (wsum > 0.002) {
      float R = clamp(wsum, 0.0, 1.0);
      vec2 uvl = pl / vec2(aspect, 1.0) + 0.5;
      uvl += vec2(key, -key) * 0.012 * (1.0 - R);
      float zoom = mix(0.88, 1.0, R);
      vec3 ph = vec3(0.0);
      if (uW[0] > 0.001) ph += uW[0] * photo(uT0, uSz[0], uvl, aspect, zoom);
      if (uW[1] > 0.001) ph += uW[1] * photo(uT1, uSz[1], uvl, aspect, zoom);
      if (uW[2] > 0.001) ph += uW[2] * photo(uT2, uSz[2], uvl, aspect, zoom);
      if (uW[3] > 0.001) ph += uW[3] * photo(uT3, uSz[3], uvl, aspect, zoom);
      if (uW[4] > 0.001) ph += uW[4] * photo(uT4, uSz[4], uvl, aspect, zoom);
      if (uW[5] > 0.001) ph += uW[5] * photo(uT5, uSz[5], uvl, aspect, zoom);
      ph /= max(wsum, 0.0001);

      // copy runs on the left: dim the photo there, inside the shader
      float side = 1.0 - smoothstep(0.0, 0.75, uv.x);
      ph *= mix(0.92, 0.62 - 0.2 * side, uShade);

      float mask = clamp(R + key * 0.7 * R * (1.0 - R), 0.0, 1.0);
      mask = smoothstep(0.05, 0.95, mask);
      vec3 tinted = mix(ph * (0.35 + 1.5 * base), ph, smoothstep(0.4, 1.0, R));
      col = mix(col, tinted, mask);
      col += lens * lens * 0.03 * mask;
    }

    // film grain, re-rolled 24 times a second
    float frame = floor(uTime * 24.0);
    float n = hash12(gl_FragCoord.xy + vec2(frame * 37.0, frame * 91.0));
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col += (n - 0.5) * (0.06 + 0.05 * (1.0 - luma));

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }`;
