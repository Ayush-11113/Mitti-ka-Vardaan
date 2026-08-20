const FRAME_COUNT = 200;
const canvas = document.getElementById("plantCanvas");
const context = canvas.getContext("2d", { alpha: false });
const cinematic = document.querySelector(".cinematic");
const growthFill = document.getElementById("growthFill");
const chapterKicker = document.getElementById("chapterKicker");
const chapterTitle = document.getElementById("chapterTitle");
const chapterBody = document.getElementById("chapterBody");

const chapters = [
  {
    at: 0,
    kicker: "Seed",
    title: "A small beginning",
    body: "The idea starts quietly: one address, one call to care for soil, one invitation for a community to participate."
  },
  {
    at: 0.18,
    kicker: "Soil",
    title: "Waste finds purpose",
    body: "Organic waste is reframed as a resource that can feed gardens instead of disappearing into landfills."
  },
  {
    at: 0.36,
    kicker: "Roots",
    title: "People connect",
    body: "Teachers, parents, children, and residents begin to see the same system from different sides."
  },
  {
    at: 0.55,
    kicker: "Care",
    title: "Habits become visible",
    body: "Compost, saplings, and daily sorting turn environmental action into something people can touch and trust."
  },
  {
    at: 0.74,
    kicker: "Community",
    title: "The idea grows outward",
    body: "A shared process becomes a shared identity: practical, proud, and owned by the people using it."
  },
  {
    at: 0.9,
    kicker: "Future",
    title: "A repeatable movement",
    body: "The model can travel to more schools, societies, and student-led teams without losing its human origin."
  }
];

const frames = [];
let loadedFrames = 0;
let currentFrame = 0;
let currentChapter = -1;
let ticking = false;

function framePath(index) {
  return `./assets/frames/frame_${String(index + 1).padStart(3, "0")}.jpg`;
}

function drawCoverImage(image) {
  const canvasRatio = canvas.width / canvas.height;
  const imageRatio = image.width / image.height;
  let drawWidth = canvas.width;
  let drawHeight = canvas.height;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > canvasRatio) {
    drawHeight = canvas.height;
    drawWidth = drawHeight * imageRatio;
    offsetX = (canvas.width - drawWidth) / 2;
  } else {
    drawWidth = canvas.width;
    drawHeight = drawWidth / imageRatio;
    offsetY = (canvas.height - drawHeight) / 2;
  }

  context.fillStyle = "#041010";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * pixelRatio);
  canvas.height = Math.round(window.innerHeight * pixelRatio);
  const image = frames[currentFrame];
  if (image?.complete) {
    drawCoverImage(image);
  }
}

function sequenceProgress() {
  const rect = cinematic.getBoundingClientRect();
  const range = cinematic.offsetHeight - window.innerHeight;
  return range > 0 ? Math.min(Math.max(-rect.top / range, 0), 1) : 0;
}

function updateChapter(progress) {
  let nextChapter = 0;
  for (let index = 0; index < chapters.length; index += 1) {
    if (progress >= chapters[index].at) {
      nextChapter = index;
    }
  }

  if (nextChapter !== currentChapter) {
    currentChapter = nextChapter;
    const chapter = chapters[nextChapter];
    chapterKicker.textContent = chapter.kicker;
    chapterTitle.textContent = chapter.title;
    chapterBody.textContent = chapter.body;
  }
}

function renderFromScroll() {
  ticking = false;
  const progress = sequenceProgress();
  const nextFrame = Math.min(FRAME_COUNT - 1, Math.round(progress * (FRAME_COUNT - 1)));
  const image = frames[nextFrame];

  currentFrame = nextFrame;
  growthFill.style.width = `${progress * 100}%`;
  document.body.dataset.storyStarted = progress > 0.08 ? "true" : "false";
  updateChapter(progress);

  if (image?.complete) {
    drawCoverImage(image);
  }
}

function requestRender() {
  if (!ticking) {
    window.requestAnimationFrame(renderFromScroll);
    ticking = true;
  }
}

function preloadFrames() {
  for (let index = 0; index < FRAME_COUNT; index += 1) {
    const image = new Image();
    image.decoding = "async";
    image.src = framePath(index);
    image.onload = () => {
      loadedFrames += 1;
      if (index === 0 || index === currentFrame) {
        drawCoverImage(image);
      }
      document.body.dataset.loaded = loadedFrames;
    };
    frames.push(image);
  }
}

window.__plantSequenceDebug = {
  frameCount: FRAME_COUNT,
  get currentFrame() {
    return currentFrame + 1;
  },
  get loadedFrames() {
    return loadedFrames;
  },
  get chapter() {
    return chapters[currentChapter]?.kicker || chapters[0].kicker;
  }
};

resizeCanvas();
preloadFrames();
renderFromScroll();

window.addEventListener("resize", () => {
  resizeCanvas();
  requestRender();
});
window.addEventListener("scroll", requestRender, { passive: true });
