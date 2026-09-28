/* ============================================================
   INSTELLINGEN – hier pas je dingen aan (op één plek)
   ============================================================ */

// Code van je GoatCounter-account (het stukje voor ".goatcounter.com").
// Leeg laten = teller staat uit.  Voorbeeld: "wandelen-gent"
const GOATCOUNTER_CODE = "";

// Link naar jullie website met de andere wereldreis-wandelingen.
// Leeg laten = het zinnetje onderaan wordt niet getoond.
// Voorbeeld: "https://www.mijnwebsite.be"
const MEER_WANDELINGEN_URL = "https://www.stadgent/lateraanvullen.be";

const HASHTAGS = "#IedereenVoetganger #WandelenInGent #MaandVanDeVoetganger";

/* ============================================================ */

const locatie = document.body.dataset.locatie || "hoofdpagina";

const openCameraBtn = document.getElementById("openCameraBtn");
const captureBtn = document.getElementById("captureBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const shareBtn = document.getElementById("shareBtn");
const retakeBtn = document.getElementById("retakeBtn");
const copyBtn = document.getElementById("copyHashtagsBtn");

const startScreen = document.getElementById("startScreen");
const cameraScreen = document.getElementById("cameraScreen");
const resultScreen = document.getElementById("resultScreen");

const video = document.getElementById("video");
const resultImage = document.getElementById("resultImage");
const downloadBtn = document.getElementById("downloadBtn");
const cameraError = document.getElementById("cameraError");
const shareHint = document.getElementById("shareHint");
const moreWalks = document.getElementById("moreWalks");
const moreWalksLink = document.getElementById("moreWalksLink");

let stream;
let currentFacingMode = "environment";
let currentImage = null;

/* ---------- Teller (GoatCounter, geen cookies, geen persoonsgegevens) ---------- */

if (GOATCOUNTER_CODE) {
  const s = document.createElement("script");
  s.async = true;
  s.dataset.goatcounter = "https://" + GOATCOUNTER_CODE + ".goatcounter.com/count";
  s.dataset.goatcounterSettings = '{"no_onload": true}';
  s.src = "https://gc.zgo.at/count.js";
  document.head.appendChild(s);
}

function countPostcard() {
  try {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({
        path: "postkaart-" + locatie,
        title: "Postkaart gemaakt (" + locatie + ")",
        event: true
      });
    }
  } catch (e) { /* de teller mag de app nooit blokkeren */ }
}

/* ---------- Link naar andere wandelingen ---------- */

if (MEER_WANDELINGEN_URL && moreWalks && moreWalksLink) {
  moreWalksLink.href = MEER_WANDELINGEN_URL;
  moreWalksLink.textContent = MEER_WANDELINGEN_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  moreWalks.hidden = false;
}

/* ---------- Schermen & camera ---------- */

function showScreen(screen) {
  startScreen.classList.remove("active");
  cameraScreen.classList.remove("active");
  resultScreen.classList.remove("active");
  screen.classList.add("active");
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}

async function startCamera() {
  stopCamera();

  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: currentFacingMode }
  });

  video.srcObject = stream;
}

async function openCamera() {
  cameraError.hidden = true;
  showScreen(cameraScreen);

  try {
    await startCamera();
  } catch (e) {
    stopCamera();
    showScreen(startScreen);
    cameraError.hidden = false;
  }
}

openCameraBtn.addEventListener("click", openCamera);

switchCameraBtn.addEventListener("click", async () => {
  currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";

  try {
    await startCamera();
  } catch (e) {
    currentFacingMode =
      currentFacingMode === "environment" ? "user" : "environment";
    try { await startCamera(); } catch (e2) { /* niets */ }
  }
});

/* ---------- Foto nemen ---------- */

captureBtn.addEventListener("click", () => {
  if (!video.videoWidth) return; // camera nog niet klaar

  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d");

  const videoRatio = video.videoWidth / video.videoHeight;
  const postcardRatio = 1536 / 1024;

  let sx, sy, sw, sh;

  if (videoRatio > postcardRatio) {
    sh = video.videoHeight;
    sw = sh * postcardRatio;
    sx = (video.videoWidth - sw) / 2;
    sy = 0;
  } else {
    sw = video.videoWidth;
    sh = sw / postcardRatio;
    sx = 0;
    sy = (video.videoHeight - sh) / 2;
  }

  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  const overlay = document.getElementById("overlay");
  if (overlay) {
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
  }

  currentImage = canvas.toDataURL("image/png");

  resultImage.src = currentImage;
  downloadBtn.href = currentImage;
  shareHint.hidden = true;

  stopCamera();
  showScreen(resultScreen);
  countPostcard();
});

/* ---------- Opnieuw ---------- */

retakeBtn.addEventListener("click", openCamera);

/* ---------- Delen ---------- */

if (!navigator.share) {
  shareBtn.hidden = true; // bv. op een computer: dan blijft "Bewaar" over
}

shareBtn.addEventListener("click", async () => {
  if (!currentImage) return;

  try {
    const blob = await (await fetch(currentImage)).blob();
    const file = new File([blob], "groetjes-uit-gent.png", { type: "image/png" });
    const text = "Groetjes uit...Gent? " + HASHTAGS;

    // Hashtags alvast kopiëren: sommige apps (bv. Instagram) nemen de tekst niet over
    try { await navigator.clipboard.writeText(HASHTAGS); } catch (e) {}

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: text, title: "Groetjes uit Gent" });
      shareHint.hidden = false;
    } else {
      downloadBtn.click(); // deelfunctie kan geen afbeeldingen: dan bewaren
    }
  } catch (e) {
    /* gebruiker sloot het deelmenu: geen probleem */
  }
});

/* ---------- Hashtags kopiëren ---------- */

if (copyBtn) {
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(HASHTAGS);
    copyBtn.textContent = "✅ Hashtags gekopieerd";
  });
}
