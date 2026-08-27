import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/*
  NODES VR TEST — V2

  Main changes from the first prototype:
  - no frame around the node map
  - much larger spatial node field
  - node labels are fixed planes, NOT camera-facing sprites
  - gentle panoramic layout, so the field rewards turning your head
  - larger story card
  - full galleries from the current site data
  - photo click opens a large spatial photo viewer
  - gallery arrows work both in the card and in the large photo viewer
*/

const BLUE = 0x33a8e6;
const INK = "#222222";
const MUTED = "#777777";
const LIGHT_LINE = 0xd8d8d8;
const SCENE_BG = 0xfcfcfc;

const MAIN_ENTRIES = [
  {
    "id": "statute-of-liberty",
    "label": "Statute of Liberty",
    "meta": "Statute of Liberty · New York · Liberty Island",
    "title": "Made it to the top",
    "text": "I didn’t know you could actually go inside the crown of the Statue of Liberty until I did it.\n\n377 steps in total. 162 of them are on a very narrow spiral staircase.\n\nGoing up isn’t particularly difficult. Going back down seemed to be a different story for some people.",
    "x": 50,
    "y": 50,
    "images": [
      {
        "src": "evgeny-andreichyk-inside-statue-of-liberty.webp",
        "alt": "Evgeny Andreichyk inside the crown of the Statue of Liberty, New York, United States.",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "statue-of-liberty-steps.webp",
        "alt": "Sign with information leading to crown of the Statue of Liberty inside",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "evgeny-andreichyk-statue-of-liberty.webp",
        "alt": "Evgeny Andreichyk on a boat near the Statue of Liberty, New York, United States.",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "alerts",
    "label": "Alerts",
    "meta": "Israel · Alerts",
    "title": "The sound",
    "text": "In Israel, we receive missile alerts on our phones. They come with a horrible system sound that, fortunately, many people have never had to hear.\n\nIt can go off at any time, day or night. You never know when it will happen, but you know exactly that you don’t have much time to reach a place that can protect you from a missile strike.\n\nA missile can destroy entire blocks.\n\nLiving with that feeling changes the way you look at a lot of things. I can guarantee that.",
    "x": 26,
    "y": 11,
    "images": [
      {
        "src": "rocket-alert-tel-aviv.webp",
        "alt": "Rocket and missile notification alert on apple watch in Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Evgeny-Andreichyk-With-A-Dog.webp",
        "alt": "Evgeny Andreichyk with a dog inside underground parking in Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Red-alert-tel-aviv.webp",
        "alt": "Screenshot of red alert notification on iPhone in Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "tennis",
    "label": "Tennis",
    "meta": "Ball · Training",
    "title": "Small corrections",
    "text": "I love playing tennis. The important thing is to make sure the tennis balls aren’t too old. Ideally, you should probably play with new ones every time.\n\nThe racket matters too. And then there is the constant balance between power and control.",
    "x": 52,
    "y": 10,
    "images": [
      {
        "src": "Evgeny-Andreichyk-Tennis-Court.webp",
        "alt": "Evgeny Andreichyk on a tennis court in Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Tennis-ball.webp",
        "alt": "Tennis ball on a tennis court in Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Evgeny-Andreichyk-Tennis-Court-Tel-Aviv.webp",
        "alt": "Selfie of Evgeny Andreichyk on a tennis court in Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Evgeny-Andreichyk-Tennis-Court-Sport.webp",
        "alt": "Evgeny Andreichyk playing tennis in Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "desert",
    "label": "Desert",
    "meta": "Negev · Mitzpe Ramon · Israel",
    "title": "Colder than expected",
    "text": "I knew deserts could get very cold at night. I just didn’t expect them to get that cold.\n\nI don’t think I’ve ever been as cold as I was in the desert at night. I knew what to expect and even dressed warmly. It still didn’t help.\n\nEverything that manages to exist in a desert is an incredible example of adaptation. Beautiful, too, and full of history.",
    "x": 91,
    "y": 27,
    "images": [
      {
        "src": "mitzpe ramon.webp",
        "alt": "Mitzpe Ramon in the Negev Desert, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "sea-ocean",
    "label": "Sea & Ocean",
    "meta": "Water",
    "title": "I could stay in the water.",
    "text": "I’ve been swimming since I was a child. I like being in the water and simply being near it.\n\nI’m also fascinated by the way the underwater world works. As a child, I seriously considered becoming a marine biologist. At the time, a friend and I would catch fish in a lake and then release them into the pond in my yard.",
    "x": 67,
    "y": 28,
    "images": [
      {
        "src": "Evgeny-Andreichyk-Swimming.webp",
        "alt": "Evgeny Andreichyk Swimming in the Red Sea, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Sea-Sunset-Tel-Aviv.webp",
        "alt": "Sea Sunset in Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Jellyfish-Tel-Aviv.webp",
        "alt": "Blue jellyfish in the Mediterranean Sea near Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Evgeny-Andreichyk-Sea.webp",
        "alt": "Evgeny Andreichyk in Italy, swimming in the Adriatic Sea",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Sea-Sunset-Eilat.webp",
        "alt": "Sea Sunset in Eilat, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "vienna",
    "label": "Vienna",
    "meta": "Austria · Diplomatic Academy · United Nations",
    "title": "Diplomatic Academy",
    "text": "I studied at the Diplomatic Academy of Vienna. The Academy itself has a very particular atmosphere, and so does Vienna.\n\nI think the city is especially beautiful in winter. And the parties in student residences there are usually more fun than the ones you see in films.",
    "x": 43,
    "y": 29,
    "images": [
      {
        "src": "diplomatic-academy-evgeny-andreichyk-diploma.webp",
        "alt": "Evgeny Andreichyk with his diploma from the Diplomatic Academy in Vienna",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "diplomatic-academy-dorm.webp",
        "alt": "Evgeny Andreichyk with students in the dormitory of the Diplomatic Academy in Vienna",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "diplomatic-academy-logo.webp",
        "alt": "Logo of the Diplomatic Academy in Vienna",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "united-nations.webp",
        "alt": "Inside the United Nations building in Vienna",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "foreign-affairs",
    "label": "Foreign Affairs",
    "meta": "Diplomacy · Travel · People",
    "title": "More in common than you might think",
    "text": "A lot of my professional life has been connected to interesting projects, meetings and travel. I’ve had the chance to help bring ideas to life at a very high level, and quite often I can’t say much about them.\n\nBut this kind of work has also made me notice something again and again: different peoples and cultures usually have far more interests in common than things that divide them, even when they themselves might think otherwise.",
    "x": 17,
    "y": 31,
    "images": [
      {
        "src": "evgeny-andreichyk-official-visit-riga-latvia.webp",
        "alt": "Evgeny Andreichyk during an official visit in Riga, Latvia. Meeting with the President of Latvia",
        "credit": "Ministry of Foreign Affairs of Latvia",
        "creditUrl": ""
      },
      {
        "src": "foreign-affairs-belweder-warsaw.webp",
        "alt": "Flags of Poland and European Union inside the Belweder Palace in Warsaw, Poland",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Riga-Stratcom.webp",
        "alt": "Riga Stratcom Dialogue 2023, Latvia",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "three.webp",
        "alt": "Evgeny Andreichyk with two colleagues during a presidential reception in Warsaw, Poland. Belweder Palace",
        "credit": "Unknown photographer / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "eurovision-debate.webp",
        "alt": "Preparation for Eurovision debate in the European Parliament in Brussels, Belgium",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "bages.webp",
        "alt": "Bages of Evgeny Andreichyk used for participation in official events and meetings",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "night-run",
    "label": "Night Run",
    "meta": "Running · Tel Aviv · Night",
    "title": "Thinking on the move",
    "text": "This was the first time in my life I ran together with a large crowd.\nIn general, I really like walking and running a little.\n\nI like how moving around gives me space to think more calmly than I usually can in other situations. It helps me process and make sense of everything going on in my life.",
    "x": 28,
    "y": 48,
    "images": [
      {
        "src": "Evgeny-Andreichyk-Night-Run-Tel-Aviv.webp",
        "alt": "Evgeny Andreichyk running at night in Tel Aviv",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "yom-kippur",
    "label": "Yom Kippur",
    "meta": "Israel · Yom Kippur · Tel Aviv",
    "title": "Yom Kippur",
    "text": "Is there anything quite like the atmosphere of a city on a day when there isn’t a single car on the road?\n\nBefore Yom Kippur, a person has ten days to influence the judgement that will be written into the Book of Life. You don’t know what has been written for you, but you are given a chance to change the judgement for the better.\n\nI think that is a good opportunity",
    "x": 51,
    "y": 66,
    "images": [
      {
        "src": "Evgeny-Andreichyk-Yom-Kippur.webp",
        "alt": "Evgeny Andreichyk during Yom Kippur in Tel Aviv",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "coca-cola-zero",
    "label": "Coca Cola",
    "meta": "Coca-Cola · Taste · Zero",
    "title": "A very ordinary favorite",
    "text": "This is me at a place on Lexington Avenue in New York where Coca-Cola is served the traditional way: syrup first, soda water separately, and ice cream on top.\n\nVery sweet.\n\nI really like Coca-Cola. Most of the time, I drink Zero",
    "x": 76,
    "y": 47,
    "images": [
      {
        "src": "evgeny-andreichyk-diner-cola.png",
        "alt": "Evgeny Andreichyk drinking Coca-Cola at a diner in New York, United States",
        "credit": "Evgeny Andreichyk",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "california",
    "label": "California",
    "meta": "California · Hills · Orange Trees",
    "title": "Above the city",
    "text": "I love places where orange trees grow.\n\nThere is a lot I could say about California. I usually didn’t get much sleep while I was there.\nBut there is something about being at the top of the hill where Griffith Observatory stands that makes the place feel particularly special to me.",
    "x": 39,
    "y": 66,
    "images": [
      {
        "src": "hollywood-sign.webp",
        "alt": "Hollywood sign in Los Angeles, California",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "evgeny-andeichyk-griffith-observatory-california.webp",
        "alt": "Evgeny Andreichyk at Griffith Observatory in Los Angeles, California",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "los-angeles-california.webp",
        "alt": "Hollywood Hills in Los Angeles, California",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "capitol-records-los-angeles.webp",
        "alt": "Capitol Records building in Los Angeles, California",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "los-angeles-plane-view.webp",
        "alt": "Los Angeles city view from a plane, California",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "orange-trees-los-angeles.webp",
        "alt": "Orange trees in Los Angeles, California",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "cats",
    "label": "Cats",
    "meta": "Yota · Burekas · Tel Aviv",
    "title": "Strong personalities",
    "text": "I have two cats: Yota and Burekas.",
    "x": 72,
    "y": 71,
    "images": [
      {
        "src": "Evgeny-Andreichyk-and-Yota.webp",
        "alt": "Evgeny Andreichyk with his cat Yota in Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Yota-and-Burekas.webp",
        "alt": "Yota and Burekas, two cats in Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Burekas.webp",
        "alt": "Burekas, a cat in Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "Yota-Sofa.webp",
        "alt": "Yota on a sofa in Tel Aviv, Israel",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "united-kingdom",
    "label": "United Kingdom",
    "meta": "United Kingdom · London · Experience",
    "title": "United Kingdom",
    "text": "The Owl and the Pussy-cat went to sea<br>\nIn a beautiful pea-green boat,<br>\nThey took some honey, and plenty of money,<br>\nWrapped up in a five-pound note.\n\nBy the way, I like the Cheshire Cheese pub on Northumberland Alley in London. And I first saw Big Ben long before I ever came to London — in my English classes at primary school.",
    "x": 34,
    "y": 96,
    "images": [
      {
        "src": "evgeny-andreichyk-in-london.png",
        "alt": "Evgeny Andreichyk in London, United Kingdom. In the background is the Big Ben clock tower.",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "bridge-in-london.png",
        "alt": "Bridge in London, United Kingdom",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "the-owl-the-cat.png",
        "alt": "A post card with the poem 'The Owl and the Pussy-cat' by Edward Lear",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      },
      {
        "src": "london-plane.png",
        "alt": "Flying over London, plane intertainment system screen with map and flight information",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  },
  {
    "id": "planes",
    "label": "Planes",
    "meta": "Planes · ILS · VFR",
    "title": "Just planes",
    "text": "I’ve loved airplanes since I was a child, and I’ve been flying on them for as long as I can remember.\n\nI became especially fascinated by them when, at nine years old, I flew on a double-decker Boeing 747 for the first time. I’ve had a particular soft spot for that aircraft ever since.",
    "x": 24,
    "y": 69,
    "images": [
      {
        "src": "Evgeny-Andreichyk-flying-boeing-plane.webp",
        "alt": "Evgey Andreichyk piloting a plane",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ]
  }
];

const CHILD_ENTRIES = [
  {
    "id": "coventry-university",
    "label": "Coventry University",
    "meta": "Coventry · International Relations ·United Kingdom",
    "title": "Three years ahead",
    "text": "Here I'm creating my university account after being admitted.\n\nI think this was in 2016. At that point, I still had three years of university and an enormous number of essays ahead of me.",
    "x": 53,
    "y": 97,
    "images": [
      {
        "src": "coventry-university-email-system.webp",
        "alt": "Coventry University email system",
        "credit": "Evgeny Andreichyk / Personal archive",
        "creditUrl": ""
      }
    ],
    "parentId": "united-kingdom"
  }
];

const ALL_ENTRIES = [...MAIN_ENTRIES, ...CHILD_ENTRIES];
const ENTRY_BY_ID = new Map(ALL_ENTRIES.map((entry) => [entry.id, entry]));
const CHILDREN_BY_PARENT = new Map();

CHILD_ENTRIES.forEach((entry) => {
  if (!CHILDREN_BY_PARENT.has(entry.parentId)) {
    CHILDREN_BY_PARENT.set(entry.parentId, []);
  }
  CHILDREN_BY_PARENT.get(entry.parentId).push(entry);
});

/* ---------------------------------------------------------
   Basic scene
--------------------------------------------------------- */

const container = document.querySelector("#scene");
const status = document.querySelector("#vr-status");

const scene = new THREE.Scene();
scene.background = new THREE.Color(SCENE_BG);

const camera = new THREE.PerspectiveCamera(
  52,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);

/*
  Desktop preview is deliberately pulled back.
  Quest ignores this position once an immersive session starts.
*/
camera.position.set(0.15, 1.65, 7.2);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType("local-floor");
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(-0.45, 1.45, -3.0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3.2;
controls.maxDistance = 11;

const vrButton = VRButton.createButton(renderer);
vrButton.style.background = "#fff";
vrButton.style.color = "#222";
vrButton.style.border = "1px solid #bdbdbd";
vrButton.style.borderRadius = "3px";
vrButton.style.fontFamily =
  '"Avenir Next", Avenir, "Helvetica Neue", Helvetica, Arial, sans-serif';
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
  closePhotoViewer();
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

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

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

function cleanText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/&nbsp;/gi, " ");
}

function wrapLines(ctx, text, maxWidth) {
  const paragraphs = cleanText(text).split(/\n\s*\n/);
  const output = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const explicitLines = paragraph.split("\n");

    explicitLines.forEach((explicitLine) => {
      const words = explicitLine.trim().split(/\s+/).filter(Boolean);

      if (!words.length) {
        output.push("");
        return;
      }

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
    });

    if (paragraphIndex < paragraphs.length - 1) {
      output.push("");
    }
  });

  return output;
}

function canvasTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/*
  Fixed text plane.
  Unlike THREE.Sprite, this does not rotate toward the headset.
*/
function makeTextPlane(
  text,
  {
    fontSize = 58,
    fontWeight = 650,
    color = "#5f5f5f",
    background = null,
    paddingX = 24,
    paddingY = 15,
    pixelsPerMeter = 1100,
    align = "left"
  } = {}
) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  ctx.font =
    `${fontWeight} ${fontSize}px "Avenir Next", Arial, sans-serif`;

  const width =
    Math.ceil(ctx.measureText(text).width) + paddingX * 2;
  const height = fontSize + paddingY * 2;

  canvas.width = Math.max(64, width);
  canvas.height = Math.max(48, height);

  ctx.font =
    `${fontWeight} ${fontSize}px "Avenir Next", Arial, sans-serif`;
  ctx.textBaseline = "middle";

  if (background) {
    ctx.fillStyle = background;
    roundRect(ctx, 0, 0, canvas.width, canvas.height, 8);
    ctx.fill();
  }

  ctx.fillStyle = color;
  ctx.textAlign = align;

  const tx =
    align === "center"
      ? canvas.width / 2
      : paddingX;

  ctx.fillText(text, tx, canvas.height / 2);

  const texture = canvasTexture(canvas);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const widthM = canvas.width / pixelsPerMeter;
  const heightM = canvas.height / pixelsPerMeter;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(widthM, heightM),
    material
  );

  mesh.userData.texture = texture;
  mesh.userData.widthM = widthM;
  mesh.userData.heightM = heightM;

  return mesh;
}

function replaceTextPlaneTexture(
  mesh,
  text,
  {
    fontSize = 58,
    fontWeight = 650,
    color = "#5f5f5f",
    background = null,
    paddingX = 24,
    paddingY = 15,
    pixelsPerMeter = 1100
  } = {}
) {
  const replacement = makeTextPlane(text, {
    fontSize,
    fontWeight,
    color,
    background,
    paddingX,
    paddingY,
    pixelsPerMeter
  });

  const oldTexture = mesh.material.map;
  const oldGeometry = mesh.geometry;

  mesh.material.map = replacement.material.map;
  mesh.material.needsUpdate = true;
  mesh.geometry = replacement.geometry;

  mesh.userData.widthM = replacement.userData.widthM;
  mesh.userData.heightM = replacement.userData.heightM;

  if (oldTexture) oldTexture.dispose();
  if (oldGeometry) oldGeometry.dispose();

  replacement.material.dispose();
}

function makeInvisibleHitPlane(width, height, userData = {}) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );

  Object.assign(mesh.userData, userData);
  return mesh;
}

function objectEffectivelyVisible(object) {
  let current = object;

  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }

  return true;
}

function drawCover(ctx, image, x, y, width, height) {
  const srcRatio = image.width / image.height;
  const dstRatio = width / height;

  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;

  if (srcRatio > dstRatio) {
    sw = image.height * dstRatio;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / dstRatio;
    sy = (image.height - sh) / 2;
  }

  ctx.drawImage(
    image,
    sx, sy, sw, sh,
    x, y, width, height
  );
}

function nearestEdges(entries) {
  const seen = new Set();
  const edges = [];

  function add(fromId, toId, kind = "proximity") {
    const key = [fromId, toId].sort().join("::");

    if (seen.has(key)) return;

    seen.add(key);
    edges.push({ fromId, toId, kind });
  }

  entries.forEach((entry) => {
    entries
      .filter((candidate) => candidate.id !== entry.id)
      .map((candidate) => ({
        id: candidate.id,
        distance: Math.hypot(
          candidate.x - entry.x,
          candidate.y - entry.y
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2)
      .forEach((neighbor) => {
        add(entry.id, neighbor.id);
      });
  });

  CHILD_ENTRIES.forEach((entry) => {
    add(entry.parentId, entry.id, "branch");
  });

  return edges;
}

/* ---------------------------------------------------------
   Spatial node field

   There is deliberately NO map panel/frame in V2.
--------------------------------------------------------- */

const experience = new THREE.Group();
scene.add(experience);

const mapGroup = new THREE.Group();

/*
  The field is left of the user and considerably larger than V1.
  It occupies roughly 5.6m × 2.8m.
*/
mapGroup.position.set(-1.72, 1.52, -3.45);
experience.add(mapGroup);

const MAP_WIDTH = 5.65;
const MAP_HEIGHT = 2.82;

function nodePosition(entry) {
  const nx = entry.x / 100 - 0.5;
  const ny = 0.5 - entry.y / 100;

  /*
    Gentle depth curve.
    It is spatial, but still clearly the same 2D node map.
  */
  const zCurve = Math.abs(nx) * 0.22;

  return new THREE.Vector3(
    nx * MAP_WIDTH,
    ny * MAP_HEIGHT,
    zCurve
  );
}

const mainVisualEdges = nearestEdges(MAIN_ENTRIES);

const nodeGroups = new Map();
const connectionObjects = [];
const interactionTargets = [];

let expandedParents = new Set();

function visibleEntryIds() {
  const ids = new Set(MAIN_ENTRIES.map((entry) => entry.id));

  CHILD_ENTRIES.forEach((entry) => {
    if (expandedParents.has(entry.parentId)) {
      ids.add(entry.id);
    }
  });

  return ids;
}

/* ---------------------------------------------------------
   Connections
--------------------------------------------------------- */

function createConnections() {
  mainVisualEdges.forEach((edge) => {
    const from = ENTRY_BY_ID.get(edge.fromId);
    const to = ENTRY_BY_ID.get(edge.toId);

    if (!from || !to) return;

    const geometry = new THREE.BufferGeometry().setFromPoints([
      nodePosition(from),
      nodePosition(to)
    ]);

    const material = new THREE.LineBasicMaterial({
      color: LIGHT_LINE,
      transparent: true,
      opacity: edge.kind === "branch" ? 0.62 : 0.38
    });

    const line = new THREE.Line(geometry, material);
    line.userData.from = edge.fromId;
    line.userData.to = edge.toId;
    line.userData.kind = edge.kind;

    if (edge.kind === "branch") {
      line.visible = false;
    }

    mapGroup.add(line);
    connectionObjects.push(line);
  });
}

createConnections();

/* ---------------------------------------------------------
   Nodes
--------------------------------------------------------- */

function createNode(entry, index) {
  const group = new THREE.Group();
  group.position.copy(nodePosition(entry));
  group.userData.entryId = entry.id;
  group.userData.floatPhase = index * 0.63;

  /*
    A tiny fixed yaw creates a panoramic field.
    It does NOT follow the headset.
  */
  const nx = entry.x / 100 - 0.5;
  group.rotation.y = THREE.MathUtils.degToRad(-nx * 22);

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.025, 40),
    new THREE.MeshBasicMaterial({
      color: SCENE_BG,
      side: THREE.DoubleSide
    })
  );
  dot.position.x = -0.055;
  dot.position.z = 0.012;

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.019, 0.026, 40),
    new THREE.MeshBasicMaterial({
      color: 0x626262,
      side: THREE.DoubleSide
    })
  );
  ring.position.x = -0.055;
  ring.position.z = 0.014;

  const label = makeTextPlane(entry.label, {
    fontSize: entry.parentId ? 50 : 62,
    fontWeight: entry.parentId ? 600 : 650,
    color: entry.parentId ? "#737373" : "#5f5f5f",
    background: "rgba(252,252,252,0.88)",
    paddingX: 25,
    paddingY: 16,
    pixelsPerMeter: 1020
  });

  label.position.x = label.userData.widthM / 2 + 0.003;
  label.position.z = 0.016;

  const hitWidth = Math.max(
    0.34,
    label.userData.widthM + 0.13
  );

  const hit = makeInvisibleHitPlane(
    hitWidth,
    Math.max(0.11, label.userData.heightM + 0.035),
    {
      action: "node",
      entryId: entry.id
    }
  );

  hit.position.x = label.userData.widthM / 2 - 0.015;
  hit.position.z = 0.03;

  group.add(dot, ring, label, hit);

  group.userData.dot = dot;
  group.userData.ring = ring;
  group.userData.label = label;
  group.userData.hit = hit;

  if (entry.parentId) {
    group.visible = false;
  }

  mapGroup.add(group);
  nodeGroups.set(entry.id, group);
  interactionTargets.push(hit);
}

ALL_ENTRIES.forEach(createNode);

/* ---------------------------------------------------------
   Large card on the right
--------------------------------------------------------- */

const cardGroup = new THREE.Group();

/*
  Bigger and farther right than V1.
  Turning the head now has a purpose: map left, story right.
*/
cardGroup.position.set(2.28, 1.58, -2.72);
cardGroup.lookAt(new THREE.Vector3(0, 1.55, 0));
experience.add(cardGroup);

const CARD_WIDTH = 1.62;

const photoCanvas = document.createElement("canvas");
photoCanvas.width = 1800;
photoCanvas.height = 1120;

const photoCtx = photoCanvas.getContext("2d");
const photoTexture = canvasTexture(photoCanvas);

const photoMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(CARD_WIDTH, 1.01),
  new THREE.MeshBasicMaterial({
    map: photoTexture,
    side: THREE.DoubleSide
  })
);

photoMesh.position.set(0, 0.58, 0);
cardGroup.add(photoMesh);

const photoHit = makeInvisibleHitPlane(
  CARD_WIDTH,
  1.01,
  { action: "open-photo" }
);
photoHit.position.set(0, 0.58, 0.025);
cardGroup.add(photoHit);
interactionTargets.push(photoHit);

/* Card text canvas */
const textCanvas = document.createElement("canvas");
textCanvas.width = 1800;
textCanvas.height = 1330;

const textCtx = textCanvas.getContext("2d");
const textTexture = canvasTexture(textCanvas);

const textMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(CARD_WIDTH, 1.20),
  new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
  })
);

textMesh.position.set(0, -0.68, 0);
cardGroup.add(textMesh);

/* Gallery controls under/around card photo */
const cardPrevLabel = makeTextPlane("←", {
  fontSize: 62,
  fontWeight: 500,
  color: "#777777",
  background: "rgba(252,252,252,0.94)",
  paddingX: 22,
  paddingY: 14,
  pixelsPerMeter: 1050,
  align: "center"
});

cardPrevLabel.position.set(-0.94, 0.58, 0.04);
cardGroup.add(cardPrevLabel);

const cardNextLabel = makeTextPlane("→", {
  fontSize: 62,
  fontWeight: 500,
  color: "#777777",
  background: "rgba(252,252,252,0.94)",
  paddingX: 22,
  paddingY: 14,
  pixelsPerMeter: 1050,
  align: "center"
});

cardNextLabel.position.set(0.94, 0.58, 0.04);
cardGroup.add(cardNextLabel);

const cardPrevHit = makeInvisibleHitPlane(
  0.17,
  0.17,
  { action: "gallery-prev" }
);
cardPrevHit.position.copy(cardPrevLabel.position);
cardGroup.add(cardPrevHit);
interactionTargets.push(cardPrevHit);

const cardNextHit = makeInvisibleHitPlane(
  0.17,
  0.17,
  { action: "gallery-next" }
);
cardNextHit.position.copy(cardNextLabel.position);
cardGroup.add(cardNextHit);
interactionTargets.push(cardNextHit);

const galleryDotsGroup = new THREE.Group();
galleryDotsGroup.position.set(0, 0.015, 0.04);
cardGroup.add(galleryDotsGroup);

let galleryDotMeshes = [];

function rebuildGalleryDots(entry) {
  galleryDotsGroup.clear();
  galleryDotMeshes = [];

  const count = entry.images?.length || 0;

  if (count <= 1) {
    galleryDotsGroup.visible = false;
    return;
  }

  galleryDotsGroup.visible = true;

  const gap = 0.055;
  const total = (count - 1) * gap;

  entry.images.forEach((image, index) => {
    const dot = new THREE.Mesh(
      new THREE.CircleGeometry(0.013, 28),
      new THREE.MeshBasicMaterial({
        color: index === activeImageIndex
          ? BLUE
          : 0xcfcfcf,
        side: THREE.DoubleSide
      })
    );

    dot.position.x = index * gap - total / 2;
    dot.userData.imageIndex = index;

    galleryDotsGroup.add(dot);
    galleryDotMeshes.push(dot);
  });
}

function refreshGalleryDots() {
  galleryDotMeshes.forEach((dot) => {
    dot.material.color.setHex(
      dot.userData.imageIndex === activeImageIndex
        ? BLUE
        : 0xcfcfcf
    );
  });
}

/* ---------------------------------------------------------
   Card drawing
--------------------------------------------------------- */

const imageLoader = new THREE.ImageLoader();
imageLoader.setCrossOrigin("anonymous");

let activeId = "statute-of-liberty";
let activeImageIndex = 0;
let hoveredId = null;
let cardLoadToken = 0;

function activeEntry() {
  return ENTRY_BY_ID.get(activeId);
}

function activeImage() {
  const entry = activeEntry();
  const images = entry?.images || [];

  if (!images.length) return null;

  return images[
    (activeImageIndex + images.length) % images.length
  ];
}

function drawPhotoPlaceholder() {
  photoCtx.clearRect(
    0,
    0,
    photoCanvas.width,
    photoCanvas.height
  );

  photoCtx.fillStyle = "#f1f1f1";
  photoCtx.fillRect(
    0,
    0,
    photoCanvas.width,
    photoCanvas.height
  );

  photoCtx.fillStyle = "#999";
  photoCtx.font =
    '700 30px "Avenir Next", Arial, sans-serif';
  photoCtx.fillText("IMAGE", 60, 70);

  photoTexture.needsUpdate = true;
}

function loadCardPhoto(entry) {
  const imageData = activeImage();

  if (!imageData) {
    drawPhotoPlaceholder();
    return;
  }

  const token = ++cardLoadToken;

  imageLoader.load(
    imageData.src,
    (image) => {
      if (token !== cardLoadToken) return;

      photoCtx.clearRect(
        0,
        0,
        photoCanvas.width,
        photoCanvas.height
      );

      photoCtx.fillStyle = "#f4f4f4";
      photoCtx.fillRect(
        0,
        0,
        photoCanvas.width,
        photoCanvas.height
      );

      drawCover(
        photoCtx,
        image,
        0,
        0,
        photoCanvas.width,
        photoCanvas.height
      );

      photoTexture.needsUpdate = true;
    },
    undefined,
    () => {
      if (token !== cardLoadToken) return;
      drawPhotoPlaceholder();
    }
  );
}

function drawCardText(entry) {
  textCtx.clearRect(
    0,
    0,
    textCanvas.width,
    textCanvas.height
  );

  /*
    Same white as the surrounding world.
    There is no new "card frame" concept.
  */
  textCtx.fillStyle = "rgba(252,252,252,0.97)";
  textCtx.fillRect(
    0,
    0,
    textCanvas.width,
    textCanvas.height
  );

  const margin = 54;
  const contentW = textCanvas.width - margin * 2;

  let y = 45;

  textCtx.textBaseline = "top";

  textCtx.fillStyle = "#33a8e6";
  textCtx.font =
    '800 27px "Avenir Next", Arial, sans-serif';

  const metaLines = wrapLines(
    textCtx,
    entry.meta.toUpperCase(),
    contentW
  );

  metaLines.slice(0, 2).forEach((line) => {
    textCtx.fillText(line, margin, y);
    y += 38;
  });

  y += 24;

  textCtx.fillStyle = INK;
  textCtx.font =
    '650 74px "Avenir Next", Arial, sans-serif';

  const titleLines = wrapLines(
    textCtx,
    entry.title,
    contentW
  );

  titleLines.slice(0, 3).forEach((line) => {
    textCtx.fillText(line, margin, y);
    y += 83;
  });

  y += 24;

  textCtx.fillStyle = MUTED;
  textCtx.font =
    '450 34px "Avenir Next", Arial, sans-serif';

  const bodyLines = wrapLines(
    textCtx,
    entry.text,
    contentW
  );

  for (const line of bodyLines) {
    if (y > textCanvas.height - 95) break;

    if (!line) {
      y += 30;
      continue;
    }

    textCtx.fillText(line, margin, y);
    y += 52;
  }

  /*
    Photo credit stays visible but secondary,
    matching the current site hierarchy.
  */
  const imageData = activeImage();

  if (imageData?.credit) {
    textCtx.fillStyle = "#9a9a9a";
    textCtx.font =
      '500 22px "Avenir Next", Arial, sans-serif';

    textCtx.fillText(
      `Photo: ${imageData.credit}`,
      margin,
      textCanvas.height - 52
    );
  }

  textTexture.needsUpdate = true;
}

function refreshCard() {
  const entry = activeEntry();

  if (!entry) return;

  const count = entry.images?.length || 0;
  activeImageIndex =
    count
      ? (activeImageIndex + count) % count
      : 0;

  drawCardText(entry);
  loadCardPhoto(entry);
  rebuildGalleryDots(entry);

  const multi = count > 1;
  cardPrevLabel.visible = multi;
  cardNextLabel.visible = multi;
  cardPrevHit.visible = multi;
  cardNextHit.visible = multi;
}

function changeImage(delta) {
  const entry = activeEntry();
  const count = entry?.images?.length || 0;

  if (count <= 1) return;

  activeImageIndex =
    (activeImageIndex + delta + count) % count;

  drawCardText(entry);
  loadCardPhoto(entry);
  refreshGalleryDots();

  if (photoViewer.visible) {
    updateLargePhotoViewer();
  }
}

/* ---------------------------------------------------------
   Node selection and visual focus
--------------------------------------------------------- */

function updateChildVisibility() {
  CHILD_ENTRIES.forEach((entry) => {
    const group = nodeGroups.get(entry.id);

    if (group) {
      group.visible =
        expandedParents.has(entry.parentId);
    }
  });

  connectionObjects.forEach((line) => {
    if (line.userData.kind !== "branch") return;

    line.visible =
      expandedParents.has(line.userData.from);
  });
}

function setNodeVisual(id, mode) {
  const group = nodeGroups.get(id);
  const entry = ENTRY_BY_ID.get(id);

  if (!group || !entry) return;

  const isActive = mode === "active";
  const isHover = mode === "hover";

  group.userData.ring.material.color.setHex(
    isActive || isHover ? BLUE : 0x626262
  );

  group.userData.dot.material.color.setHex(
    isActive ? BLUE : SCENE_BG
  );

  replaceTextPlaneTexture(
    group.userData.label,
    entry.label,
    {
      fontSize: entry.parentId ? 50 : 62,
      fontWeight: entry.parentId ? 600 : 650,
      color:
        isActive || isHover
          ? "#33a8e6"
          : entry.parentId
            ? "#737373"
            : "#5f5f5f",
      background: "rgba(252,252,252,0.88)",
      paddingX: 25,
      paddingY: 16,
      pixelsPerMeter: 1020
    }
  );

  const label = group.userData.label;
  label.position.x =
    label.userData.widthM / 2 + 0.003;

  const hit = group.userData.hit;
  const newHitWidth = Math.max(
    0.34,
    label.userData.widthM + 0.13
  );

  hit.geometry.dispose();
  hit.geometry =
    new THREE.PlaneGeometry(
      newHitWidth,
      Math.max(0.11, label.userData.heightM + 0.035)
    );

  hit.position.x =
    label.userData.widthM / 2 - 0.015;

  const scale =
    isActive
      ? 1.085
      : isHover
        ? 1.04
        : 1;

  group.scale.setScalar(scale);
}

function refreshNodeVisuals() {
  ALL_ENTRIES.forEach((entry) => {
    let mode = "normal";

    if (entry.id === activeId) {
      mode = "active";
    } else if (entry.id === hoveredId) {
      mode = "hover";
    }

    setNodeVisual(entry.id, mode);
  });

  connectionObjects.forEach((line) => {
    const connected =
      line.userData.from === activeId ||
      line.userData.to === activeId;

    line.material.color.setHex(
      connected ? BLUE : LIGHT_LINE
    );

    line.material.opacity =
      connected
        ? 0.92
        : line.userData.kind === "branch"
          ? 0.62
          : 0.34;
  });
}

function setActive(id) {
  if (!ENTRY_BY_ID.has(id)) return;

  activeId = id;
  activeImageIndex = 0;

  if (CHILDREN_BY_PARENT.has(id)) {
    expandedParents.add(id);
    updateChildVisibility();
  }

  refreshCard();
  refreshNodeVisuals();
}

/* ---------------------------------------------------------
   Large spatial photo viewer
--------------------------------------------------------- */

const photoViewer = new THREE.Group();
photoViewer.visible = false;
scene.add(photoViewer);

const viewerBackdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(5.0, 3.25),
  new THREE.MeshBasicMaterial({
    color: 0x111111,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    depthWrite: false
  })
);
viewerBackdrop.position.z = -0.08;
photoViewer.add(viewerBackdrop);

const viewerImageMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  })
);
viewerImageMesh.position.z = 0;
photoViewer.add(viewerImageMesh);

const viewerImageHit = makeInvisibleHitPlane(
  3.35,
  2.35,
  { action: "close-photo" }
);
viewerImageHit.position.z = 0.035;
photoViewer.add(viewerImageHit);
interactionTargets.push(viewerImageHit);

const viewerClose = makeTextPlane("×", {
  fontSize: 72,
  fontWeight: 450,
  color: "#ffffff",
  background: "rgba(20,20,20,0.55)",
  paddingX: 26,
  paddingY: 13,
  pixelsPerMeter: 980,
  align: "center"
});
viewerClose.position.set(1.93, 1.24, 0.05);
photoViewer.add(viewerClose);

const viewerCloseHit = makeInvisibleHitPlane(
  0.18,
  0.18,
  { action: "close-photo" }
);
viewerCloseHit.position.copy(viewerClose.position);
photoViewer.add(viewerCloseHit);
interactionTargets.push(viewerCloseHit);

const viewerPrev = makeTextPlane("←", {
  fontSize: 76,
  fontWeight: 450,
  color: "#ffffff",
  background: "rgba(20,20,20,0.45)",
  paddingX: 28,
  paddingY: 16,
  pixelsPerMeter: 920,
  align: "center"
});
viewerPrev.position.set(-1.95, 0, 0.05);
photoViewer.add(viewerPrev);

const viewerNext = makeTextPlane("→", {
  fontSize: 76,
  fontWeight: 450,
  color: "#ffffff",
  background: "rgba(20,20,20,0.45)",
  paddingX: 28,
  paddingY: 16,
  pixelsPerMeter: 920,
  align: "center"
});
viewerNext.position.set(1.95, 0, 0.05);
photoViewer.add(viewerNext);

const viewerPrevHit = makeInvisibleHitPlane(
  0.22,
  0.22,
  { action: "viewer-prev" }
);
viewerPrevHit.position.copy(viewerPrev.position);
photoViewer.add(viewerPrevHit);
interactionTargets.push(viewerPrevHit);

const viewerNextHit = makeInvisibleHitPlane(
  0.22,
  0.22,
  { action: "viewer-next" }
);
viewerNextHit.position.copy(viewerNext.position);
photoViewer.add(viewerNextHit);
interactionTargets.push(viewerNextHit);

const viewerCaption = makeTextPlane("", {
  fontSize: 30,
  fontWeight: 550,
  color: "#e4e4e4",
  background: "rgba(20,20,20,0.30)",
  paddingX: 22,
  paddingY: 13,
  pixelsPerMeter: 1150
});
viewerCaption.position.set(0, -1.18, 0.05);
photoViewer.add(viewerCaption);

let viewerTexture = null;
let viewerLoadToken = 0;

function placeViewerInFront() {
  const sourceCamera =
    renderer.xr.isPresenting
      ? renderer.xr.getCamera(camera)
      : camera;

  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();

  sourceCamera.getWorldPosition(position);
  sourceCamera.getWorldQuaternion(quaternion);

  const offset =
    new THREE.Vector3(0, 0, -2.05)
      .applyQuaternion(quaternion);

  photoViewer.position.copy(position).add(offset);
  photoViewer.quaternion.copy(quaternion);
}

function updateLargePhotoViewer() {
  const imageData = activeImage();
  const entry = activeEntry();

  if (!imageData || !entry) return;

  const token = ++viewerLoadToken;

  new THREE.TextureLoader().load(
    imageData.src,
    (texture) => {
      if (token !== viewerLoadToken) {
        texture.dispose();
        return;
      }

      texture.colorSpace = THREE.SRGBColorSpace;

      if (viewerTexture) {
        viewerTexture.dispose();
      }

      viewerTexture = texture;
      viewerImageMesh.material.map = texture;
      viewerImageMesh.material.needsUpdate = true;

      const image = texture.image;
      const aspect =
        image?.width && image?.height
          ? image.width / image.height
          : 1.5;

      const maxW = 3.35;
      const maxH = 2.25;

      let w = maxW;
      let h = w / aspect;

      if (h > maxH) {
        h = maxH;
        w = h * aspect;
      }

      viewerImageMesh.scale.set(w, h, 1);

      viewerImageHit.geometry.dispose();
      viewerImageHit.geometry =
        new THREE.PlaneGeometry(w, h);

      const count = entry.images?.length || 0;
      const multi = count > 1;

      viewerPrev.visible = multi;
      viewerNext.visible = multi;
      viewerPrevHit.visible = multi;
      viewerNextHit.visible = multi;

      replaceTextPlaneTexture(
        viewerCaption,
        imageData.credit
          ? `${activeImageIndex + 1} / ${count} · ${imageData.credit}`
          : `${activeImageIndex + 1} / ${count}`,
        {
          fontSize: 30,
          fontWeight: 550,
          color: "#e4e4e4",
          background: "rgba(20,20,20,0.30)",
          paddingX: 22,
          paddingY: 13,
          pixelsPerMeter: 1150
        }
      );
    },
    undefined,
    () => { }
  );
}

function openPhotoViewer() {
  if (!activeImage()) return;

  photoViewer.visible = true;
  placeViewerInFront();
  updateLargePhotoViewer();
}

function closePhotoViewer() {
  photoViewer.visible = false;
}

/* ---------------------------------------------------------
   Interactions
--------------------------------------------------------- */

const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
const controllers = [];

function activeInteractionTargets() {
  return interactionTargets.filter((object) => {
    if (!objectEffectivelyVisible(object)) return false;

    if (photoViewer.visible) {
      return object.parent === photoViewer;
    }

    return object.parent !== photoViewer;
  });
}

function intersectController(controller) {
  tempMatrix
    .identity()
    .extractRotation(controller.matrixWorld);

  raycaster.ray.origin.setFromMatrixPosition(
    controller.matrixWorld
  );

  raycaster.ray.direction
    .set(0, 0, -1)
    .applyMatrix4(tempMatrix);

  const hits = raycaster.intersectObjects(
    activeInteractionTargets(),
    false
  );

  return hits[0] || null;
}

function runAction(object) {
  const action = object?.userData?.action;

  if (!action) return;

  if (action === "node") {
    setActive(object.userData.entryId);
    return;
  }

  if (action === "open-photo") {
    openPhotoViewer();
    return;
  }

  if (action === "gallery-prev") {
    changeImage(-1);
    return;
  }

  if (action === "gallery-next") {
    changeImage(1);
    return;
  }

  if (action === "viewer-prev") {
    changeImage(-1);
    return;
  }

  if (action === "viewer-next") {
    changeImage(1);
    return;
  }

  if (action === "close-photo") {
    closePhotoViewer();
  }
}

function createController(index) {
  const controller = renderer.xr.getController(index);

  const rayGeometry =
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1)
    ]);

  const ray = new THREE.Line(
    rayGeometry,
    new THREE.LineBasicMaterial({
      color: 0x777777,
      transparent: true,
      opacity: 0.62
    })
  );

  ray.scale.z = 5;
  controller.add(ray);
  controller.userData.ray = ray;

  controller.addEventListener("select", () => {
    const hit = intersectController(controller);

    if (hit?.object) {
      runAction(hit.object);
    }
  });

  scene.add(controller);
  controllers.push(controller);
}

createController(0);
createController(1);

function updateControllerHover() {
  let nextHovered = null;

  controllers.forEach((controller) => {
    const hit = intersectController(controller);

    if (hit?.object) {
      controller.userData.ray.material.color.setHex(BLUE);
      controller.userData.ray.scale.z =
        Math.min(5, hit.distance);

      if (
        !photoViewer.visible &&
        hit.object.userData.action === "node"
      ) {
        nextHovered =
          hit.object.userData.entryId;
      }
    } else {
      controller.userData.ray.material.color.setHex(
        0x777777
      );
      controller.userData.ray.scale.z = 5;
    }
  });

  if (nextHovered !== hoveredId) {
    hoveredId = nextHovered;
    refreshNodeVisuals();
  }
}

/* Desktop click preview */
const desktopPointer = new THREE.Vector2();

renderer.domElement.addEventListener(
  "pointerdown",
  (event) => {
    if (renderer.xr.isPresenting) return;

    const rect =
      renderer.domElement.getBoundingClientRect();

    desktopPointer.x =
      ((event.clientX - rect.left) / rect.width) * 2 - 1;

    desktopPointer.y =
      -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(
      desktopPointer,
      camera
    );

    const hits = raycaster.intersectObjects(
      activeInteractionTargets(),
      false
    );

    if (hits[0]?.object) {
      runAction(hits[0].object);
    }
  }
);

/* ---------------------------------------------------------
   Start state
--------------------------------------------------------- */

updateChildVisibility();
setActive(activeId);

/* ---------------------------------------------------------
   Render
--------------------------------------------------------- */

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();

  if (!renderer.xr.isPresenting) {
    controls.update();
  } else {
    updateControllerHover();
  }

  /*
    Very small depth movement only.
    Labels remain spatially fixed and do not rotate with the head.
  */
  nodeGroups.forEach((group) => {
    const base = nodePosition(
      ENTRY_BY_ID.get(group.userData.entryId)
    );

    group.position.z =
      base.z +
      Math.sin(
        t * 0.68 + group.userData.floatPhase
      ) * 0.006;
  });

  renderer.render(scene, camera);
});

window.addEventListener("resize", () => {
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});
