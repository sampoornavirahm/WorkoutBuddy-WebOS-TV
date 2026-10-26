const workouts = [
  {
    title: "Feel Good Flow",
    description: "A gentle reset to loosen up and find your focus.",
    duration: "15 min",
    level: "Easy",
    category: "Mobility",
    icon: "◌",
    note: "Breathe deep, move gently, and make it your own."
  },
  {
    title: "Power Circuit",
    description: "A full-body circuit to get your energy moving.",
    duration: "25 min",
    level: "Medium",
    category: "Strength",
    icon: "↗",
    note: "Choose a pace that feels right for you."
  },
  {
    title: "Core & Balance",
    description: "Build a steady center with controlled movement.",
    duration: "20 min",
    level: "Medium",
    category: "Core",
    icon: "◎",
    note: "Control over speed. Your form comes first."
  },
  {
    title: "Quick Cardio",
    description: "A short, upbeat session to lift your heart rate.",
    duration: "12 min",
    level: "Easy",
    category: "Cardio",
    icon: "✳",
    note: "Low-impact options work just as well."
  }
];

const grid = document.querySelector("#workout-grid");
const dialog = document.querySelector("#session-dialog");
const cards = [];
let selectedIndex = 0;
let remainingSeconds = 0;
let timerInterval;
let sessionComplete = false;

function createWorkoutCard(workout, index) {
  const card = document.createElement("button");
  card.className = "workout-card";
  card.type = "button";
  card.setAttribute("aria-label", `${workout.title}, ${workout.duration}, ${workout.level}`);
  card.innerHTML = `
    <span class="card-top">
      <span class="card-index">0${index + 1}</span>
      <span class="card-icon" aria-hidden="true">${workout.icon}</span>
    </span>
    <span class="card-title">${workout.title}</span>
    <span class="card-description">${workout.description}</span>
    <span class="card-bottom"><span>${workout.duration}</span><span>${workout.level}</span></span>
  `;
  card.addEventListener("focus", () => setSelected(index));
  card.addEventListener("click", () => openWorkout(index));
  grid.append(card);
  cards.push(card);
}

function setSelected(index) {
  selectedIndex = (index + cards.length) % cards.length;
  cards.forEach((card, cardIndex) => {
    card.classList.toggle("is-selected", cardIndex === selectedIndex);
  });
}

function openWorkout(index) {
  const workout = workouts[index];
  setSelected(index);
  document.querySelector("#dialog-category").textContent = `${workout.category} SESSION`;
  document.querySelector("#dialog-title").textContent = workout.title;
  document.querySelector("#dialog-description").textContent = workout.description;
  document.querySelector("#dialog-duration").textContent = workout.duration;
  document.querySelector("#dialog-level").textContent = workout.level;
  document.querySelector("#dialog-note").textContent = workout.note;
  const startButton = document.querySelector("#start-button");
  startButton.disabled = false;
  startButton.innerHTML = 'Start session <span aria-hidden="true">→</span>';
  document.querySelector("#session-timer").hidden = true;
  sessionComplete = false;
  dialog.showModal();
  document.querySelector(".dialog-close").focus();
}

function closeWorkout() {
  if (dialog.open) {
    dialog.close();
    cards[selectedIndex].focus();
  }
}

workouts.forEach(createWorkoutCard);
document.querySelector("#workout-count").textContent = String(workouts.length).padStart(2, "0");
document.querySelector(".dialog-close").addEventListener("click", closeWorkout);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeWorkout();
});
dialog.addEventListener("close", () => {
  window.clearInterval(timerInterval);
  cards[selectedIndex].focus();
});
document.querySelector("#start-button").addEventListener("click", () => {
  if (sessionComplete) {
    closeWorkout();
    return;
  }

  if (timerInterval) {
    window.clearInterval(timerInterval);
    timerInterval = undefined;
    closeWorkout();
    return;
  }

  remainingSeconds = Number.parseInt(document.querySelector("#dialog-duration").textContent, 10) * 60;
  const timer = document.querySelector("#session-timer");
  const button = document.querySelector("#start-button");
  timer.hidden = false;
  button.textContent = "Finish session";

  const updateTimer = () => {
    const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
    timer.textContent = `${minutes}:${seconds}`;
    if (remainingSeconds === 0) {
      window.clearInterval(timerInterval);
      timerInterval = undefined;
      sessionComplete = true;
      timer.textContent = "Session complete!";
      button.textContent = "Done";
    }
    remainingSeconds -= 1;
  };

  updateTimer();
  timerInterval = window.setInterval(updateTimer, 1000);
});

document.addEventListener("keydown", (event) => {
  if (dialog.open) {
    if (event.key === "Escape" || event.key === "Backspace") {
      event.preventDefault();
      closeWorkout();
    }
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    setSelected(selectedIndex + 1);
    cards[selectedIndex].focus();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    setSelected(selectedIndex - 1);
    cards[selectedIndex].focus();
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    cards[selectedIndex].focus();
  }
});
