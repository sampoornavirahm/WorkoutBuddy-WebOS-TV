const workouts = [
  {
    id: "feel-good-flow",
    title: "Feel Good Flow",
    description: "A gentle reset to loosen up and find your focus.",
    duration: "15 min",
    level: "Easy",
    category: "Mobility",
    icon: "◌",
    palette: "linear-gradient(145deg, #8278ac 0%, #41415c 55%, #252737 100%)",
    note: "Breathe deep, move gently, and make it your own."
  },
  {
    id: "power-circuit",
    title: "Power Circuit",
    description: "A full-body circuit to get your energy moving.",
    duration: "25 min",
    level: "Medium",
    category: "Strength",
    icon: "↗",
    palette: "linear-gradient(145deg, #cc7553 0%, #754b58 54%, #352d40 100%)",
    note: "Choose a pace that feels right for you."
  },
  {
    id: "core-balance",
    title: "Core & Balance",
    description: "Build a steady center with controlled movement.",
    duration: "20 min",
    level: "Medium",
    category: "Core",
    icon: "◎",
    palette: "linear-gradient(145deg, #4a9a8d 0%, #315d68 53%, #252f42 100%)",
    note: "Control over speed. Your form comes first."
  },
  {
    id: "quick-cardio",
    title: "Quick Cardio",
    description: "A short, upbeat session to lift your heart rate.",
    duration: "12 min",
    level: "Easy",
    category: "Cardio",
    icon: "✳",
    palette: "linear-gradient(145deg, #d39c51 0%, #9d644f 54%, #44334b 100%)",
    note: "Low-impact options work just as well."
  }
];

const routines = [
  {
    title: "A gentler start",
    description: "Ease into your day with a little mobility, followed by a steady core session.",
    workoutIndexes: [0, 2],
    icon: "☼",
    duration: "35 min",
    palette: "linear-gradient(145deg, #766e9d, #b38c72)"
  },
  {
    title: "Strength, your way",
    description: "Build a full-body rhythm with an energizing circuit and a balanced finish.",
    workoutIndexes: [1, 2],
    icon: "↗",
    duration: "45 min",
    palette: "linear-gradient(145deg, #b8664f, #665576)"
  },
  {
    title: "A quick reset",
    description: "A short cardio burst and a moment to slow down and reset.",
    workoutIndexes: [3, 0],
    icon: "✳",
    duration: "27 min",
    palette: "linear-gradient(145deg, #b98c47, #579086)"
  }
];

const pageContent = document.querySelector("#page-content");
const dialog = document.querySelector("#session-dialog");
const navigationItems = [...document.querySelectorAll(".nav-item")];
const savedIds = new Set(JSON.parse(localStorage.getItem("workout-buddy-saved") || "[]"));
const cards = [];
const lastMainFocus = {};
let activePage = "home";
let lastFocusedElement;
let selectedIndex = 0;
let remainingSeconds = 0;
let timerInterval;
let sessionComplete = false;
let sessionActive = false;

const pageMessages = {
  search: "Find a session that feels right.",
  home: "A little movement goes a long way.",
  routines: "A good rhythm, one step at a time.",
  library: "Your saved sessions, all in one place.",
  settings: "Make your space feel like yours."
};

function setPage(name, shouldFocus = true) {
  activePage = name;
  navigationItems.forEach((item) => {
    const isCurrent = item.dataset.page === name;
    item.classList.toggle("is-active", isCurrent);
    item.setAttribute("aria-current", isCurrent ? "page" : "false");
  });
  document.querySelector("#topbar-message").textContent = pageMessages[name];
  renderPage();
  if (shouldFocus) {
    const firstControl = pageContent.querySelector("input, button");
    (firstControl || pageContent).focus();
  }
}

function pageHeading(title, description, eyebrow = "YOUR WORKOUT SPACE") {
  return `
    <header class="page-heading">
      <p class="eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
      <p class="page-description">${description}</p>
    </header>
  `;
}

function createWorkoutCard(workout, index) {
  const card = document.createElement("button");
  card.className = "workout-card";
  card.type = "button";
  card.style.setProperty("--card-gradient", workout.palette);
  card.setAttribute("aria-label", `${workout.title}, ${workout.duration}, ${workout.level}`);
  card.innerHTML = `
    <span class="card-index">0${index + 1}</span>
    <span class="card-art" aria-hidden="true">${workout.icon}</span>
    <span class="card-category">${workout.category}</span>
    <span class="card-title">${workout.title}</span>
    <span class="card-description">${workout.description}</span>
    <span class="card-bottom"><span>${workout.duration}</span><span>${workout.level}</span></span>
  `;
  card.addEventListener("click", () => openWorkout(workout));
  return card;
}

function addWorkoutCards(container, workoutList) {
  cards.length = 0;
  container.innerHTML = "";
  if (workoutList.length === 0) {
    container.innerHTML = '<p class="empty-state">No sessions here yet. Try a different search or save a workout from its details.</p>';
    return;
  }
  workoutList.forEach((workout) => {
    const index = workouts.indexOf(workout);
    const card = createWorkoutCard(workout, index);
    container.append(card);
    cards.push(card);
  });
  selectedIndex = 0;
}

function renderHome() {
  pageContent.innerHTML = `
    <section class="hero" aria-labelledby="welcome-title">
      <div class="hero-orbit" aria-hidden="true"></div>
      <div class="hero-art-label" aria-hidden="true">01</div>
      <div class="hero-copy">
        <p class="eyebrow">YOUR LIVING ROOM. YOUR TRAINING GROUND.</p>
        <h1 id="welcome-title">Make today<br>count<span>.</span></h1>
        <p class="hero-description">Pick a session, find your rhythm, and feel good doing it.</p>
        <div class="hero-actions">
          <button class="primary-button" type="button" id="featured-workout">
            <span class="play-icon" aria-hidden="true">▶</span> Explore workouts
          </button>
          <span class="remote-hint">Press OK to select</span>
        </div>
      </div>
    </section>
    <section class="content-section" aria-labelledby="sessions-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">PICK UP WHERE YOU ARE</p>
          <h2 id="sessions-title">Made for today</h2>
        </div>
        <button class="section-link" type="button" data-open-page="routines">See all routines <span aria-hidden="true">→</span></button>
      </div>
      <div class="workout-grid" id="workout-grid" aria-label="Available workout sessions"></div>
    </section>
    <footer class="footer">SMALL STEPS. STRONGER DAYS.</footer>
  `;
  addWorkoutCards(document.querySelector("#workout-grid"), workouts);
  document.querySelector("#featured-workout").addEventListener("click", () => openWorkout(workouts[0]));
  document.querySelector("[data-open-page]").addEventListener("click", () => setPage("routines"));
}

function renderSearch() {
  pageContent.innerHTML = `
    ${pageHeading("Find your flow", "Search sessions by name, mood, or movement.", "SEARCH")}
    <label class="search-field">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4"></circle><path d="m16 16 4.2 4.2"></path></svg>
      <input id="workout-search" type="search" placeholder="Try “cardio” or “easy”" autocomplete="off" aria-label="Search workouts">
    </label>
    <section class="content-section" aria-labelledby="search-results-title">
      <div class="section-heading">
        <div><p class="eyebrow">READY WHEN YOU ARE</p><h2 id="search-results-title">All sessions</h2></div>
      </div>
      <div class="workout-grid" id="workout-grid" aria-label="Search results"></div>
    </section>
  `;
  const searchInput = document.querySelector("#workout-search");
  const results = document.querySelector("#workout-grid");
  const updateResults = () => {
    const query = searchInput.value.trim().toLowerCase();
    const matching = workouts.filter((workout) => [
      workout.title,
      workout.description,
      workout.category,
      workout.level,
      workout.duration
    ].some((value) => value.toLowerCase().includes(query)));
    document.querySelector("#search-results-title").textContent = query ? `${matching.length} ${matching.length === 1 ? "result" : "results"}` : "All sessions";
    addWorkoutCards(results, matching);
  };
  searchInput.addEventListener("input", updateResults);
  updateResults();
}

function renderRoutines() {
  pageContent.innerHTML = `
    ${pageHeading("Routines for real life", "A few thoughtful ways to make time for yourself.", "YOUR ROUTINES")}
    <div class="routine-list" aria-label="Workout routines">
      ${routines.map((routine, index) => `
        <button class="routine-card" type="button" data-routine="${index}" aria-label="${routine.title}, ${routine.duration}">
          <span class="routine-art" style="--routine-gradient: ${routine.palette}" aria-hidden="true">${routine.icon}</span>
          <span class="routine-copy">
            <span class="routine-meta">ROUTINE 0${index + 1} · ${routine.duration}</span>
            <h2>${routine.title}</h2>
            <p>${routine.description}</p>
            <span class="routine-meta">${routine.workoutIndexes.length} sessions</span>
          </span>
          <span class="routine-arrow" aria-hidden="true">→</span>
        </button>
      `).join("")}
    </div>
  `;
  pageContent.querySelectorAll("[data-routine]").forEach((button) => {
    button.addEventListener("click", () => {
      const routine = routines[Number(button.dataset.routine)];
      openWorkout(workouts[routine.workoutIndexes[0]]);
    });
  });
}

function renderLibrary() {
  pageContent.innerHTML = `
    ${pageHeading("Your library", "The sessions you’ve saved for another day.", "SAVED FOR YOU")}
    <section class="content-section" aria-labelledby="library-title">
      <div class="section-heading">
        <div><p class="eyebrow">YOUR PERSONAL COLLECTION</p><h2 id="library-title">Saved sessions</h2></div>
        <p class="setting-value">${savedIds.size} SAVED</p>
      </div>
      <div class="workout-grid" id="workout-grid" aria-label="Saved workouts"></div>
    </section>
  `;
  addWorkoutCards(
    document.querySelector("#workout-grid"),
    workouts.filter((workout) => savedIds.has(workout.id))
  );
}

function renderSettings() {
  pageContent.innerHTML = `
    ${pageHeading("Make it your own", "A couple of ways to make your time here feel just right.", "SETTINGS")}
    <div class="settings-list" aria-label="App settings">
      <button class="setting-row" type="button" role="switch" aria-checked="${document.body.classList.contains("high-contrast")}" data-setting="high-contrast">
        <span class="setting-copy"><strong>Higher contrast</strong><span>Make text and focus states easier to see.</span></span>
        <span class="setting-switch" aria-hidden="true"></span>
      </button>
      <button class="setting-row" type="button" role="switch" aria-checked="${document.body.classList.contains("reduced-motion")}" data-setting="reduced-motion">
        <span class="setting-copy"><strong>Reduce motion</strong><span>Use gentler movement as you browse.</span></span>
        <span class="setting-switch" aria-hidden="true"></span>
      </button>
      <div class="setting-row" aria-label="Remote navigation help">
        <span class="setting-copy"><strong>TV remote</strong><span>Use the directional pad to browse and OK to select.</span></span>
        <span class="setting-value">READY</span>
      </div>
    </div>
  `;
  pageContent.querySelectorAll("[data-setting]").forEach((button) => {
    button.addEventListener("click", () => {
      const setting = button.dataset.setting;
      const enabled = button.getAttribute("aria-checked") !== "true";
      button.setAttribute("aria-checked", String(enabled));
      document.body.classList.toggle(setting, enabled);
      localStorage.setItem(`workout-buddy-${setting}`, String(enabled));
    });
  });
}

function renderPage() {
  cards.length = 0;
  switch (activePage) {
    case "search":
      renderSearch();
      break;
    case "routines":
      renderRoutines();
      break;
    case "library":
      renderLibrary();
      break;
    case "settings":
      renderSettings();
      break;
    default:
      renderHome();
  }
}

function openWorkout(workout) {
  lastFocusedElement = document.activeElement;
  selectedIndex = Math.max(0, workouts.indexOf(workout));
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
  updateSaveButton(workout);
  sessionComplete = false;
  sessionActive = false;
  window.clearInterval(timerInterval);
  timerInterval = undefined;
  dialog.showModal();
  document.querySelector(".dialog-close").focus();
}

function updateSaveButton(workout) {
  const button = document.querySelector("#save-button");
  const isSaved = savedIds.has(workout.id);
  button.setAttribute("aria-pressed", String(isSaved));
  button.innerHTML = `${isSaved ? "♥" : "♡"} <span>${isSaved ? "Saved" : "Save"}</span>`;
}

function closeWorkout() {
  if (dialog.open) dialog.close();
}

function focusInDirection(origin, direction, candidates) {
  const originRect = origin.getBoundingClientRect();
  const originX = originRect.left + originRect.width / 2;
  const originY = originRect.top + originRect.height / 2;
  const eligible = candidates
    .filter((candidate) => candidate !== origin && candidate.getClientRects().length > 0)
    .map((candidate) => {
      const rect = candidate.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const primary = direction === "left" ? originX - x
        : direction === "right" ? x - originX
          : direction === "up" ? originY - y : y - originY;
      if (primary <= 0) return null;
      const secondary = direction === "left" || direction === "right"
        ? Math.abs(y - originY)
        : Math.abs(x - originX);
      return { candidate, score: primary + secondary * 2.4 };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score);
  if (eligible.length) {
    eligible[0].candidate.focus();
    return true;
  }
  return false;
}

function focusPageControl(preferSearch = false) {
  const savedFocus = lastMainFocus[activePage];
  if (savedFocus && savedFocus.isConnected && pageContent.contains(savedFocus)) {
    savedFocus.focus();
    return;
  }
  const controls = [...pageContent.querySelectorAll("input, button")];
  const firstVisible = controls.find((control) => control.getClientRects().length > 0);
  const search = preferSearch ? pageContent.querySelector("#workout-search") : null;
  (search || firstVisible || pageContent).focus();
}

function remoteKey(event) {
  if (event.key && event.key !== "Unidentified") {
    const aliases = {
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      GoBack: "Back",
      BrowserBack: "Back",
      XF86Back: "Back",
      OK: "Enter",
      Ok: "Enter",
      Select: "Enter"
    };
    return aliases[event.key] || event.key;
  }
  const keyCodes = {
    8: "Backspace",
    13: "Enter",
    23: "Enter",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    461: "Back",
    10009: "Back"
  };
  return keyCodes[event.keyCode] || "";
}

function isBackKey(event) {
  const key = event.key;
  const keyCode = event.keyCode || event.which;
  if (key === "Back" || key === "GoBack" || key === "BrowserBack" || key === "XF86Back" || key === "Escape") {
    return true;
  }
  if (keyCode === 461 || keyCode === 10009 || keyCode === 166) {
    return true;
  }
  return key === "Backspace" && !document.activeElement.matches("input");
}

function handleBackKey(event) {
  if (!isBackKey(event)) return;

  if (event.key === "Backspace" && document.activeElement.matches("input")) return;
  if (!dialog.open && activePage === "home") {
    if (window.confirm("Do you want to exit Workout Buddy?")) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if (dialog.open) {
    closeWorkout();
  } else {
    setPage("home");
    navigationItems.find((item) => item.dataset.page === "home").focus();
  }
}

if (localStorage.getItem("workout-buddy-high-contrast") === "true") {
  document.body.classList.add("high-contrast");
}
if (localStorage.getItem("workout-buddy-reduced-motion") === "true") {
  document.body.classList.add("reduced-motion");
}

navigationItems.forEach((item, index) => {
  item.addEventListener("click", () => setPage(item.dataset.page, false));
});

document.querySelector("[data-nav-home]").addEventListener("click", (event) => {
  event.preventDefault();
  setPage("home");
});
document.querySelector(".dialog-close").addEventListener("click", closeWorkout);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeWorkout();
});
dialog.addEventListener("close", () => {
  window.clearInterval(timerInterval);
  timerInterval = undefined;
  sessionActive = false;
  if (lastFocusedElement && lastFocusedElement.isConnected) lastFocusedElement.focus();
});
document.addEventListener("focusin", (event) => {
  if (pageContent.contains(event.target)) {
    lastMainFocus[activePage] = event.target;
  }
});
document.querySelector("#save-button").addEventListener("click", () => {
  const workout = workouts[selectedIndex];
  if (savedIds.has(workout.id)) {
    savedIds.delete(workout.id);
  } else {
    savedIds.add(workout.id);
  }
  localStorage.setItem("workout-buddy-saved", JSON.stringify([...savedIds]));
  updateSaveButton(workout);
});
document.querySelector("#start-button").addEventListener("click", () => {
  if (sessionComplete) {
    closeWorkout();
    return;
  }
  if (sessionActive) {
    closeWorkout();
    return;
  }

  remainingSeconds = Number.parseInt(document.querySelector("#dialog-duration").textContent, 10) * 60;
  const timer = document.querySelector("#session-timer");
  const button = document.querySelector("#start-button");
  timer.hidden = false;
  button.textContent = "Finish session";
  sessionActive = true;

  const updateTimer = () => {
    const minutes = ("0" + Math.floor(remainingSeconds / 60)).slice(-2);
    const seconds = ("0" + (remainingSeconds % 60)).slice(-2);
    timer.textContent = `${minutes}:${seconds}`;
    if (remainingSeconds === 0) {
      window.clearInterval(timerInterval);
      timerInterval = undefined;
      sessionActive = false;
      sessionComplete = true;
      timer.textContent = "Session complete!";
      button.textContent = "Done";
      return;
    }
    remainingSeconds -= 1;
  };

  updateTimer();
  timerInterval = window.setInterval(updateTimer, 1000);
});

window.addEventListener("keydown", handleBackKey, true);

document.addEventListener("keydown", (event) => {
  const key = remoteKey(event);
  if (dialog.open) {
    if (key === "Enter" && document.activeElement.matches("button")) {
      event.preventDefault();
      document.activeElement.click();
      return;
    }
    if (key.indexOf("Arrow") === 0) {
      const controls = [...dialog.querySelectorAll("button:not(:disabled)")];
      if (focusInDirection(document.activeElement, key.slice(5).toLowerCase(), controls)) {
        event.preventDefault();
      }
    }
    return;
  }

  const navIndex = navigationItems.indexOf(document.activeElement);
  if (key === "Enter" && navIndex >= 0) {
    event.preventDefault();
    setPage(navigationItems[navIndex].dataset.page, false);
    focusPageControl(activePage === "search");
    return;
  }

  if (key === "Enter" && document.activeElement.matches("button")) {
    event.preventDefault();
    document.activeElement.click();
    return;
  }

  if (key.indexOf("Arrow") !== 0) return;
  const direction = key.slice(5).toLowerCase();
  if (navIndex >= 0) {
    if (direction === "up" || direction === "down") {
      event.preventDefault();
      const offset = direction === "down" ? 1 : -1;
      navigationItems[(navIndex + offset + navigationItems.length) % navigationItems.length].focus();
    } else if (direction === "right") {
      event.preventDefault();
      if (navigationItems[navIndex].dataset.page !== activePage) {
        setPage(navigationItems[navIndex].dataset.page, false);
      }
      focusPageControl(activePage === "search");
    }
    return;
  }

  const activeElement = document.activeElement;
  const isTextInput = activeElement.matches("input");
  if (isTextInput && (direction === "left" || direction === "right")) {
    return;
  }

  if (isTextInput && direction === "up") {
    event.preventDefault();
    navigationItems.find((item) => item.dataset.page === activePage).focus();
    return;
  }

  if (isTextInput && direction === "down") {
    event.preventDefault();
    if (cards.length) cards[0].focus();
    return;
  }

  const mainControls = [...pageContent.querySelectorAll("input, button")];
  if (!focusInDirection(activeElement, direction, mainControls)) {
    if (direction === "left") {
      navigationItems.find((item) => item.dataset.page === activePage).focus();
    } else if (direction === "down" && isTextInput && cards.length) {
      cards[0].focus();
    }
  }
  event.preventDefault();
});

setPage("home", false);
navigationItems.find((item) => item.dataset.page === "home").focus();
