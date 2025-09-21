export const wavyLinesShader = `
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform bool disableCenterDimming;
varying vec2 vTextureCoord;

#define PI 3.14159265359

float hash(float n) {
    return fract(sin(n) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i.x + i.y * 57.0);
    float b = hash(i.x + 1.0 + i.y * 57.0);
    float c = hash(i.x + i.y * 57.0 + 1.0);
    float d = hash(i.x + 1.0 + i.y * 57.0 + 1.0);
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for(int i = 0; i < 6; i++) {
        sum += amp * noise(p * freq);
        amp *= 0.5;
        freq *= 2.0;
    }
    return sum;
}

float lines(vec2 uv, float thickness, float distortion) {
    // Create wavy lines
    float y = uv.y;
    
    // Apply distortion based on fbm noise
    float distortionAmount = distortion * fbm(vec2(uv.x * 2.0, y * 0.5 + iTime * 0.1));
    y += distortionAmount;
    
    // Create lines with smooth step
    float linePattern = fract(y * 20.0);
    float line = smoothstep(0.5 - thickness, 0.5, linePattern) - 
                smoothstep(0.5, 0.5 + thickness, linePattern);
    
    return line;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Correct aspect ratio
    vec2 uv = fragCoord / iResolution.xy;
    float aspect = iResolution.x / iResolution.y;
    uv.x *= aspect;
    
    // Center the effect instead of using mouse interaction
    vec2 centerPos = vec2(0.5 * aspect, 0.5);
    float centerDist = length(uv - centerPos);
    float centerInfluence = smoothstep(0.5, 0.0, centerDist);
    
    // Base thickness and distortion
    float baseThickness = 0.05;
    float baseDistortion = 0.2;
    
    // Adjust thickness and distortion based on center proximity
    float thickness = mix(baseThickness, baseThickness * 1.5, centerInfluence);
    float distortion = mix(baseDistortion, baseDistortion * 2.0, centerInfluence);
    
    // Generate the wavy lines
    float line = lines(uv, thickness, distortion);
    
    // Add subtle movement over time
    float timeOffset = sin(iTime * 0.2) * 0.1;
    float animatedLine = lines(uv + vec2(timeOffset, 0.0), thickness, distortion);
    
    // Blend between static and animated lines
    line = mix(line, animatedLine, 0.3);
    
    // Default line colors - use consistent blue palette
    vec3 backgroundColor = vec3(0.0, 0.0, 0.0);
    vec3 lineColor = vec3(0.2, 0.4, 1.0);
    
    vec3 finalColor = mix(backgroundColor, lineColor, line);
    
    // Add subtle glow around center position
    finalColor += vec3(0.1, 0.2, 0.5) * centerInfluence * line;
    
    fragColor = vec4(finalColor, 1.0);
    
    // Calculate distance from center for dimming the center
    vec2 center = iResolution.xy * 0.5;
    float dist = distance(fragCoord, center);
    float radius = min(iResolution.x, iResolution.y) * 0.5;
    
    // Create a dimming factor for the center area (30% of the radius)
    float centerDim = disableCenterDimming ? 1.0 : smoothstep(radius * 0.3, radius * 0.5, dist);
    
    // Apply center dimming only if not disabled
    if (!disableCenterDimming) {
        fragColor.rgb = mix(fragColor.rgb * 0.3, fragColor.rgb, centerDim);
    }
}

void main() {
    vec2 fragCoord = vTextureCoord * iResolution;
    
    // Calculate distance from center for circular mask
    vec2 center = iResolution * 0.5;
    float dist = distance(fragCoord, center);
    float radius = min(iResolution.x, iResolution.y) * 0.5;
    
    // Only render inside circle
    if (dist < radius) {
        vec4 color;
        mainImage(color, fragCoord);
        gl_FragColor = color;
    } else {
        discard;
    }
}
`;