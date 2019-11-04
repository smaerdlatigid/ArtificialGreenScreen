// casey conchinha - @kcconch ( https://github.com/kcconch )
// more p5.js + shader examples: https://itp-xstory.github.io/p5js-shaders/
// original adam ferriss example: https://github.com/aferriss/p5jsShaderExamples/tree/gh-pages/4_image-effects/4-16_video-feedback
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our textures coming from p5
uniform sampler2D tex0;
uniform sampler2D tex1;

uniform float mouseDown;
uniform float time;

float when_eq(float x, float y) {
  return 1.0 - abs(sign(x - y));
}

vec4 when_lt(vec4 x, vec4 y) {
  return max(sign(y - x), 0.0);
}

void main() {

  vec2 uv = vTexCoord;
  
  // the texture is loaded upside down and backwards by default so lets flip it
  uv.y = 1.0 - uv.y;
    
  vec4 cam = texture2D(tex0, uv);

  gl_FragColor = cam + when_lt(cam,vec4(0.1,0.1,0.1,1)) * when_eq(mouseDown,1.0) * vec4(uv.x, uv.y, uv.x, 0);
}