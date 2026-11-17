// Values you can tweak. Save the file and the game reloads with the new values.
export default {
  flight: {
    cruiseSpeed: 14,      // normal flying speed
    minSpeed: 6,          // slowest the bird can fly
    maxSpeed: 34,         // top speed in a dive
    gravity: 16,          // how strongly climbing costs speed and diving gains it
    glideGravity: 6,      // how strongly speed builds when just gliding downhill (no flapping, no diving)
    diveGravity: 14.75,   // how strongly speed builds in a dive (set so a 70 degree dive speeds up exactly as the old 60 degree one did)
    drag: 0.3,            // how fast extra speed above cruise fades
    glideRecover: 2.5,    // speed regained per second in ordinary flight
    flapClimb: 7,         // height gained per second while flapping hard (Space)
    flapAccel: 6,         // speed gained per second while flapping hard
    cruiseSink: 0.15,     // height lost per second in ordinary flight (without Space)
    mouseSens: 0.0022,    // mouse steering sensitivity (when the browser can capture the mouse)
    edgeTurnRate: 1.4,    // without mouse capture: turning speed while the cursor rests at the screen edge
    swimMax: 3,           // top paddling speed on the water (hold the mouse button; it builds up)
    swimAccel: 1.1,       // how fast paddling speeds up, per second
    walkStart: 0.35,      // walking speed when the mouse button is first held
    walkAccel: 0.75,      // how fast walking speeds up into a run, per second
    runSpeed: 2,          // top running speed on the ground
    hopUp: 1.4,           // highest step it hops up onto while walking (the garden walls are up to 1.3 m)
    hopDown: 1.3,         // deepest drop it hops down; anything deeper and it dives off
    keyTurnRate: 1.8,     // turning speed with A/D or arrow keys
    keyPitchRate: 1.2,    // tilting speed with W/S or arrow keys
    turnSmooth: 6,        // how quickly the bird follows the steering
    pitchSmooth: 4,
    maxPitchUp: 45,       // degrees
    maxPitchDown: 35,     // degrees (without diving)
    diveAngle: 70,        // degrees; 90 would be straight down
    takeoffSpeed: 9,
    takeoffPitch: 12,      // degrees
    takeoffLift: 6,       // height gained per second right at take-off; it builds up to flapClimb while Space is held
    bodyRadius: 0.3,     // how close the body may come to a wall
    wingReach: 0.62,       // how far to the side the bird feels for walls
    maxLandSlope: 0.5,   // surfaces steeper than this (normal.y below it) cannot be landed on
  },
  camera: { fov: 60, distance: 2.7, flightDistance: 2.2,   // how far behind the bird the camera sits: when perched or swimming, and in flight
    smooth: 6, diveFovBoost: 12 },
  bird: { scale: 0.5, blue: '#2466e8', blueDark: '#1a4fc0', yellow: '#ffc61a' },
  orb: { hoverHeight: 2, size: 0.5 },   // how high an orb floats above its object, and how big it is
  cutscene: {
    closeDuration: 8.6,    // seconds, when one object is coloured
    wideDuration: 9.5,    // seconds, when colour spreads over many objects (close look first, then wide)
    paintDelay: 1.3,      // seconds before the paint starts (the orb dissolves first)
    fov: 42,
  },
  world: { boundsRadius: 105, ceiling: 82 },
  ink: { lineWidth: 1.7, color: '#3b352f' },
  audio: { volume: 0.55, music: 0.5, pronunciationRate: 0.85, flap: 0.55, finaleFlap: 0.15, wind: 0.6 },
  colors: { paper: '#f5efdf', river: '#2f9a80', riverDeep: '#1f7f86', skin: '#e0a37a', trunks: '#c0392b', hair: '#3a2a20' },
};
