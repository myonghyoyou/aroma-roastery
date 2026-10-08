import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type { Media } from '@/lib/content';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders';

/*
 * The grain field: one fixed WebGL canvas behind the whole home page. A slow mesh gradient in the
 * logo colours, with photos and videos surfacing through it as the reader scrolls. Ported from the
 * approved draft; the behaviour is the same, and mountGrainField returns a cleanup so the page can
 * be left and re-entered on client navigation without leaking listeners, triggers or GL state.
 *
 * Texture slots: 0 passage, 1 store, 2-5 archive entries. The DOM marks its zones with data-photo.
 */

export const SLOT_COUNT = 6;
const STILL_TIME = 37.0;

gsap.registerPlugin(ScrollTrigger);

type VideoSlot = {
  slot: number;
  el: HTMLVideoElement;
  tex: WebGLTexture | null;
  playing: boolean;
  ready: boolean;
  crop: number;
  focusX: number;
  focusY: number;
  trimBottom: number;
  trimRight: number;
  loopDip: number;
  /** framing canvas for focus/trim clips, sized to the screen aspect */
  fr: HTMLCanvasElement | null;
  cv: HTMLCanvasElement | null;
  small: HTMLCanvasElement | null;
  edge: HTMLCanvasElement | null;
  sync: (show: boolean) => void;
};

type FieldState = {
  page: number; floor: number; passage: number; footer: number; past: boolean; zone: number;
  w: Float32Array; wT: Float32Array; dark: number; darkT: number; shade: number; shadeT: number;
  mx: number; my: number; tx: number; ty: number; lens: number; lensTarget: number; lastMove: number;
};

type Field = {
  onPhoto: (() => void) | null;
  uploadVideos: (w: Float32Array) => void;
  resize: () => void;
  draw: (time: number, s: FieldState) => void;
  dispose: () => void;
};

export function mountGrainField(root: HTMLElement, canvas: HTMLCanvasElement, slots: Media[]): () => void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = SLOT_COUNT;
  const listen = new AbortController();
  const { signal } = listen;
  let rafId = 0;
  let resizeTimer = 0;
  let disposed = false;

  // muted + playsinline so phones allow it to play inline without a tap
  const videos: VideoSlot[] = slots.flatMap((m, slot) => {
    if (m.kind !== 'video') return [];
    const el = document.createElement('video');
    // the passage and store clips load at once; archive clips wait until the reader reaches the store
    Object.assign(el, { src: m.src, muted: true, loop: true, playsInline: true, preload: slot < 2 ? 'auto' : 'metadata' });
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');
    const v: VideoSlot = {
      slot, el, tex: null, playing: false, ready: false, crop: m.crop ?? 0,
      focusX: m.focusX ?? 0.5, focusY: m.focusY ?? 0.5, trimBottom: m.trimBottom ?? 0, trimRight: m.trimRight ?? 0, loopDip: m.loopDip ?? 0,
      fr: null, cv: null, small: null, edge: null,
      // plays only while its slot is showing; reduced motion keeps its first frame as a still
      sync: (show) => {
        if (reduce) return;
        if (show && !v.playing) { v.playing = true; el.play().catch(() => { v.playing = false; }); }
        else if (!show && v.playing) { v.playing = false; el.pause(); }
      },
    };
    return [v];
  });
  const videoAt = (i: number) => videos.find((v) => v.slot === i);

  /* ---------------- smooth scroll ---------------- */
  let lenis: Lenis | null = null;
  const lenisTick = (t: number) => lenis?.raf(t * 1000);
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.08 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(lenisTick);
    gsap.ticker.lagSmoothing(0);
  }
  root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href') ?? '';
      const el = id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el); else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }, { signal });
  });

  /* ---------------- shader ---------------- */
  let field: Field | null = null;
  try { field = createField(); } catch (err) { console.warn('[grain-field] shader disabled:', err); }
  if (!field) document.documentElement.classList.add('no-gl');

  function createField(): Field | null {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
    if (!gl || gl.isContextLost()) return null;
    if (gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) < N) return null;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
      return s;
    };
    const prog = gl.createProgram()!;
    const shaders = [compile(gl.VERTEX_SHADER, VERTEX_SHADER), compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)];
    shaders.forEach((s) => gl.attachShader(prog, s));
    gl.bindAttribLocation(prog, 0, 'aPosition');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link');
    // the linked program keeps what it needs; the shader objects can go
    shaders.forEach((s) => { gl.detachShader(prog, s); gl.deleteShader(s); });
    gl.useProgram(prog);
    const U: Record<string, WebGLUniformLocation | null> = {};
    ['uRes', 'uTime', 'uMouse', 'uLens', 'uPage', 'uFloor', 'uDark', 'uShade', 'uDip', 'uW', 'uSz'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });

    // one big triangle covers the screen
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // one texture unit per slot (1x1 roast pixel until each image or video arrives)
    const sizes = new Float32Array(N * 2).fill(1);
    const ready = new Float32Array(N);
    const api: Field = { onPhoto: null, uploadVideos: () => {}, resize: () => {}, draw: () => {}, dispose: () => {} };
    const images: HTMLImageElement[] = [];
    const textures: WebGLTexture[] = [];
    slots.forEach((m, i) => {
      const tex = gl.createTexture();
      textures.push(tex);
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([42, 19, 11, 255]));
      gl.uniform1i(gl.getUniformLocation(prog, 'uT' + i), i);
      const vid = videoAt(i);
      if (vid) { vid.tex = tex; return; }
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (disposed) return;
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        sizes[i * 2] = img.naturalWidth; sizes[i * 2 + 1] = img.naturalHeight;
        gl.uniform2fv(U.uSz, sizes);
        ready[i] = 1;
        api.onPhoto?.();
      };
      img.src = m.src;
      images.push(img);
    });
    gl.uniform2fv(U.uSz, sizes);

    // videos: same cover fit as the stills, re-uploaded each frame only while their slot is on screen
    function upload(v: VideoSlot) {
      let src: TexImageSource = v.el;
      if (v.cv && v.small && v.edge) {
        // a 9:16 shot pillarboxed inside a 16:9 frame (only 405 x 720 px of picture). Covering a desktop
        // with that strip alone meant about 3.5x upscaling, so the texture is rebuilt each frame as a
        // 16:9 frame: the sharp strip in the middle, its own blurred and dimmed copy filling the sides.
        const vw = v.el.videoWidth, vh = v.el.videoHeight, sw = Math.round(vh * v.crop), sx = (vw - sw) / 2;
        const g = v.cv.getContext('2d')!;
        // sides: the strip shrunk to a few pixels and stretched back up reads as a heavy blur
        v.small.getContext('2d')!.drawImage(v.el, sx, 0, sw, vh, 0, 0, v.small.width, v.small.height);
        const bh = vw / v.crop;
        g.drawImage(v.small, 0, (vh - bh) * 0.6, vw, bh);
        g.fillStyle = 'rgba(14, 10, 8, 0.32)';
        g.fillRect(0, 0, vw, vh);
        // sharp strip, faded in over its outer fifth so there is no visible seam against the blur
        const f = sw * 0.2;
        const eg = v.edge.getContext('2d')!;
        eg.drawImage(v.el, sx, 0, sw, vh, 0, 0, sw, vh);
        eg.globalCompositeOperation = 'destination-in';
        const gr = eg.createLinearGradient(0, 0, sw, 0);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(f / sw, '#000');
        gr.addColorStop(1 - f / sw, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        eg.fillStyle = gr; eg.fillRect(0, 0, sw, vh);
        eg.globalCompositeOperation = 'source-over';
        // wide screens: the strip at 1.6x (about 2x the source on a 900px screen), cropped top and
        // bottom around the subject; tall screens crop into the strip anyway and keep it at 1x
        const z = innerWidth > innerHeight ? 1.6 : 1;
        g.drawImage(v.edge, vw / 2 - sw * z / 2, (vh - vh * z) * 0.6, sw * z, vh * z);
        src = v.cv;
      } else if (v.fr) {
        // crop to the screen aspect around the subject (focusX, focusY), inside the frame minus its
        // trimmed bottom and right bands, so the shader's cover fit shows exactly that window
        const vw = v.el.videoWidth, vh = v.el.videoHeight;
        const uw = vw * (1 - v.trimRight), uh = vh * (1 - v.trimBottom);
        const A = innerWidth / innerHeight;
        let sw = uw, sh = uw / A;
        if (sh > uh) { sh = uh; sw = uh * A; }
        const clamp = (x: number, max: number) => Math.min(Math.max(x, 0), max);
        const sx = clamp(v.focusX * vw - sw / 2, uw - sw), sy = clamp(v.focusY * vh - sh / 2, uh - sh);
        const w = Math.round(sw), h = Math.round(sh);
        if (v.fr.width !== w || v.fr.height !== h) {
          v.fr.width = w; v.fr.height = h;
          sizes[v.slot * 2] = w; sizes[v.slot * 2 + 1] = h;
          gl!.uniform2fv(U.uSz, sizes);
        }
        v.fr.getContext('2d')!.drawImage(v.el, sx, sy, sw, sh, 0, 0, w, h);
        src = v.fr;
      }
      gl!.activeTexture(gl!.TEXTURE0 + v.slot);
      gl!.bindTexture(gl!.TEXTURE_2D, v.tex);
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, src);
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false);
    }
    videos.forEach((v) => {
      v.el.addEventListener('loadeddata', () => {
        if (disposed) return;
        if (v.crop) {
          v.cv = document.createElement('canvas');
          v.cv.width = v.el.videoWidth; v.cv.height = v.el.videoHeight;
          v.small = document.createElement('canvas');
          v.small.width = 9; v.small.height = 16;
          v.edge = document.createElement('canvas');
          v.edge.width = Math.round(v.el.videoHeight * v.crop); v.edge.height = v.el.videoHeight;
        }
        if (!v.crop && (v.trimBottom || v.trimRight || v.focusX !== 0.5 || v.focusY !== 0.5)) v.fr = document.createElement('canvas');
        sizes[v.slot * 2] = v.cv ? v.cv.width : v.el.videoWidth;
        sizes[v.slot * 2 + 1] = v.cv ? v.cv.height : v.el.videoHeight;
        gl.uniform2fv(U.uSz, sizes);
        upload(v);
        ready[v.slot] = 1; v.ready = true;
        api.onPhoto?.();
      }, { signal });
    });
    api.uploadVideos = (w) => { videos.forEach((v) => { if (v.ready && w[v.slot] > 0.002 && v.el.readyState >= 2) upload(v); }); };

    api.resize = () => {
      // grain reads best near native pixels; cap at 2 and trim a little for fill-rate
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * 0.8;
      const w = Math.max(1, Math.round(window.innerWidth * dpr));
      const h = Math.max(1, Math.round(window.innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.uRes, w, h);
    };
    const wbuf = new Float32Array(N);
    api.draw = (time, s) => {
      // a slot that has not loaded yet simply stays as colour
      for (let i = 0; i < N; i++) wbuf[i] = s.w[i] * ready[i];
      // loopDip clips go dark over the last and first half of the dip, so the jump back to the
      // first frame happens in the dark (fading the weight instead would flash the bright field)
      let wsum = 0, dip = 0;
      for (let i = 0; i < N; i++) wsum += wbuf[i];
      videos.forEach((v) => {
        const D = v.el.duration, t = v.el.currentTime, h = v.loopDip / 2;
        if (!h || !(D > 0) || wsum < 0.002) return;
        dip += (wbuf[v.slot] / wsum) * (1 - smooth01(0, h, t) * smooth01(0, h, D - t));
      });
      gl.uniform1f(U.uDip, Math.min(dip, 1));
      gl.uniform1f(U.uTime, time);
      gl.uniform2f(U.uMouse, s.mx, s.my);
      gl.uniform1f(U.uLens, s.lens);
      gl.uniform1f(U.uPage, s.page);
      gl.uniform1f(U.uFloor, s.floor);
      gl.uniform1f(U.uDark, s.dark);
      gl.uniform1f(U.uShade, s.shade);
      gl.uniform1fv(U.uW, wbuf);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    // free GPU objects but keep the context alive: Next keeps a left page's DOM around for instant
    // back navigation and re-runs the effect on the same canvas, so a lost context would stay lost
    api.dispose = () => {
      images.forEach((img) => { img.onload = null; img.src = ''; });
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(prog);
    };
    api.resize();
    return api;
  }

  /* ---------------- state ---------------- */
  const state: FieldState = {
    // scroll inputs
    page: 0, floor: 1, passage: 0, footer: 0, past: false, zone: -1,
    // smoothed outputs and their targets
    w: new Float32Array(N), wT: new Float32Array(N), dark: 0, darkT: 0, shade: 0, shadeT: 0,
    // pointer lens
    mx: 0.5, my: 0.5, tx: 0.5, ty: 0.5, lens: 0, lensTarget: 0, lastMove: 0,
  };
  const smooth01 = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const fallback = root.querySelector<HTMLElement>('.fallback');

  // which slot should be showing, and how dim the field should be, for the current scroll position
  const computeTargets = () => {
    state.wT.fill(0);
    if (state.zone >= 0) state.wT[state.zone] = 1;
    else if (!state.past) state.wT[0] = smooth01(0.25, 0.9, state.passage);
    state.darkT = 0.62 * smooth01(0, 0.6, state.passage) + 0.18 * state.footer;
    state.shadeT = state.zone >= 0 ? 1 : 0;
    if (reduce) {
      state.w.set(state.wT); state.dark = state.darkT; state.shade = state.shadeT;
      field?.draw(STILL_TIME, state);
    }
    if (!field && fallback) fallback.style.opacity = String(1 - 0.5 * state.dark);
    // reaching the store starts buffering the archive clips, so each is ready before its entry
    if (state.past) videos.forEach((v) => { if (v.el.preload !== 'auto') v.el.preload = 'auto'; });
    videos.forEach((v) => v.sync(state.wT[v.slot] > 0.001));
  };

  if (!reduce) {
    const move = (x: number, y: number) => {
      state.tx = x / window.innerWidth;
      state.ty = 1 - y / window.innerHeight;
      state.lensTarget = 1;
      state.lastMove = performance.now();
    };
    window.addEventListener('pointermove', (e) => move(e.clientX, e.clientY), { passive: true, signal });
    window.addEventListener('touchmove', (e) => { if (e.touches[0]) move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true, signal });
    document.addEventListener('mouseleave', () => { state.lensTarget = 0; }, { signal });
    window.addEventListener('touchend', () => { state.lensTarget = 0; }, { passive: true, signal });
  }

  /* ---------------- scroll choreography ---------------- */
  const heroEl = root.querySelector('.hero');
  const passageEl = root.querySelector('.passage');
  const storeEl = root.querySelector('.store');
  const footerEl = root.querySelector('.site-footer');
  const sentence = root.querySelector('.hero-sentence');
  const zones = Array.from(root.querySelectorAll<HTMLElement>('[data-photo]')).map((el) => ({ el, photo: Number(el.dataset.photo) }));

  const ctx = gsap.context(() => {
    // no tweens on these: they only feed the shader, Lenis plus the per-frame easing smooth them
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { state.page = self.progress; computeTargets(); } });
    ScrollTrigger.create({ trigger: heroEl, start: 'top top', end: 'bottom top', onUpdate: (self) => { state.floor = 1 - self.progress; computeTargets(); } });
    ScrollTrigger.create({ trigger: passageEl, start: 'top bottom', end: 'bottom bottom', onUpdate: (self) => { state.passage = self.progress; computeTargets(); } });
    // enter/leaveBack instead of isActive: at the very bottom (scroll == end) isActive turns false and the
    // passage photo came back behind the footer
    ScrollTrigger.create({ trigger: storeEl, start: 'top 55%', onEnter: () => { state.past = true; computeTargets(); }, onLeaveBack: () => { state.past = false; computeTargets(); } });
    ScrollTrigger.create({ trigger: footerEl, start: 'top bottom', end: 'bottom bottom', onUpdate: (self) => { state.footer = self.progress; computeTargets(); } });
    // each zone owns its slot while it crosses the middle band of the screen
    zones.forEach((z) => {
      ScrollTrigger.create({
        trigger: z.el, start: 'top 55%', end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) state.zone = z.photo;
          else if (state.zone === z.photo) state.zone = -1;
          computeTargets();
        },
      });
    });
    if (!reduce && sentence) {
      // the sentence stays where it is (fixed) and only fades as the video starts to surface
      gsap.fromTo(sentence, { autoAlpha: 1 }, {
        autoAlpha: 0, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: passageEl, start: 'top bottom', end: 'top 35%', scrub: 0.6 },
      });
    }
    if (!reduce) {
      // every other panel's copy is a sticky layer: it holds still for as long as its section scrolls
      // past and fades in at the start and out before the end, so no copy is ever seen moving
      // Fades run over a fixed 20% of the screen height, whatever the section length, and the fade out
      // ends 5% before the layer is released, so it is fully gone before it would start to scroll.
      root.querySelectorAll<HTMLElement>('[data-panel]').forEach((el) => {
        const scope = el.parentElement;
        if (!scope) return;
        gsap.fromTo(el, { autoAlpha: 0 }, {
          autoAlpha: 1, ease: 'none',
          scrollTrigger: { trigger: scope, start: 'top top', end: 'top -20%', scrub: true },
        });
        gsap.fromTo(el, { autoAlpha: 1 }, {
          autoAlpha: 0, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: scope, start: 'bottom 125%', end: 'bottom 105%', scrub: true },
        });
      });
    }
  }, root);
  computeTargets();
  document.fonts?.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });

  /* ---------------- render loop ---------------- */
  if (field) {
    const f = field;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => { f.resize(); if (reduce) f.draw(STILL_TIME, state); }, 120);
    }, { signal });
    if (reduce) {
      // one still frame, redrawn only when scroll state or a slot changes
      f.onPhoto = () => f.draw(STILL_TIME, state);
      f.draw(STILL_TIME, state);
    } else {
      const t0 = performance.now();
      let last = t0;
      const loop = (now: number) => {
        rafId = requestAnimationFrame(loop);
        // the field runs for the whole page; it only rests while the tab is hidden
        if (document.hidden) { last = now; return; }
        const dt = Math.min(0.1, (now - last) / 1000); last = now;
        const k = 1 - Math.pow(1 - 0.06, dt * 60);   // about one second to settle, frame-rate independent
        for (let i = 0; i < N; i++) state.w[i] += (state.wT[i] - state.w[i]) * k;
        state.dark += (state.darkT - state.dark) * k;
        state.shade += (state.shadeT - state.shade) * k;
        if (now - state.lastMove > 2600) state.lensTarget = Math.min(state.lensTarget, 0.35);
        state.mx += (state.tx - state.mx) * 0.08;
        state.my += (state.ty - state.my) * 0.08;
        // no lens over the videos: it fades out as a video slot surfaces
        let vw = 0; videos.forEach((v) => { vw = Math.max(vw, state.w[v.slot]); });
        state.lens += (state.lensTarget * (1 - vw) - state.lens) * 0.05;
        f.uploadVideos(state.w);
        f.draw((now - t0) / 1000 + 20.0, state);
      };
      rafId = requestAnimationFrame(loop);
    }
  }

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    window.clearTimeout(resizeTimer);
    listen.abort();
    ctx.revert();
    if (lenis) { gsap.ticker.remove(lenisTick); lenis.destroy(); }
    videos.forEach((v) => { v.el.pause(); v.el.removeAttribute('src'); v.el.load(); });
    field?.dispose();
    document.documentElement.classList.remove('no-gl');
  };
}
