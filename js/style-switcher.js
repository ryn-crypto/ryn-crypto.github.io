// ----------------toggle style switcher ------------------

const styleSwitcherToggler = document.querySelector(".style-switcher-toggler");

styleSwitcherToggler.addEventListener("click", () => {
  document.querySelector(".style-switcher").classList.toggle("open");
});

// hide style switcher on scroll
window.addEventListener("scroll", () => {
  if (document.querySelector(".style-switcher").classList.contains("open")) {
    document.querySelector(".style-switcher").classList.remove("open");
  }
});

//----------------- theme color --------------

const alternateStyles = document.querySelectorAll(".alternate-style");

function setActiveStyle(color) {
  localStorage.setItem("color", color);
  changeColor();
}

function changeColor() {
  alternateStyles.forEach((style) => {
    if (localStorage.getItem("color") === style.getAttribute("title")) {
      style.removeAttribute("disabled");
    } else {
      style.setAttribute("disabled", "true");
    }
  });
}

// cheking if 'color' key exists
if (localStorage.getItem("color") !== null) {
  changeColor();
}

// ------------------- theme light and dark mode ---------------

const dayNight = document.querySelector(".day-night");

dayNight.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
  updateIcon();
});

function themeMode() {
  // cheking if 'theme' key exists
  if (localStorage.getItem("theme") !== null) {
    if (localStorage.getItem("theme") === "light") {
      document.body.classList.remove("dark");
    } else {
      document.body.classList.add("dark");
    }
  }
  updateIcon();
}
themeMode();

function updateIcon() {
  if (document.body.classList.contains("dark")) {
    dayNight.querySelector("i").classList.remove("fa-moon");
    dayNight.querySelector("i").classList.add("fa-sun");
  } else {
    dayNight.querySelector("i").classList.remove("fa-sun");
    dayNight.querySelector("i").classList.add("fa-moon");
  }
}


// ------------------- language mode ---------------

const language = document.querySelector(".language");

language.addEventListener("click", () => {
  document.body.classList.toggle("in");
  if (document.body.classList.contains("in")) {
    localStorage.setItem("language", "in");
  } else {
    localStorage.setItem("language", "en");
  }
  updateIconLang();
});

function languageMode() {
  // cheking if 'language' key exists
  if (localStorage.getItem("language") !== null) {
    if (localStorage.getItem("language") === "in") {
      document.body.classList.remove("en");
    } else {
      document.body.classList.add("en");
    }
  }
  updateIconLang();
}
languageMode();

function updateIconLang() {
  const icon = language.querySelector("i");

  if (document.body.classList.contains("in")) {
    icon.textContent = "in";
  } else {
    icon.textContent = "en";
  }
}

