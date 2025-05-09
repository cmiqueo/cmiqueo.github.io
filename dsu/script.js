const images = [
  "./images/Jed.png",
  "./images/Carlos.png",
  "./images/Shahbaz.png",
  "./images/Sheridan.png",
  "./images/Gayane.png",
  "./images/Sanjay.png",
  "./images/DJ.png"
];
const userName = document.getElementById("userName");
const imageGrid = document.getElementById("imageGrid");
const selectButton = document.getElementById("selectButton");
const timerDisplay = document.getElementById("timerDisplay");

let timerRunning = false;
const userTimers = [];
let availableImages = [...images];

function init() {
  images.forEach(() => {
    const div = document.createElement("div");
    div.classList.add("imageContainer", "empty");
    imageGrid.appendChild(div);
  });
}

function startMainTimer() {
  timerDisplay.parentElement.classList.add("running");
  const startTimestamp = Date.now();
  const updateMainTimer = () => {
    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  updateMainTimer();
  const mainTimerId = setInterval(updateMainTimer, 1000);
  timerDisplay.dataset.timerId = mainTimerId;
  timerRunning = true;
}

function displaySpeaker(imagePath) {
  const name = imagePath.split("/").pop().split(".")[0];
  userName.textContent = name;
  if (!timerRunning) startMainTimer();
  selectButton.textContent = "Next Speaker";

  const container = document.querySelector("div.imageContainer.empty");
  container.id = name;
  container.classList.remove("empty");
  container.classList.add("selected", "filled");

  const img = document.createElement("img");
  img.src = imagePath;
  img.alt = name;
  img.classList.add("imageItem");

  const timerDiv = document.createElement("div");
  timerDiv.classList.add("timer");
  timerDiv.textContent = "0:00";

  container.appendChild(img);
  container.appendChild(timerDiv);

  // Resume timer on click
  container.addEventListener("click", () => {
    removeSelected();
    container.classList.add("selected");
    const prevTime = userTimers.find(u => u.user === name)?.time || 0;
    const resumeStart = Date.now() - prevTime * 1000;
    const updateResume = () => {
      const elapsed = Math.floor((Date.now() - resumeStart) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      timerDiv.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
    };
    updateResume();
    const resumeId = setInterval(updateResume, 1000);
    container.dataset.timerId = resumeId;
    if (selectButton.textContent === "End Meeting") {
      selectButton.classList.remove("reset");
      selectButton.textContent = "Done!";
    }
  });

  // Remove used image from list
  availableImages = availableImages.filter(p => p !== imagePath);

  // Start new speaker timer
  const start = Date.now();
  const updateTimer = () => {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    timerDiv.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  updateTimer();
  const timerId = setInterval(updateTimer, 1000);
  container.dataset.timerId = timerId;

  if (availableImages.length === 0) {
    selectButton.classList.add("reset");
    selectButton.textContent = "Done!";
  }
}

function removeSelected() {
  const sel = imageGrid.querySelector("div.selected");
  if (!sel) return;
  sel.classList.remove("selected");
  clearInterval(parseInt(sel.dataset.timerId));
  const name = sel.id;
  const time = toSeconds(sel.querySelector(".timer").textContent);
  const idx = userTimers.findIndex(u => u.user === name);
  if (idx !== -1) userTimers[idx].time = time;
  else userTimers.push({ user: name, time });
}

function toSeconds(str) {
  const [m, s] = str.split(":").map(Number);
  return m * 60 + s;
}

function selectRandomImage() {
  removeSelected();
  const idx = Math.floor(Math.random() * availableImages.length);
  displaySpeaker(availableImages[idx]);
}

function endSpeakers() {
  userName.textContent = "Done!";
  selectButton.textContent = "End Meeting";
  imageGrid.classList.add("done");
  removeSelected();
}

function endMeeting() {
  userName.textContent = "Done!";
  selectButton.textContent = "Reset Meeting";
  selectButton.classList.add("reset");
  imageGrid.classList.add("finished");
  removeSelected();
  timerDisplay.parentElement.classList.remove("running");
  if (timerDisplay.dataset.timerId) clearInterval(parseInt(timerDisplay.dataset.timerId));
  timerDisplay.dataset.timerId = null;
  timerRunning = false;
}

function resetMeeting() {
  imageGrid.classList.remove("finished");
  availableImages = [...images];
  clearTimers();
  document.querySelectorAll(".imageContainer").forEach(div => {
    div.classList.remove("selected", "filled");
    div.classList.add("empty");
    div.innerHTML = "";
  });
  selectButton.textContent = "Start Meeting";
  selectButton.classList.remove("reset");
}

function clearTimers() {
  timerDisplay.parentElement.classList.remove("running");
  timerDisplay.textContent = "0:00";
  document.querySelectorAll(".imageContainer").forEach(div => {
    if (div.dataset.timerId) clearInterval(parseInt(div.dataset.timerId));
  });
}

selectButton.addEventListener("click", () => {
  if (availableImages.length > 0) selectRandomImage();
  else if (selectButton.textContent === "Done!") endSpeakers();
  else if (selectButton.textContent === "End Meeting") endMeeting();
  else if (selectButton.textContent === "Reset Meeting") resetMeeting();
});

init();