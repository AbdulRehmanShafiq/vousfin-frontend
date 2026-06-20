import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2 } from "ogl";

// The ONE cinematic centerpiece: a single full-screen fragment-shader quad that
// renders slow, flowing "liquid gold" light. Strictly budgeted:
//   • capped DPR (<= 1.5)              • paused when scrolled offscreen
//   • paused when the tab is hidden    • fully skipped under reduced-motion (parent gates)
//   • single WebGL context, disposed + context-lost on unmount
const vertex = `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;

  float hash(vec2 p){ p = fract(p * vec2(123.34, 345.45)); p += dot(p, p + 34.345); return fract(p.x * p.y); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.,0.)), c = hash(i + vec2(0.,1.)), d = hash(i + vec2(1.,1.));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
  }
  float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<3;i++){ v += a*noise(p); p = p*2.0 + 1.3; a *= 0.5; } return v; }

  void main(){
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vUv; p.x *= aspect;
    float t = uTime * 0.05;
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(3.1, 1.7) - t));
    float f = fbm(p + 2.5 * q);
    f += 0.10 * smoothstep(0.45, 0.0, distance(vUv, uPointer));

    vec3 c0 = vec3(0.051, 0.043, 0.035);
    vec3 c1 = vec3(0.541, 0.435, 0.259);
    vec3 c2 = vec3(0.784, 0.663, 0.431);
    vec3 c3 = vec3(0.961, 0.902, 0.784);
    vec3 col = mix(c0, c1, smoothstep(0.20, 0.55, f));
    col = mix(col, c2, smoothstep(0.50, 0.80, f));
    col = mix(col, c3, smoothstep(0.80, 0.96, f));

    float vig = smoothstep(1.15, 0.15, length((vUv - 0.5) * vec2(aspect, 1.0)));
    col *= vig;
    gl_FragColor = vec4(col, vig * 0.85);
  }
`;

export default function LiquidGoldCanvas({ className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let renderer, program, mesh, raf, io;
    let onResize, onPointer, onVis;
    let visible = true;
    let running = false;
    let disposed = false;

    try {
      renderer = new Renderer({ alpha: true, antialias: false, dpr: 1 });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      el.appendChild(gl.canvas);
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";
      gl.canvas.style.display = "block";

      const geometry = new Triangle(gl);
      program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new Vec2(1, 1) },
          uPointer: { value: new Vec2(0.5, 0.4) },
        },
      });
      mesh = new Mesh(gl, { geometry, program });

      onResize = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        // Render at low internal resolution (<=640px long edge) and CSS-stretch to
        // full — the soft gold field looks identical for a fraction of the GPU cost.
        const scale = Math.min(1, 640 / Math.max(w, h));
        renderer.setSize(Math.round(w * scale), Math.round(h * scale));
        gl.canvas.style.width = "100%";
        gl.canvas.style.height = "100%";
        program.uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height);
      };
      onResize();
      window.addEventListener("resize", onResize);

      onPointer = (e) => {
        const r = el.getBoundingClientRect();
        program.uniforms.uPointer.value.set(
          (e.clientX - r.left) / Math.max(r.width, 1),
          1 - (e.clientY - r.top) / Math.max(r.height, 1)
        );
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      let last = 0;
      const loop = (t) => {
        if (disposed) return;
        raf = requestAnimationFrame(loop);
        if (!visible) return;
        if (t - last < 33) return; // cap ~30fps — ambient field needs no more
        last = t;
        program.uniforms.uTime.value = t * 0.001;
        renderer.render({ scene: mesh });
      };
      const start = () => { if (!running && !disposed) { running = true; raf = requestAnimationFrame(loop); } };
      const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };

      // pause when offscreen
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }, { threshold: 0.01 });
      io.observe(el);

      // pause on hidden tab
      onVis = () => { if (document.hidden) stop(); else if (visible) start(); };
      document.addEventListener("visibilitychange", onVis);

      start();

      return () => {
        disposed = true;
        stop();
        io && io.disconnect();
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", onVis);
        const lose = gl.getExtension("WEBGL_lose_context");
        if (lose) lose.loseContext();
        if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      };
    } catch {
      // WebGL unavailable → parent's static gold fallback remains visible
      return () => {};
    }
  }, []);

  return <div ref={ref} className={className} aria-hidden="true" />;
}
