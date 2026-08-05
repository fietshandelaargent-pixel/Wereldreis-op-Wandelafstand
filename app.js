const openCameraBtn = document.getElementById("openCameraBtn");
const captureBtn = document.getElementById("captureBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");

const startScreen = document.getElementById("startScreen");
const cameraScreen = document.getElementById("cameraScreen");
const resultScreen = document.getElementById("resultScreen");

const video = document.getElementById("video");
const resultImage = document.getElementById("resultImage");
const downloadBtn = document.getElementById("downloadBtn");

let stream;
let currentFacingMode = "environment";

function showScreen(screen) {

  startScreen.classList.remove("active");
  cameraScreen.classList.remove("active");
  resultScreen.classList.remove("active");

  screen.classList.add("active");

}

async function startCamera() {

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: currentFacingMode
    }
  });

  video.srcObject = stream;

}

openCameraBtn.addEventListener("click", async () => {

  showScreen(cameraScreen);

  await startCamera();

});

switchCameraBtn.addEventListener("click", async () => {

  currentFacingMode =
    currentFacingMode === "environment"
      ? "user"
      : "environment";

  await startCamera();

});

captureBtn.addEventListener("click", () => {

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

  ctx.drawImage(
    video,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const overlay = document.getElementById("overlay");

  if (overlay) {
    ctx.drawImage(
      overlay,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  const image = canvas.toDataURL("image/png");

  resultImage.src = image;
  downloadBtn.href = image;

  showScreen(resultScreen);

});

const copyBtn = document.getElementById("copyHashtagsBtn");

if (copyBtn) {
  copyBtn.addEventListener("click", () => {

    navigator.clipboard.writeText(
      "#IedereenVoetganger #WandelenInGent"
    );

    copyBtn.textContent = "✅ Hashtags gekopieerd";

  });
}
