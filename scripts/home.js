(() => {
  const marquee = document.querySelector(".logo-marquee");
  const track = marquee?.querySelector(".logo-track");
  const firstGroup = track?.querySelector(".logo-group");

  if (!marquee || !track || !firstGroup) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  track.style.animation = "none";
  track.style.animationPlayState = "paused";

  marquee.style.touchAction = "pan-y";

  track.querySelectorAll("img").forEach((image) => {
    image.draggable = false;
  });

  let groupWidth = 0;
  let position = 0;
  let isHeld = false;
  let activePointerId = null;
  let previousTime = performance.now();

  function measure() {
    groupWidth = firstGroup.getBoundingClientRect().width;

    if (!groupWidth) return;

    position = wrap(position);
    draw();
  }

  function wrap(value) {
    if (!groupWidth) return value;

    value %= groupWidth;

    if (value > 0) {
      value -= groupWidth;
    }

    return value;
  }

  function draw() {
    track.style.transform = `translate3d(${position}px, 0, 0)`;
  }

  function getSpeed() {
    const isMobile = window.matchMedia(
      "(max-width: 650px)"
    ).matches;

    const duration = isMobile ? 40000 : 48000;

    return groupWidth / duration;
  }

  function animate(time) {
    const delta = Math.min(
      time - previousTime,
      50
    );

    previousTime = time;

    if (
      !isHeld &&
      !reducedMotion.matches &&
      groupWidth > 0
    ) {
      position -= getSpeed() * delta;
      position = wrap(position);
      draw();
    }

    requestAnimationFrame(animate);
  }

  marquee.addEventListener("pointerdown", (event) => {
    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    isHeld = true;
    activePointerId = event.pointerId;

    try {
      marquee.setPointerCapture(event.pointerId);
    } catch (_) { }
  });

  function release(event) {
    if (
      activePointerId !== null &&
      event.pointerId !== activePointerId
    ) {
      return;
    }

    isHeld = false;

    try {
      if (
        activePointerId !== null &&
        marquee.hasPointerCapture(activePointerId)
      ) {
        marquee.releasePointerCapture(activePointerId);
      }
    } catch (_) { }

    activePointerId = null;
    previousTime = performance.now();
  }

  marquee.addEventListener("pointerup", release);
  marquee.addEventListener("pointercancel", release);

  marquee.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  window.addEventListener("resize", measure);

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(measure);
    observer.observe(firstGroup);
  }

  measure();
  requestAnimationFrame(animate);
})();

const logoMarquee = document.querySelector(".logo-marquee");

if (logoMarquee) {
  logoMarquee.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  logoMarquee.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  logoMarquee.addEventListener("selectstart", (event) => {
    event.preventDefault();
  });
}

