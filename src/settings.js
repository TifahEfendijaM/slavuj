// Values you can tweak. Save the file and the game reloads with the new values.
export default {
  flight: {
    cruiseSpeed: 14,      // normal flying speed
    minSpeed: 6,          // slowest the bird can fly
    maxSpeed: 34,         // top speed in a dive
    gravity: 16,          // how strongly climbing costs speed and diving gains it
    drag: 0.3,            // how fast extra speed above cruise fades
    glideRecover: 2.5,    // speed regained per second in ordinary flight
    flapClimb: 7,         // height gained per second while flapping hard (Space)
    flapAccel: 6,         // speed gained per second while flapping hard
    cruiseSink: 0.15,     // height lost per second in ordinary flight (without Space)
    mouseSens: 0.0022,    // mouse steering sensitivity (when the browser can capture the mouse)
    pointerTurnRate: 2.0, // turning speed when steering by cursor position instead
    keyTurnRate: 1.8,     // turning speed with A/D or arrow keys
    keyPitchRate: 1.2,    // tilting speed with W/S or arrow keys
    turnSmooth: 6,        // how quickly the bird follows the steering
    pitchSmooth: 4,
    maxPitchUp: 45,       // degrees
    maxPitchDown: 35,     // degrees (without diving)
    diveAngle: 60,        // degrees; 90 would be straight down
    takeoffSpeed: 10,
    takeoffPitch: 20,     // degrees
    bodyRadius: 0.55,     // how close the body may come to a wall
    wingReach: 1.3,       // how far to the side the bird feels for walls
    maxLandSlope: 0.62,   // surfaces steeper than this (normal.y below it) cannot be landed on
  },
  camera: { fov: 60, distance: 5.5, smooth: 6, diveFovBoost: 12 },
  bird: { scale: 1.5, blue: '#2466e8', blueDark: '#1a4fc0', yellow: '#ffc61a' },
  orb: { hoverHeight: 3 },
  cutscene: {
    closeDuration: 7,     // seconds, when one object is coloured
    wideDuration: 8.5,    // seconds, when colour spreads over many objects
    paintDelay: 1.3,      // seconds before the paint starts (the orb dissolves first)
    fov: 42,
  },
  world: { boundsRadius: 105, ceiling: 82 },
  ink: { lineWidth: 1.7, color: '#3b352f' },
  audio: { volume: 0.55, music: 0.5, pronunciationRate: 0.85 },
  colors: { paper: '#f5efdf', river: '#2f9a80', riverDeep: '#1f7f86', skin: '#e0a37a', trunks: '#c0392b', hair: '#3a2a20' },
};
