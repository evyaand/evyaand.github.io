import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const BLUE = 0x33a8e6;
const BLUE_CSS = "#33a8e6";
const INK = "#222222";
const MUTED = "#777777";
const BG = 0xfcfcfc;
const LINE = 0xd8d8d8;

/*
  VR is currently opt-in.

  Normal:
  /explore/

  Test:
  /explore/?vrtest=1#nodes
*/

const params = new URLSearchParams(
  window.location.search
);

if (params.get("vrtest") === "1") {
  startVrBootstrap();
}

async function startVrBootstrap() {
  let data;

  try {
    data = await waitForNodeData();
  } catch (error) {
    console.error(error);

    showVrMessage(
      "Could not load Nodes data."
    );

    return;
  }

  if (!navigator.xr) {
    showVrMessage(
      "WebXR is not available in this browser."
    );

    return;
  }

  const supported =
    await navigator.xr.isSessionSupported(
      "immersive-vr"
    );

  if (!supported) {
    showVrMessage(
      "Immersive VR is not available here."
    );

    return;
  }

  const button = createVrButton();

  document.body.appendChild(button);

  button.addEventListener(
    "click",
    async () => {
      button.disabled = true;
      button.textContent = "OPENING VR…";

      try {
        const session =
          await navigator.xr.requestSession(
            "immersive-vr",
            {
              optionalFeatures: [
                "local-floor",
                "bounded-floor",
              ],
            }
          );

        await launchExperience(
          session,
          data,
          button
        );
      } catch (error) {
        console.error(error);

        button.disabled = false;
        button.textContent = "ENTER VR";
      }
    }
  );
}

function waitForNodeData() {
  return new Promise(
    (resolve, reject) => {
      const started =
        performance.now();

      function check() {
        if (
          window.EVYA_NODES?.entries
            ?.length
        ) {
          resolve(
            window.EVYA_NODES
          );

          return;
        }

        if (
          performance.now() -
          started >
          5000
        ) {
          reject(
            new Error(
              "EVYA_NODES was not exposed by about.js"
            )
          );

          return;
        }

        requestAnimationFrame(
          check
        );
      }

      check();
    }
  );
}

function createVrButton() {
  const button =
    document.createElement(
      "button"
    );

  button.type = "button";
  button.textContent = "ENTER VR";

  Object.assign(
    button.style,
    {
      position: "fixed",
      right: "24px",
      bottom: "24px",
      zIndex: "99999",

      padding: "12px 18px",

      border:
        "1px solid #bdbdbd",

      borderRadius: "2px",

      background:
        "rgba(255,255,255,.96)",

      color: "#222",

      fontFamily:
        '"Avenir Next", Avenir, "Helvetica Neue", Helvetica, Arial, sans-serif',

      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: ".08em",

      cursor: "pointer",
    }
  );

  return button;
}

function showVrMessage(text) {
  const note =
    document.createElement(
      "div"
    );

  note.textContent = text;

  Object.assign(
    note.style,
    {
      position: "fixed",
      right: "24px",
      bottom: "24px",
      zIndex: "99999",

      padding: "10px 14px",

      border:
        "1px solid #ddd",

      background:
        "rgba(255,255,255,.96)",

      color: "#777",

      fontFamily:
        '"Avenir Next", Avenir, sans-serif',

      fontSize: "11px",
    }
  );

  document.body.appendChild(
    note
  );
}

async function launchExperience(
  session,
  data,
  button
) {
  const entries =
    data.entries || [];

  const children =
    data.children || {};

  const edges =
    data.edges || [];

  const allEntries = [
    ...entries,
    ...Object.values(
      children
    ).flat(),
  ];

  const byId =
    new Map(
      allEntries.map(
        (entry) => [
          entry.id,
          entry,
        ]
      )
    );

  /*
    ------------------------------------------------
    Scene
    ------------------------------------------------
  */

  const scene =
    new THREE.Scene();

  scene.background =
    new THREE.Color(BG);

  const camera =
    new THREE.PerspectiveCamera(
      55,
      1,
      0.01,
      100
    );

  const renderer =
    new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
  );

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  renderer.xr.enabled = true;

  renderer.xr.setReferenceSpaceType(
    "local-floor"
  );

  /*
    We do not use the canvas as a
    desktop interface. It exists only
    to support the XR session.
  */

  Object.assign(
    renderer.domElement.style,
    {
      position: "fixed",
      left: "0",
      top: "0",
      width: "1px",
      height: "1px",
      opacity: "0",
      pointerEvents: "none",
    }
  );

  document.body.appendChild(
    renderer.domElement
  );

  await renderer.xr.setSession(
    session
  );

  button.style.display = "none";

  /*
    ------------------------------------------------
    Overall spatial composition

    LEFT:
    huge Node field

    RIGHT:
    large story / gallery

    There is intentionally no box or
    frame around the Nodes.
    ------------------------------------------------
  */

  const root =
    new THREE.Group();

  scene.add(root);

  const mapGroup =
    new THREE.Group();

  mapGroup.position.set(
    -1.75,
    1.58,
    -3.85
  );

  root.add(mapGroup);

  /*
    Much larger than the original
    browser graph.

    Coordinates still come DIRECTLY
    from about.js x/y.
  */

  const MAP_WIDTH = 7.15;
  const MAP_HEIGHT = 3.55;

  const cardGroup =
    new THREE.Group();

  cardGroup.position.set(
    2.42,
    1.58,
    -2.82
  );

  cardGroup.rotation.y =
    THREE.MathUtils.degToRad(
      -10
    );

  root.add(cardGroup);

  const nodeGroups =
    new Map();

  const lineObjects = [];

  const interactionTargets =
    [];

  const expanded =
    new Set();

  let activeId =
    byId.has(
      "statute-of-liberty"
    )
      ? "statute-of-liberty"
      : entries[0]?.id;

  let hoveredId = null;

  let activeImageIndex = 0;

  /*
    Existing percentage coordinates
    are simply mapped into a much
    larger physical VR field.
  */

  function nodePosition(
    entry
  ) {
    const nx =
      entry.x / 100 - 0.5;

    const ny =
      0.5 - entry.y / 100;

    /*
      Small depth curve.
      Still reads as the original
      graph, but occupies real space.
    */

    return new THREE.Vector3(
      nx * MAP_WIDTH,
      ny * MAP_HEIGHT,
      Math.abs(nx) * 0.26
    );
  }

  /*
    ------------------------------------------------
    Connections
    ------------------------------------------------
  */

  function makeLine(edge) {
    const from =
      byId.get(
        edge.fromId
      );

    const to =
      byId.get(
        edge.toId
      );

    if (!from || !to) {
      return;
    }

    const geometry =
      new THREE.BufferGeometry()
        .setFromPoints([
          nodePosition(from),
          nodePosition(to),
        ]);

    const material =
      new THREE.LineBasicMaterial({
        color: LINE,

        transparent: true,

        opacity:
          edge.kind ===
            "branch"
            ? 0.48
            : 0.28,
      });

    const line =
      new THREE.Line(
        geometry,
        material
      );

    line.userData.edge =
      edge;

    if (
      edge.kind ===
      "branch"
    ) {
      line.visible = false;
    }

    mapGroup.add(line);

    lineObjects.push(
      line
    );
  }

  edges.forEach(
    makeLine
  );

  /*
    ------------------------------------------------
    Nodes
    ------------------------------------------------
  */

  allEntries.forEach(
    (entry, index) => {
      const group =
        new THREE.Group();

      group.position.copy(
        nodePosition(entry)
      );

      group.userData.entryId =
        entry.id;

      group.userData.phase =
        index * 0.71;

      /*
        Important difference from V1:

        labels are normal THREE.Mesh
        planes.

        They DO NOT billboard toward
        your head.
      */

      const nx =
        entry.x / 100 -
        0.5;

      group.rotation.y =
        THREE.MathUtils.degToRad(
          -nx * 18
        );

      const dot =
        new THREE.Mesh(
          new THREE.CircleGeometry(
            0.027,
            32
          ),

          new THREE.MeshBasicMaterial(
            {
              color: BG,

              side:
                THREE.DoubleSide,
            }
          )
        );

      dot.position.set(
        -0.055,
        0,
        0.012
      );

      const ring =
        new THREE.Mesh(
          new THREE.RingGeometry(
            0.020,
            0.028,
            32
          ),

          new THREE.MeshBasicMaterial(
            {
              color:
                0x666666,

              side:
                THREE.DoubleSide,
            }
          )
        );

      ring.position.set(
        -0.055,
        0,
        0.014
      );

      const normalLabel =
        createTextTexture(
          entry.label,
          {
            fontSize:
              entry.parentId
                ? 49
                : 60,

            fontWeight:
              entry.parentId
                ? 600
                : 650,

            color:
              entry.parentId
                ? "#777777"
                : "#5e5e5e",

            background:
              "rgba(252,252,252,.88)",
          }
        );

      const activeLabel =
        createTextTexture(
          entry.label,
          {
            fontSize:
              entry.parentId
                ? 49
                : 60,

            fontWeight:
              entry.parentId
                ? 600
                : 650,

            color:
              BLUE_CSS,

            background:
              "rgba(252,252,252,.92)",
          }
        );

      const labelGeometry =
        new THREE.PlaneGeometry(
          normalLabel.widthM,
          normalLabel.heightM
        );

      const labelMaterial =
        new THREE.MeshBasicMaterial({
          map:
            normalLabel.texture,

          transparent: true,

          side:
            THREE.DoubleSide,

          depthWrite: false,
        });

      const label =
        new THREE.Mesh(
          labelGeometry,
          labelMaterial
        );

      label.position.set(
        normalLabel.widthM /
        2 +
        0.005,
        0,
        0.016
      );

      const hit =
        new THREE.Mesh(
          new THREE.PlaneGeometry(
            Math.max(
              0.38,
              normalLabel.widthM +
              0.15
            ),

            Math.max(
              0.12,
              normalLabel.heightM +
              0.05
            )
          ),

          new THREE.MeshBasicMaterial(
            {
              transparent: true,
              opacity: 0,
              depthWrite: false,

              side:
                THREE.DoubleSide,
            }
          )
        );

      hit.position.set(
        normalLabel.widthM /
        2 -
        0.02,
        0,
        0.03
      );

      hit.userData.action =
        "node";

      hit.userData.entryId =
        entry.id;

      group.add(
        dot,
        ring,
        label,
        hit
      );

      group.userData.dot =
        dot;

      group.userData.ring =
        ring;

      group.userData.label =
        label;

      group.userData.normalTexture =
        normalLabel.texture;

      group.userData.activeTexture =
        activeLabel.texture;

      if (entry.parentId) {
        group.visible = false;
      }

      mapGroup.add(group);

      nodeGroups.set(
        entry.id,
        group
      );

      interactionTargets.push(
        hit
      );
    }
  );

  /*
    ------------------------------------------------
    Story card
    ------------------------------------------------
  */

  const card =
    createStoryCard(
      cardGroup,
      interactionTargets
    );

  /*
    ------------------------------------------------
    Full-size photo viewer
    ------------------------------------------------
  */

  const viewer =
    createPhotoViewer(
      scene,
      interactionTargets,
      renderer,
      camera
    );

  function getActiveEntry() {
    return byId.get(
      activeId
    );
  }

  function getImages() {
    return (
      getActiveEntry()
        ?.images || []
    );
  }

  /*
    ------------------------------------------------
    Child nodes
    ------------------------------------------------
  */

  function updateBranchVisibility() {
    allEntries.forEach(
      (entry) => {
        if (
          !entry.parentId
        ) {
          return;
        }

        const group =
          nodeGroups.get(
            entry.id
          );

        if (group) {
          group.visible =
            expanded.has(
              entry.parentId
            );
        }
      }
    );

    lineObjects.forEach(
      (line) => {
        const edge =
          line.userData.edge;

        if (
          edge.kind !==
          "branch"
        ) {
          return;
        }

        line.visible =
          expanded.has(
            edge.fromId
          );
      }
    );
  }

  function updateNodeVisuals() {
    nodeGroups.forEach(
      (group, id) => {
        const active =
          id === activeId;

        const hovered =
          id === hoveredId;

        group.userData.ring
          .material.color.setHex(
            active ||
              hovered
              ? BLUE
              : 0x666666
          );

        group.userData.dot
          .material.color.setHex(
            active
              ? BLUE
              : BG
          );

        group.userData.label
          .material.map =
          active ||
            hovered
            ? group.userData
              .activeTexture
            : group.userData
              .normalTexture;

        group.userData.label
          .material.needsUpdate =
          true;

        const scale =
          active
            ? 1.08
            : hovered
              ? 1.035
              : 1;

        group.scale.setScalar(
          scale
        );
      }
    );

    lineObjects.forEach(
      (line) => {
        const edge =
          line.userData.edge;

        const connected =
          edge.fromId ===
          activeId ||
          edge.toId ===
          activeId;

        line.material.color.setHex(
          connected
            ? BLUE
            : LINE
        );

        line.material.opacity =
          connected
            ? 0.9
            : edge.kind ===
              "branch"
              ? 0.48
              : 0.28;
      }
    );
  }

  /*
    ------------------------------------------------
    Card / gallery
    ------------------------------------------------
  */

  async function updateCard() {
    const entry =
      getActiveEntry();

    if (!entry) {
      return;
    }

    const images =
      entry.images || [];

    if (
      activeImageIndex >=
      images.length
    ) {
      activeImageIndex = 0;
    }

    card.drawText(
      entry,
      activeImageIndex
    );

    card.setGalleryState(
      images.length,
      activeImageIndex
    );

    if (images.length) {
      await card.setImage(
        images[
        activeImageIndex
        ]
      );
    } else {
      card.clearImage();
    }

    if (
      viewer.group.visible &&
      images.length
    ) {
      await viewer.setImage(
        images[
        activeImageIndex
        ],
        activeImageIndex,
        images.length
      );
    }
  }

  async function setActive(
    id
  ) {
    if (!byId.has(id)) {
      return;
    }

    activeId = id;
    activeImageIndex = 0;

    if (
      children[id]?.length
    ) {
      expanded.add(id);
    }

    updateBranchVisibility();
    updateNodeVisuals();

    await updateCard();
  }

  async function moveImage(
    direction
  ) {
    const images =
      getImages();

    if (
      images.length < 2
    ) {
      return;
    }

    activeImageIndex =
      (
        activeImageIndex +
        direction +
        images.length
      ) %
      images.length;

    await updateCard();
  }

  /*
    ------------------------------------------------
    Large photo viewer
    ------------------------------------------------
  */

  async function openViewer() {
    const images =
      getImages();

    if (!images.length) {
      return;
    }

    viewer.open();

    await viewer.setImage(
      images[
      activeImageIndex
      ],
      activeImageIndex,
      images.length
    );
  }

  /*
    ------------------------------------------------
    Interaction routing
    ------------------------------------------------
  */

  async function runAction(
    object
  ) {
    const action =
      object?.userData
        ?.action;

    if (!action) {
      return;
    }

    if (
      action === "node"
    ) {
      await setActive(
        object.userData
          .entryId
      );

      return;
    }

    if (
      action ===
      "gallery-prev" ||
      action ===
      "viewer-prev"
    ) {
      await moveImage(-1);
      return;
    }

    if (
      action ===
      "gallery-next" ||
      action ===
      "viewer-next"
    ) {
      await moveImage(1);
      return;
    }

    if (
      action ===
      "open-photo"
    ) {
      await openViewer();
      return;
    }

    if (
      action ===
      "close-photo"
    ) {
      viewer.close();
    }
  }

  /*
    ------------------------------------------------
    Controllers
    ------------------------------------------------
  */

  const raycaster =
    new THREE.Raycaster();

  const tempMatrix =
    new THREE.Matrix4();

  const controllers = [];

  function isVisible(
    object
  ) {
    let current =
      object;

    while (current) {
      if (!current.visible) {
        return false;
      }

      current =
        current.parent;
    }

    return true;
  }

  function activeTargets() {
    return interactionTargets.filter(
      (target) => {
        if (
          !isVisible(target)
        ) {
          return false;
        }

        const inViewer =
          target.userData
            .scope ===
          "viewer";

        return viewer.group
          .visible
          ? inViewer
          : !inViewer;
      }
    );
  }

  function intersectionFor(
    controller
  ) {
    tempMatrix
      .identity()
      .extractRotation(
        controller.matrixWorld
      );

    raycaster.ray.origin
      .setFromMatrixPosition(
        controller.matrixWorld
      );

    raycaster.ray.direction
      .set(0, 0, -1)
      .applyMatrix4(
        tempMatrix
      );

    const intersections =
      raycaster.intersectObjects(
        activeTargets(),
        false
      );

    return (
      intersections[0] ||
      null
    );
  }

  function createController(
    index
  ) {
    const controller =
      renderer.xr.getController(
        index
      );

    const rayGeometry =
      new THREE.BufferGeometry()
        .setFromPoints([
          new THREE.Vector3(
            0,
            0,
            0
          ),

          new THREE.Vector3(
            0,
            0,
            -1
          ),
        ]);

    const ray =
      new THREE.Line(
        rayGeometry,

        new THREE.LineBasicMaterial(
          {
            color:
              0x777777,

            transparent: true,

            opacity: 0.62,
          }
        )
      );

    ray.scale.z = 5;

    controller.add(ray);

    controller.userData.ray =
      ray;

    controller.addEventListener(
      "select",
      async () => {
        const hit =
          intersectionFor(
            controller
          );

        if (hit?.object) {
          await runAction(
            hit.object
          );
        }
      }
    );

    scene.add(
      controller
    );

    controllers.push(
      controller
    );
  }

  createController(0);
  createController(1);

  function updateControllerHover() {
    let nextHovered =
      null;

    controllers.forEach(
      (controller) => {
        const hit =
          intersectionFor(
            controller
          );

        const ray =
          controller.userData
            .ray;

        if (hit) {
          ray.material.color
            .setHex(BLUE);

          ray.scale.z =
            Math.min(
              5,
              hit.distance
            );

          if (
            !viewer.group
              .visible &&
            hit.object
              .userData
              .action ===
            "node"
          ) {
            nextHovered =
              hit.object
                .userData
                .entryId;
          }
        } else {
          ray.material.color
            .setHex(
              0x777777
            );

          ray.scale.z = 5;
        }
      }
    );

    if (
      nextHovered !==
      hoveredId
    ) {
      hoveredId =
        nextHovered;

      updateNodeVisuals();
    }
  }

  /*
    ------------------------------------------------
    Initial state
    ------------------------------------------------
  */

  updateBranchVisibility();

  await setActive(
    activeId
  );

  /*
    ------------------------------------------------
    Animation
    ------------------------------------------------
  */

  const clock =
    new THREE.Clock();

  renderer.setAnimationLoop(
    () => {
      const t =
        clock.getElapsedTime();

      updateControllerHover();

      /*
        Only a tiny positional drift.

        Crucially:
        NO rotation toward the head.
      */

      nodeGroups.forEach(
        (group) => {
          const entry =
            byId.get(
              group.userData
                .entryId
            );

          if (!entry) {
            return;
          }

          const base =
            nodePosition(
              entry
            );

          group.position.z =
            base.z +
            Math.sin(
              t * 0.55 +
              group.userData
                .phase
            ) *
            0.0045;
        }
      );

      renderer.render(
        scene,
        camera
      );
    }
  );

  session.addEventListener(
    "end",
    () => {
      renderer.setAnimationLoop(
        null
      );

      renderer.dispose();

      renderer.domElement.remove();

      button.style.display =
        "";

      button.disabled = false;

      button.textContent =
        "ENTER VR";
    }
  );
}

/*
  ==========================================================
  STORY CARD
  ==========================================================
*/

function createStoryCard(
  group,
  targets
) {
  const width = 1.82;

  /*
    Very subtle white backing.

    This is not a border/frame.
    It exists mainly to keep text
    readable against the open field.
  */

  const backing =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width + 0.10,
        2.78
      ),

      new THREE.MeshBasicMaterial(
        {
          color: BG,
          transparent: true,
          opacity: 0.96,
          side:
            THREE.DoubleSide,
        }
      )
    );

  backing.position.z =
    -0.015;

  group.add(backing);

  /*
    Large photo
  */

  const photoCanvas =
    document.createElement(
      "canvas"
    );

  photoCanvas.width = 1800;
  photoCanvas.height = 1120;

  const photoCtx =
    photoCanvas.getContext(
      "2d"
    );

  const photoTexture =
    new THREE.CanvasTexture(
      photoCanvas
    );

  photoTexture.colorSpace =
    THREE.SRGBColorSpace;

  const photo =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width,
        1.13
      ),

      new THREE.MeshBasicMaterial(
        {
          map: photoTexture,

          side:
            THREE.DoubleSide,
        }
      )
    );

  photo.position.set(
    0,
    0.73,
    0
  );

  group.add(photo);

  const photoHit =
    invisibleHit(
      width,
      1.13,
      "open-photo"
    );

  photoHit.position.set(
    0,
    0.73,
    0.025
  );

  group.add(photoHit);

  targets.push(
    photoHit
  );

  /*
    Story text
  */

  const textCanvas =
    document.createElement(
      "canvas"
    );

  textCanvas.width = 1800;
  textCanvas.height = 1500;

  const textCtx =
    textCanvas.getContext(
      "2d"
    );

  const textTexture =
    new THREE.CanvasTexture(
      textCanvas
    );

  textTexture.colorSpace =
    THREE.SRGBColorSpace;

  const text =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width,
        1.45
      ),

      new THREE.MeshBasicMaterial(
        {
          map: textTexture,

          transparent: true,

          side:
            THREE.DoubleSide,

          depthWrite: false,
        }
      )
    );

  text.position.set(
    0,
    -0.68,
    0.001
  );

  group.add(text);

  /*
    Gallery arrows
  */

  const prev =
    createControl(
      "←",
      "gallery-prev"
    );

  prev.group.position.set(
    -1.03,
    0.73,
    0.05
  );

  group.add(
    prev.group
  );

  targets.push(
    prev.hit
  );

  const next =
    createControl(
      "→",
      "gallery-next"
    );

  next.group.position.set(
    1.03,
    0.73,
    0.05
  );

  group.add(
    next.group
  );

  targets.push(
    next.hit
  );

  /*
    Gallery dots
  */

  const dots =
    new THREE.Group();

  dots.position.set(
    0,
    0.10,
    0.045
  );

  group.add(dots);

  let loadToken = 0;

  function clearImage() {
    photoCtx.clearRect(
      0,
      0,
      photoCanvas.width,
      photoCanvas.height
    );

    photoCtx.fillStyle =
      "#f2f2f2";

    photoCtx.fillRect(
      0,
      0,
      photoCanvas.width,
      photoCanvas.height
    );

    photoTexture.needsUpdate =
      true;
  }

  async function setImage(
    imageData
  ) {
    const token =
      ++loadToken;

    try {
      const image =
        await loadImage(
          imageData.src
        );

      if (
        token !==
        loadToken
      ) {
        return;
      }

      photoCtx.clearRect(
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

      photoTexture.needsUpdate =
        true;
    } catch (error) {
      console.warn(
        "Could not load VR card image",
        imageData.src,
        error
      );

      clearImage();
    }
  }

  function drawText(
    entry,
    imageIndex
  ) {
    textCtx.clearRect(
      0,
      0,
      textCanvas.width,
      textCanvas.height
    );

    textCtx.fillStyle =
      "rgba(252,252,252,.97)";

    textCtx.fillRect(
      0,
      0,
      textCanvas.width,
      textCanvas.height
    );

    const margin = 58;

    const contentWidth =
      textCanvas.width -
      margin * 2;

    let y = 44;

    textCtx.textBaseline =
      "top";

    /*
      Meta
    */

    textCtx.fillStyle =
      BLUE_CSS;

    textCtx.font =
      '800 27px "Avenir Next", Arial, sans-serif';

    const meta =
      wrapLines(
        textCtx,
        (
          entry.meta || ""
        ).toUpperCase(),
        contentWidth
      );

    meta.slice(0, 2)
      .forEach(
        (line) => {
          textCtx.fillText(
            line,
            margin,
            y
          );

          y += 39;
        }
      );

    y += 23;

    /*
      Title
    */

    textCtx.fillStyle =
      INK;

    textCtx.font =
      '650 76px "Avenir Next", Arial, sans-serif';

    const titles =
      wrapLines(
        textCtx,
        entry.title ||
        entry.label,
        contentWidth
      );

    titles
      .slice(0, 3)
      .forEach(
        (line) => {
          textCtx.fillText(
            line,
            margin,
            y
          );

          y += 86;
        }
      );

    y += 22;

    /*
      Body
    */

    textCtx.fillStyle =
      MUTED;

    textCtx.font =
      '450 34px "Avenir Next", Arial, sans-serif';

    const body =
      wrapLines(
        textCtx,
        entry.text || "",
        contentWidth
      );

    for (
      const line of body
    ) {
      if (
        y >
        textCanvas.height -
        120
      ) {
        break;
      }

      if (!line) {
        y += 28;
        continue;
      }

      textCtx.fillText(
        line,
        margin,
        y
      );

      y += 51;
    }

    /*
      Image credit
    */

    const image =
      entry.images?.[
      imageIndex
      ];

    if (image?.credit) {
      textCtx.fillStyle =
        "#999";

      textCtx.font =
        '500 22px "Avenir Next", Arial, sans-serif';

      textCtx.fillText(
        `Photo: ${image.credit}`,
        margin,
        textCanvas.height -
        52
      );
    }

    textTexture.needsUpdate =
      true;
  }

  function setGalleryState(
    count,
    activeIndex
  ) {
    const multiple =
      count > 1;

    prev.group.visible =
      multiple;

    next.group.visible =
      multiple;

    dots.clear();

    if (!multiple) {
      return;
    }

    const gap = 0.055;

    const total =
      (count - 1) * gap;

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const dot =
        new THREE.Mesh(
          new THREE.CircleGeometry(
            0.012,
            24
          ),

          new THREE.MeshBasicMaterial(
            {
              color:
                i ===
                  activeIndex
                  ? BLUE
                  : 0xcfcfcf,

              side:
                THREE.DoubleSide,
            }
          )
        );

      dot.position.x =
        i * gap -
        total / 2;

      dots.add(dot);
    }
  }

  clearImage();

  return {
    drawText,
    setImage,
    clearImage,
    setGalleryState,
  };
}

/*
  ==========================================================
  FULL PHOTO VIEWER
  ==========================================================
*/

function createPhotoViewer(
  scene,
  targets,
  renderer,
  camera
) {
  const group =
    new THREE.Group();

  group.visible = false;

  scene.add(group);

  const backdrop =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        5.4,
        3.4
      ),

      new THREE.MeshBasicMaterial(
        {
          color:
            0x111111,

          transparent: true,

          opacity: 0.72,

          side:
            THREE.DoubleSide,

          depthWrite: false,
        }
      )
    );

  backdrop.position.z =
    -0.06;

  group.add(backdrop);

  const material =
    new THREE.MeshBasicMaterial(
      {
        color:
          0xffffff,

        side:
          THREE.DoubleSide,
      }
    );

  const image =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        1,
        1
      ),
      material
    );

  group.add(image);

  const imageHit =
    invisibleHit(
      3.4,
      2.3,
      "close-photo",
      "viewer"
    );

  imageHit.position.z =
    0.03;

  group.add(imageHit);

  targets.push(
    imageHit
  );

  const close =
    createControl(
      "×",
      "close-photo",
      "viewer",
      true
    );

  close.group.position.set(
    2.05,
    1.28,
    0.05
  );

  group.add(
    close.group
  );

  targets.push(
    close.hit
  );

  const prev =
    createControl(
      "←",
      "viewer-prev",
      "viewer",
      true
    );

  prev.group.position.set(
    -2.05,
    0,
    0.05
  );

  group.add(
    prev.group
  );

  targets.push(
    prev.hit
  );

  const next =
    createControl(
      "→",
      "viewer-next",
      "viewer",
      true
    );

  next.group.position.set(
    2.05,
    0,
    0.05
  );

  group.add(
    next.group
  );

  targets.push(
    next.hit
  );

  const caption =
    createTextMesh(
      "",
      {
        fontSize: 29,
        fontWeight: 550,
        color: "#e8e8e8",

        background:
          "rgba(20,20,20,.4)",
      }
    );

  caption.position.set(
    0,
    -1.25,
    0.05
  );

  group.add(
    caption
  );

  let texture = null;

  let token = 0;

  function positionInFront() {
    const xrCamera =
      renderer.xr.getCamera(
        camera
      );

    const position =
      new THREE.Vector3();

    const quaternion =
      new THREE.Quaternion();

    xrCamera.getWorldPosition(
      position
    );

    xrCamera.getWorldQuaternion(
      quaternion
    );

    const forward =
      new THREE.Vector3(
        0,
        0,
        -2.05
      ).applyQuaternion(
        quaternion
      );

    group.position.copy(
      position
    ).add(forward);

    group.quaternion.copy(
      quaternion
    );
  }

  function open() {
    positionInFront();

    group.visible = true;
  }

  function closeViewer() {
    group.visible = false;
  }

  async function setImage(
    imageData,
    activeIndex,
    count
  ) {
    const currentToken =
      ++token;

    try {
      const loaded =
        await new Promise(
          (resolve, reject) => {
            new THREE.TextureLoader()
              .load(
                imageData.src,
                resolve,
                undefined,
                reject
              );
          }
        );

      if (
        currentToken !==
        token
      ) {
        loaded.dispose();
        return;
      }

      loaded.colorSpace =
        THREE.SRGBColorSpace;

      if (texture) {
        texture.dispose();
      }

      texture = loaded;

      material.map =
        loaded;

      material.needsUpdate =
        true;

      const raw =
        loaded.image;

      const aspect =
        raw?.width &&
          raw?.height
          ? raw.width /
          raw.height
          : 1.5;

      const maxWidth =
        3.55;

      const maxHeight =
        2.35;

      let width =
        maxWidth;

      let height =
        width / aspect;

      if (
        height >
        maxHeight
      ) {
        height =
          maxHeight;

        width =
          height * aspect;
      }

      image.scale.set(
        width,
        height,
        1
      );

      imageHit.geometry
        .dispose();

      imageHit.geometry =
        new THREE.PlaneGeometry(
          width,
          height
        );

      const multiple =
        count > 1;

      prev.group.visible =
        multiple;

      next.group.visible =
        multiple;

      updateTextMesh(
        caption,
        `${activeIndex + 1} / ${count}${imageData.credit ? ` · ${imageData.credit}` : ""}`,
        {
          fontSize: 29,

          fontWeight: 550,

          color:
            "#e8e8e8",

          background:
            "rgba(20,20,20,.4)",
        }
      );
    } catch (error) {
      console.warn(
        "Could not load VR viewer image",
        imageData.src,
        error
      );
    }
  }

  return {
    group,
    open,
    close:
      closeViewer,
    setImage,
  };
}

/*
  ==========================================================
  CONTROLS
  ==========================================================
*/

function createControl(
  label,
  action,
  scope = "card",
  dark = false
) {
  const group =
    new THREE.Group();

  const text =
    createTextTexture(
      label,
      {
        fontSize: 66,
        fontWeight: 500,

        color:
          dark
            ? "#ffffff"
            : "#777777",

        background:
          dark
            ? "rgba(20,20,20,.5)"
            : "rgba(252,252,252,.94)",

        paddingX: 27,
        paddingY: 13,
      }
    );

  const mesh =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        text.widthM,
        text.heightM
      ),

      new THREE.MeshBasicMaterial(
        {
          map:
            text.texture,

          transparent: true,

          side:
            THREE.DoubleSide,

          depthWrite: false,
        }
      )
    );

  const hit =
    invisibleHit(
      Math.max(
        0.18,
        text.widthM
      ),

      Math.max(
        0.18,
        text.heightM
      ),

      action,
      scope
    );

  hit.position.z =
    0.02;

  group.add(
    mesh,
    hit
  );

  return {
    group,
    hit,
  };
}

function invisibleHit(
  width,
  height,
  action,
  scope = "card"
) {
  const mesh =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width,
        height
      ),

      new THREE.MeshBasicMaterial(
        {
          transparent: true,
          opacity: 0,

          depthWrite: false,

          side:
            THREE.DoubleSide,
        }
      )
    );

  mesh.userData.action =
    action;

  mesh.userData.scope =
    scope;

  return mesh;
}

/*
  ==========================================================
  TEXT
  ==========================================================
*/

function createTextTexture(
  value,
  {
    fontSize = 58,
    fontWeight = 650,
    color = "#5f5f5f",
    background = null,
    paddingX = 24,
    paddingY = 15,
  } = {}
) {
  const text =
    String(value ?? "");

  const canvas =
    document.createElement(
      "canvas"
    );

  const ctx =
    canvas.getContext(
      "2d"
    );

  ctx.font =
    `${fontWeight} ${fontSize}px "Avenir Next", Arial, sans-serif`;

  const width =
    Math.ceil(
      ctx.measureText(
        text
      ).width
    ) +
    paddingX * 2;

  const height =
    fontSize +
    paddingY * 2;

  canvas.width =
    Math.max(64, width);

  canvas.height =
    Math.max(48, height);

  ctx.font =
    `${fontWeight} ${fontSize}px "Avenir Next", Arial, sans-serif`;

  ctx.textBaseline =
    "middle";

  if (background) {
    ctx.fillStyle =
      background;

    roundedRect(
      ctx,
      0,
      0,
      canvas.width,
      canvas.height,
      8
    );

    ctx.fill();
  }

  ctx.fillStyle =
    color;

  ctx.fillText(
    text,
    paddingX,
    canvas.height / 2
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.minFilter =
    THREE.LinearFilter;

  texture.magFilter =
    THREE.LinearFilter;

  /*
    Physical scale of labels.
  */

  const pixelsPerMeter =
    1020;

  return {
    texture,

    widthM:
      canvas.width /
      pixelsPerMeter,

    heightM:
      canvas.height /
      pixelsPerMeter,
  };
}

function createTextMesh(
  value,
  options
) {
  const data =
    createTextTexture(
      value,
      options
    );

  const material =
    new THREE.MeshBasicMaterial(
      {
        map: data.texture,

        transparent: true,

        side:
          THREE.DoubleSide,

        depthWrite: false,
      }
    );

  const mesh =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        data.widthM,
        data.heightM
      ),
      material
    );

  mesh.userData.textTexture =
    data.texture;

  return mesh;
}

function updateTextMesh(
  mesh,
  value,
  options
) {
  const data =
    createTextTexture(
      value,
      options
    );

  const oldTexture =
    mesh.material.map;

  const oldGeometry =
    mesh.geometry;

  mesh.material.map =
    data.texture;

  mesh.material.needsUpdate =
    true;

  mesh.geometry =
    new THREE.PlaneGeometry(
      data.widthM,
      data.heightM
    );

  if (oldTexture) {
    oldTexture.dispose();
  }

  if (oldGeometry) {
    oldGeometry.dispose();
  }
}

/*
  ==========================================================
  CANVAS HELPERS
  ==========================================================
*/

function roundedRect(
  ctx,
  x,
  y,
  width,
  height,
  radius
) {
  const r =
    Math.min(
      radius,
      width / 2,
      height / 2
    );

  ctx.beginPath();

  ctx.moveTo(
    x + r,
    y
  );

  ctx.arcTo(
    x + width,
    y,
    x + width,
    y + height,
    r
  );

  ctx.arcTo(
    x + width,
    y + height,
    x,
    y + height,
    r
  );

  ctx.arcTo(
    x,
    y + height,
    x,
    y,
    r
  );

  ctx.arcTo(
    x,
    y,
    x + width,
    y,
    r
  );

  ctx.closePath();
}

function cleanText(
  value
) {
  return String(
    value ?? ""
  )
    .replace(
      /<br\s*\/?\s*>/gi,
      "\n"
    )
    .replace(
      /&nbsp;/gi,
      " "
    );
}

function wrapLines(
  ctx,
  value,
  maxWidth
) {
  const text =
    cleanText(value);

  const paragraphs =
    text.split(
      /\n\s*\n/
    );

  const output = [];

  paragraphs.forEach(
    (
      paragraph,
      paragraphIndex
    ) => {
      const explicitLines =
        paragraph.split(
          "\n"
        );

      explicitLines.forEach(
        (explicitLine) => {
          const words =
            explicitLine
              .trim()
              .split(/\s+/)
              .filter(Boolean);

          if (
            !words.length
          ) {
            output.push("");
            return;
          }

          let line = "";

          words.forEach(
            (word) => {
              const candidate =
                line
                  ? `${line} ${word}`
                  : word;

              if (
                ctx.measureText(
                  candidate
                ).width >
                maxWidth &&
                line
              ) {
                output.push(
                  line
                );

                line =
                  word;
              } else {
                line =
                  candidate;
              }
            }
          );

          if (line) {
            output.push(
              line
            );
          }
        }
      );

      if (
        paragraphIndex <
        paragraphs.length -
        1
      ) {
        output.push("");
      }
    }
  );

  return output;
}

function loadImage(src) {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.onload = () =>
        resolve(image);

      image.onerror =
        reject;

      image.src = src;
    }
  );
}

function drawCover(
  ctx,
  image,
  x,
  y,
  width,
  height
) {
  const sourceRatio =
    image.width /
    image.height;

  const targetRatio =
    width / height;

  let sx = 0;
  let sy = 0;
  let sw =
    image.width;
  let sh =
    image.height;

  if (
    sourceRatio >
    targetRatio
  ) {
    sw =
      image.height *
      targetRatio;

    sx =
      (
        image.width -
        sw
      ) / 2;
  } else {
    sh =
      image.width /
      targetRatio;

    sy =
      (
        image.height -
        sh
      ) / 2;
  }

  ctx.drawImage(
    image,
    sx,
    sy,
    sw,
    sh,
    x,
    y,
    width,
    height
  );
}
