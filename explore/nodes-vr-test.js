import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const BLUE = 0x33a8e6;
const INK = "#222222";
const MUTED = "#777777";
const LIGHT_LINE = 0xd8d8d8;
const PANEL = 0xfcfcfc;

const ENTRIES = [
  {
    id: "alerts",
    label: "Alerts",
    meta: "Israel · Alerts",
    title: "The sound",
    text: "In Israel, we receive missile alerts on our phones. They come with a horrible system sound that, fortunately, many people have never had to hear.\n\nIt can go off at any time, day or night.",
    x: 26, y: 11,
    image: "rocket-alert-tel-aviv.webp"
  },
  {
    id: "tennis",
    label: "Tennis",
    meta: "Ball · Training",
    title: "Small corrections",
    text: "I love playing tennis. The important thing is to make sure the tennis balls aren’t too old. Ideally, you should probably play with new ones every time.\n\nThe racket matters too. And then there is the constant balance between power and control.",
    x: 52, y: 10,
    image: "Evgeny-Andreichyk-Tennis-Court-Sport.webp"
  },
  {
    id: "desert",
    label: "Desert",
    meta: "Negev · Mitzpe Ramon · Israel",
    title: "Colder than expected",
    text: "I knew deserts could get very cold at night. I just didn’t expect them to get that cold.\n\nEverything that manages to exist in a desert is an incredible example of adaptation.",
    x: 91, y: 27,
    image: "mitzpe ramon.webp"
  },
  {
    id: "sea-ocean",
    label: "Sea & Ocean",
    meta: "Water",
    title: "I could stay in the water.",
    text: "I’ve been swimming since I was a child. I like being in the water and simply being near it.\n\nI’m also fascinated by the way the underwater world works.",
    x: 67, y: 28,
    image: "Evgeny-Andreichyk-Swimming.webp"
  },
  {
    id: "vienna",
    label: "Vienna",
    meta: "Austria · Diplomatic Academy · United Nations",
    title: "Diplomatic Academy",
    text: "I studied at the Diplomatic Academy of Vienna. The Academy itself has a very particular atmosphere, and so does Vienna.\n\nI think the city is especially beautiful in winter.",
    x: 43, y: 29,
    image: "diplomatic-academy-evgeny-andreichyk-diploma.webp"
  },
  {
    id: "foreign-affairs",
    label: "Foreign Affairs",
    meta: "Diplomacy · Travel · People",
    title: "More in common than you might think",
    text: "A lot of my professional life has been connected to interesting projects, meetings and travel.\n\nDifferent peoples and cultures usually have far more interests in common than things that divide them.",
    x: 17, y: 31,
    image: "evgeny-andreichyk-official-visit-riga-latvia.webp"
  },
  {
    id: "night-run",
    label: "Night Run",
    meta: "Running · Tel Aviv · Night",
    title: "Thinking on the move",
    text: "This was the first time in my life I ran together with a large crowd.\n\nI like how moving around gives me space to think more calmly than I usually can in other situations.",
    x: 28, y: 48,
    image: "Evgeny-Andreichyk-Night-Run-Tel-Aviv.webp"
  },
  {
    id: "statute-of-liberty",
    label: "Statute of Liberty",
    meta: "Statute of Liberty · New York · Liberty Island",
    title: "Made it to the top",
    text: "I didn’t know you could actually go inside the crown of the Statue of Liberty until I did it.\n\n377 steps in total. 162 of them are on a very narrow spiral staircase.\n\nGoing up isn’t particularly difficult. Going back down seemed to be a different story for some people.",
    x: 50, y: 50,
    image: "evgeny-andreichyk-statue-of-liberty.webp"
  },
  {
    id: "coca-cola-zero",
    label: "Coca Cola",
    meta: "Coca-Cola · Taste · Zero",
    title: "A very ordinary favorite",
    text: "This is me at a place on Lexington Avenue in New York where Coca-Cola is served the traditional way.\n\nVery sweet.\n\nI really like Coca-Cola. Most of the time, I drink Zero.",
    x: 76, y: 47,
    image: "evgeny-andreichyk-diner-cola.png"
  },
  {
    id: "california",
    label: "California",
    meta: "California · Hills · Orange Trees",
    title: "Above the city",
    text: "I love places where orange trees grow.\n\nThere is something about being at the top of the hill where Griffith Observatory stands that makes the place feel particularly special to me.",
    x: 39, y: 66,
    image: "hollywood-sign.webp"
  },
  {
    id: "yom-kippur",
    label: "Yom Kippur",
    meta: "Israel · Yom Kippur · Tel Aviv",
    title: "Yom Kippur",
    text: "Is there anything quite like the atmosphere of a city on a day when there isn’t a single car on the road?\n\nI think that is a good opportunity.",
    x: 51, y: 66,
    image: "Evgeny-Andreichyk-Yom-Kippur.webp"
  },
  {
    id: "cats",
    label: "Cats",
    meta: "Yota · Burekas · Tel Aviv",
    title: "Strong personalities",
    text: "I have two cats: Yota and Burekas.",
    x: 72, y: 71,
    image: "Evgeny-Andreichyk-and-Yota.webp"
  },
  {
    id: "planes",
    label: "Planes",
    meta: "Planes · ILS · VFR",
    title: "Just planes",
    text: "I’ve loved airplanes since I was a child, and I’ve been flying on them for as long as I can remember.\n\nI became especially fascinated by them when, at nine years old, I flew on a double-decker Boeing 747 for the first time.",
    x: 24, y: 69,
    image: "Evgeny-Andreichyk-flying-boeing-plane.webp"
  }
];

const entryById = new Map(ENTRIES.map(entry => [entry.id, entry]));

const container = document.querySelector("#scene");
const status = document.querySelector("#vr-status");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfcfcfc);

const camera = new THREE.PerspectiveCamera(
  52,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);
camera.position.set(0, 1.55, 4.25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType("local-floor");
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.45, -1.75);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 2.4;
controls.maxDistance = 6.5;

const vrButton = VRButton.createButton(renderer);
vrButton.style.background = "#fff";
vrButton.style.color = "#222";
vrButton.style.border = "1px solid #bdbdbd";
vrButton.style.borderRadius = "3px";
vrButton.style.fontFamily = '"Avenir Next", Avenir, "Helvetica Neue", Helvetica, Arial, sans-serif';
vrButton.style.fontSize = "11px";
vrButton.style.fontWeight = "700";
vrButton.style.letterSpacing = ".08em";
vrButton.style.opacity = "1";
document.body.appendChild(vrButton);

renderer.xr.addEventListener("sessionstart", () => {
  document.body.classList.add("xr-active");
});

renderer.xr.addEventListener("sessionend", () => {
  document.body.classList.remove("xr-active");
});

if (!navigator.xr) {
  status.textContent = "WebXR is not available in this browser";
} else {
  navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
    status.textContent = supported
      ? "VR available · use Enter VR"
      : "Immersive VR is not available here · desktop preview only";
  });
}

/* ---------- Helpers ---------- */

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapLines(ctx, text, maxWidth) {
  const paragraphs = String(text).split(/\n\s*\n/);
  const output = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.trim().split(/\s+/);
    let line = "";

    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        output.push(line);
        line = word;
      } else {
        line = test;
      }
    });

    if (line) output.push(line);
    if (paragraphIndex < paragraphs.length - 1) output.push("");
  });

  return output;
}

function makeTextSprite(text, {
  fontSize = 58,
  fontWeight = 650,
  color = "#5f5f5f",
  background = "rgba(252,252,252,0.92)",
  paddingX = 28,
  paddingY = 16,
  scale = 0.0015
} = {}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  ctx.font = `${fontWeight} ${fontSize}px "Avenir Next", Arial, sans-serif`;
  const textWidth = Math.ceil(ctx.measureText(text).width);
  canvas.width = Math.max(64, textWidth + paddingX * 2);
  canvas.height = fontSize + paddingY * 2;

  ctx.font = `${fontWeight} ${fontSize}px "Avenir Next", Arial, sans-serif`;
  ctx.textBaseline = "middle";

  if (background) {
    ctx.fillStyle = background;
    roundRect(ctx, 0, 0, canvas.width, canvas.height, 10);
    ctx.fill();
  }

  ctx.fillStyle = color;
  ctx.fillText(text, paddingX, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);
  sprite.userData.canvasTexture = texture;
  return sprite;
}

function makePanel(width, height, color = PANEL, border = 0xe2e2e2) {
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide
  });

  const panel = new THREE.Mesh(geometry, material);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: border })
  );
  edges.position.z = 0.002;
  panel.add(edges);

  return panel;
}

function nearestEdges(entries) {
  const seen = new Set();
  const edges = [];

  function add(a, b) {
    const key = [a, b].sort().join("::");
    if (seen.has(key)) return;
    seen.add(key);
    edges.push([a, b]);
  }

  entries.forEach((entry) => {
    entries
      .filter(candidate => candidate.id !== entry.id)
      .map(candidate => ({
        id: candidate.id,
        distance: Math.hypot(candidate.x - entry.x, candidate.y - entry.y)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2)
      .forEach(({ id }) => add(entry.id, id));
  });

  return edges;
}

/* ---------- Spatial layout ---------- */

const experience = new THREE.Group();
experience.position.set(0, 0, 0);
scene.add(experience);

const mapGroup = new THREE.Group();
mapGroup.position.set(-1.12, 1.52, -2.45);
mapGroup.rotation.y = THREE.MathUtils.degToRad(7);
experience.add(mapGroup);

const MAP_WIDTH = 2.25;
const MAP_HEIGHT = 1.42;

const mapPanel = makePanel(MAP_WIDTH + 0.16, MAP_HEIGHT + 0.16);
mapPanel.position.z = -0.025;
mapGroup.add(mapPanel);

const mapInnerBorder = makePanel(MAP_WIDTH - 0.02, MAP_HEIGHT - 0.02, 0xfcfcfc, 0xf0f0f0);
mapInnerBorder.position.z = -0.018;
mapGroup.add(mapInnerBorder);

const cardGroup = new THREE.Group();
cardGroup.position.set(1.15, 1.52, -2.35);
cardGroup.rotation.y = THREE.MathUtils.degToRad(-8);
experience.add(cardGroup);

const CARD_W = 0.95;
const CARD_H = 1.28;
const cardPanel = makePanel(CARD_W, CARD_H);
cardPanel.position.z = -0.012;
cardGroup.add(cardPanel);

const nodeGroups = new Map();
const interactionTargets = [];
const connectionObjects = [];

function nodePosition(entry) {
  const usableW = MAP_WIDTH * 0.88;
  const usableH = MAP_HEIGHT * 0.83;

  return new THREE.Vector3(
    (entry.x / 100 - 0.5) * usableW,
    (0.5 - entry.y / 100) * usableH,
    0.018
  );
}

/* Connections */
nearestEdges(ENTRIES).forEach(([fromId, toId]) => {
  const from = nodePosition(entryById.get(fromId));
  const to = nodePosition(entryById.get(toId));

  const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
  const material = new THREE.LineBasicMaterial({
    color: LIGHT_LINE,
    transparent: true,
    opacity: 0.55
  });

  const line = new THREE.Line(geometry, material);
  line.userData.from = fromId;
  line.userData.to = toId;

  mapGroup.add(line);
  connectionObjects.push(line);
});

/* Nodes */
ENTRIES.forEach((entry, index) => {
  const group = new THREE.Group();
  group.position.copy(nodePosition(entry));
  group.userData.entryId = entry.id;

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.018, 32),
    new THREE.MeshBasicMaterial({
      color: 0xfcfcfc,
      side: THREE.DoubleSide
    })
  );
  dot.position.x = -0.05;
  dot.position.z = 0.008;

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.014, 0.019, 32),
    new THREE.MeshBasicMaterial({
      color: 0x626262,
      side: THREE.DoubleSide
    })
  );
  ring.position.x = -0.05;
  ring.position.z = 0.01;

  const label = makeTextSprite(entry.label, {
    fontSize: 54,
    fontWeight: 650,
    color: "#5f5f5f",
    paddingX: 22,
    paddingY: 13,
    scale: 0.00108
  });
  label.position.x = label.scale.x / 2 - 0.025;
  label.position.z = 0.012;

  const hit = new THREE.Mesh(
    new THREE.PlaneGeometry(Math.max(0.28, label.scale.x + 0.08), 0.095),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false
    })
  );
  hit.position.x = label.scale.x / 2 - 0.035;
  hit.position.z = 0.02;
  hit.userData.entryId = entry.id;

  group.add(dot, ring, label, hit);
  group.userData.dot = dot;
  group.userData.ring = ring;
  group.userData.label = label;
  group.userData.floatPhase = index * 0.71;

  mapGroup.add(group);
  nodeGroups.set(entry.id, group);
  interactionTargets.push(hit);
});

/* ---------- Card ---------- */

const cardCanvas = document.createElement("canvas");
cardCanvas.width = 1200;
cardCanvas.height = 1600;
const cardCtx = cardCanvas.getContext("2d");

const cardTexture = new THREE.CanvasTexture(cardCanvas);
cardTexture.colorSpace = THREE.SRGBColorSpace;
cardTexture.minFilter = THREE.LinearFilter;

const cardMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(CARD_W - 0.045, CARD_H - 0.045),
  new THREE.MeshBasicMaterial({
    map: cardTexture,
    transparent: false
  })
);
cardMesh.position.z = 0.002;
cardGroup.add(cardMesh);

const imageLoader = new THREE.ImageLoader();
imageLoader.setCrossOrigin("anonymous");

function drawCardBase() {
  cardCtx.clearRect(0, 0, cardCanvas.width, cardCanvas.height);
  cardCtx.fillStyle = "#fcfcfc";
  cardCtx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);
}

function drawCard(entry, image = null) {
  drawCardBase();

  const margin = 58;
  const contentW = cardCanvas.width - margin * 2;
  const imageH = 760;

  if (image) {
    const srcRatio = image.width / image.height;
    const dstRatio = contentW / imageH;

    let sx = 0, sy = 0, sw = image.width, sh = image.height;

    if (srcRatio > dstRatio) {
      sw = image.height * dstRatio;
      sx = (image.width - sw) / 2;
    } else {
      sh = image.width / dstRatio;
      sy = (image.height - sh) / 2;
    }

    cardCtx.drawImage(
      image,
      sx, sy, sw, sh,
      margin, margin, contentW, imageH
    );
  } else {
    cardCtx.fillStyle = "#f2f2f2";
    cardCtx.fillRect(margin, margin, contentW, imageH);

    cardCtx.fillStyle = "#a0a0a0";
    cardCtx.font = '600 26px "Avenir Next", Arial, sans-serif';
    cardCtx.fillText("IMAGE", margin + 34, margin + 55);
  }

  let y = margin + imageH + 62;

  cardCtx.fillStyle = "#33a8e6";
  cardCtx.font = '800 24px "Avenir Next", Arial, sans-serif';
  cardCtx.textBaseline = "top";
  cardCtx.fillText(entry.meta.toUpperCase(), margin, y);

  y += 58;

  cardCtx.fillStyle = INK;
  cardCtx.font = '650 64px "Avenir Next", Arial, sans-serif';

  const titleLines = wrapLines(cardCtx, entry.title, contentW);
  titleLines.forEach(line => {
    cardCtx.fillText(line, margin, y);
    y += 72;
  });

  y += 24;

  cardCtx.fillStyle = MUTED;
  cardCtx.font = '450 31px "Avenir Next", Arial, sans-serif';

  const bodyLines = wrapLines(cardCtx, entry.text, contentW);

  for (const line of bodyLines) {
    if (y > cardCanvas.height - 70) break;

    if (!line) {
      y += 28;
      continue;
    }

    cardCtx.fillText(line, margin, y);
    y += 47;
  }

  cardTexture.needsUpdate = true;
}

function updateCard(entry) {
  drawCard(entry);

  if (!entry.image) return;

  imageLoader.load(
    entry.image,
    (image) => drawCard(entry, image),
    undefined,
    () => drawCard(entry)
  );
}

/* ---------- Selection ---------- */

let activeId = "statute-of-liberty";
let hoveredId = null;

function setNodeVisual(id, mode) {
  const group = nodeGroups.get(id);
  if (!group) return;

  const isActive = mode === "active";
  const isHover = mode === "hover";

  const color = isActive || isHover ? BLUE : 0x626262;
  const dotColor = isActive ? BLUE : 0xfcfcfc;

  group.userData.ring.material.color.setHex(color);
  group.userData.dot.material.color.setHex(dotColor);

  const label = group.userData.label;
  const entry = entryById.get(id);
  const oldTexture = label.material.map;

  const replacement = makeTextSprite(entry.label, {
    fontSize: 54,
    fontWeight: 650,
    color: isActive || isHover ? "#33a8e6" : "#5f5f5f",
    paddingX: 22,
    paddingY: 13,
    scale: 0.00108
  });

  label.material.map = replacement.material.map;
  label.material.needsUpdate = true;

  if (oldTexture && oldTexture !== label.material.map) oldTexture.dispose();

  group.scale.setScalar(isActive ? 1.06 : isHover ? 1.035 : 1);
}

function refreshNodeVisuals() {
  ENTRIES.forEach(entry => {
    let mode = "normal";
    if (entry.id === activeId) mode = "active";
    else if (entry.id === hoveredId) mode = "hover";
    setNodeVisual(entry.id, mode);
  });

  connectionObjects.forEach(line => {
    const connected =
      line.userData.from === activeId ||
      line.userData.to === activeId;

    line.material.color.setHex(connected ? BLUE : LIGHT_LINE);
    line.material.opacity = connected ? 0.92 : 0.48;
  });
}

function setActive(id) {
  if (!entryById.has(id)) return;
  activeId = id;
  updateCard(entryById.get(id));
  refreshNodeVisuals();
}

setActive(activeId);

/* ---------- VR controller raycasting ---------- */

const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
const controllers = [];

function createController(index) {
  const controller = renderer.xr.getController(index);

  const rayGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
  ]);

  const ray = new THREE.Line(
    rayGeometry,
    new THREE.LineBasicMaterial({
      color: 0x777777,
      transparent: true,
      opacity: 0.65
    })
  );
  ray.scale.z = 4;
  controller.add(ray);
  controller.userData.ray = ray;

  controller.addEventListener("select", () => {
    const hit = intersectController(controller);
    if (hit?.object?.userData?.entryId) {
      setActive(hit.object.userData.entryId);
    }
  });

  scene.add(controller);
  controllers.push(controller);
}

createController(0);
createController(1);

function intersectController(controller) {
  tempMatrix.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

  const hits = raycaster.intersectObjects(interactionTargets, false);
  return hits[0] || null;
}

function updateControllerHover() {
  let nextHovered = null;

  for (const controller of controllers) {
    const hit = intersectController(controller);
    if (hit?.object?.userData?.entryId) {
      nextHovered = hit.object.userData.entryId;
      controller.userData.ray.material.color.setHex(BLUE);
      controller.userData.ray.scale.z = hit.distance;
      break;
    } else {
      controller.userData.ray.material.color.setHex(0x777777);
      controller.userData.ray.scale.z = 4;
    }
  }

  if (nextHovered !== hoveredId) {
    hoveredId = nextHovered;
    refreshNodeVisuals();
  }
}

/* ---------- Desktop click preview ---------- */

const desktopPointer = new THREE.Vector2();

renderer.domElement.addEventListener("pointerdown", (event) => {
  if (renderer.xr.isPresenting) return;

  const rect = renderer.domElement.getBoundingClientRect();
  desktopPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  desktopPointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(desktopPointer, camera);
  const hits = raycaster.intersectObjects(interactionTargets, false);

  if (hits[0]?.object?.userData?.entryId) {
    setActive(hits[0].object.userData.entryId);
  }
});

/* ---------- Render ---------- */

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();

  if (!renderer.xr.isPresenting) {
    controls.update();
  } else {
    updateControllerHover();
  }

  nodeGroups.forEach(group => {
    const float = Math.sin(t * 0.85 + group.userData.floatPhase) * 0.0025;
    group.position.z = 0.018 + float;
  });

  renderer.render(scene, camera);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
