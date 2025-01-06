const imageInput = document.getElementById("imageInput");
const dropZone = document.getElementById("dropZone");
const pipButton = document.getElementById("pipButton");
const slideshow = document.getElementById("slideshow");
const thumbnailPreview = document.getElementById("thumbnailPreview");
const pipStatus = document.getElementById("pipStatus");
const slideshowVideo = document.getElementById("slideshowVideo");

let images = [];
let currentIndex = 0;
let canvas, context, interval;

// Handle file input and drag-and-drop
function handleFiles(files) {
  images = [];
  thumbnailPreview.innerHTML = ""; // Clear thumbnails
  pipStatus.classList.add("hidden"); // Hide PiP status
  slideshow.innerHTML = ""; // Clear slideshow
  for (const file of files) {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        images.push(e.target.result);
        createThumbnail(e.target.result);
        if (images.length === 1) {
          showImage(0); // Show the first image immediately
          setupCanvas();
          pipButton.disabled = false;
        }
      };
      reader.readAsDataURL(file);
    }
  }
}

// Show the image in the slideshow
function showImage(index) {
  currentIndex = index;
  slideshow.innerHTML = ""; // Clear slideshow
  const img = new Image();
  img.src = images[index];
  img.classList.add("active");
  slideshow.appendChild(img);
}

// Create clickable thumbnails
function createThumbnail(src) {
  const img = document.createElement("img");
  img.src = src;
  img.addEventListener("click", () => {
    showImage(images.indexOf(src));
  });
  thumbnailPreview.appendChild(img);
}

// Drag-and-Drop Events
dropZone.addEventListener("click", () => imageInput.click());
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("drag-over");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("drag-over");
  handleFiles(event.dataTransfer.files);
});

// File Input Event
imageInput.addEventListener("change", (event) => handleFiles(event.target.files));

// Setup canvas for PiP
function setupCanvas() {
  canvas = document.createElement("canvas");
  context = canvas.getContext("2d");
  slideshowVideo.srcObject = canvas.captureStream();
  slideshowVideo.play();

  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    const img = new Image();
    img.src = images[currentIndex];
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 350;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    currentIndex = (currentIndex + 1) % images.length; // Move to next image
    showImage(currentIndex);
  }, 4500); // 3-second interval
}

// Handle PiP or Full-Screen
pipButton.addEventListener("click", async () => {
  if ("pictureInPictureEnabled" in document) {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      pipStatus.classList.add("hidden");
    } else {
      try {
        await slideshowVideo.requestPictureInPicture();
        pipStatus.textContent = "Slideshow is shown in PiP.";
        pipStatus.classList.remove("hidden");
      } catch (error) {
        console.error("Error starting PiP:", error);
      }
    }
  } else if ("fullscreenEnabled" in document) {
    // Fallback to full-screen mode for mobile devices
    try {
      await slideshowVideo.requestFullscreen();
      pipStatus.textContent = "Slideshow is shown in Full-Screen mode.";
      pipStatus.classList.remove("hidden");
    } catch (error) {
      console.error("Error starting Full-Screen mode:", error);
    }
  } else {
    alert("Picture-in-Picture and Full-Screen mode are not supported on this device.");
  }
});
