// Values you can tweak. Save the file and the game reloads with the new values.
export default {
  flight: {
    cruiseSpeed: 14,      // normal flying speed
    minSpeed: 6,          // slowest the bird can fly
    maxSpeed: 34,         // top speed in a dive
    gravity: 16,          // how strongly climbing costs speed and diving gains it
    drag: 0.3,            // how fast extra speed above cruise fades
    glideRecover: 2,      // speed regained per second while gliding level
    flapClimb: 7,         // height gained per second while flapping
    flapAccel: 6,         // speed gained per second while flapping
    glideSink: 1.2,       // height lost per second while gliding
    mouseSens: 0.0022,    // mouse steering sensitivity
    keyTurnRate: 1.8,     // turning speed with A/D or arrow keys
    keyPitchRate: 1.2,    // tilting speed with W/S or arrow keys
    turnSmooth: 6,        // how quickly the bird follows the steering
    pitchSmooth: 4,
    maxPitchUp: 45,       // degrees
    maxPitchDown: 35,     // degrees (without diving)
    diveAngle: 60,        // degrees; 90 would be straight down
    takeoffSpeed: 10,
    takeoffPitch: 20,     // degrees
  },
  camera: {
    fov: 60,
    distance: 5.5,
    smooth: 6,
    diveFovBoost: 12,
  },
  bird: {
    scale: 1.5,
    blue: '#2466e8',
    blueDark: '#1a4fc0',
    yellow: '#ffc61a',
  },
  orb: {
    nearRadius: 8,        // how close a landing counts as "at" the object
    hoverHeight: 3,
  },
  cutscene: {
    duration: 8,          // seconds, whole cutscene (the song fits to this)
    paintDelay: 0.9,      // seconds before the paint starts spreading
    paintDuration: 6,     // seconds for the paint to soak in
    fov: 42,
  },
  world: {
    boundsRadius: 95,     // the bird is turned back beyond this distance
    ceiling: 80,
  },
  ink: {
    lineWidth: 1.7,       // sketch line thickness in pixels
    color: '#3b352f',
  },
  audio: { volume: 0.5 },
  colors: {
    paper: '#f5efdf',
    wall: '#ecd9b4',
    wallWarm: '#e8c79a',
    roof: '#cf5433',
    roofDark: '#a8452f',
    stone: '#d9cdb4',
    door: '#7c4a26',
    window: '#58849a',
    bank: '#b7ad8c',
    grass: '#8fb05a',
    river: '#2f9a80',
    riverDeep: '#1f7f86',
    bridge: '#e4d8bd',
    tree: '#4f8a4a',
    hill: '#9fb58a',
    cloud: '#ffffff',
    sky: '#f2b26b',
    sun: '#ffb52e',
    skin: '#e0a37a',
    trunks: '#c0392b',
  },
};
