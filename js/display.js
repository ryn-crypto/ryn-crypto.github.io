document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector(".nav-menu");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 0) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
});


// typing animation
const texts = ["Program Analis", "Tech Enthusiast", "Android Developer", "Web Developer"];
const typingSpeed = 100;
const eraseSpeed = 50;
let textIndex = 0;
let charIndex = 0;
let isTyping = false;

function typeText() {
  const currentText = texts[textIndex];
  document.getElementById('typing-effect').textContent += currentText[charIndex];
  charIndex++;
  if (charIndex < currentText.length) {
    setTimeout(typeText, typingSpeed);
  } else {
    isTyping = false;
    setTimeout(eraseText, typingSpeed + 1000);
  }
}

function eraseText() {
  const currentText = document.getElementById('typing-effect').textContent;
  if (currentText.length > 0) {
    document.getElementById('typing-effect').textContent = currentText.substring(0, currentText.length - 1);
    setTimeout(eraseText, eraseSpeed);
  } else {
    charIndex = 0;
    textIndex = (textIndex + 1) % texts.length;
    isTyping = true;
    setTimeout(typeText, typingSpeed);
  }
}

function startTypingEffect() {
  if (isTyping) return;
  typeText();
}

// Fungsi untuk memuat data JSON ke dalam elemen HTML
function loadSkills() {
  var skillsContainer = document.querySelector('.skills .row');

  // Bersihkan kontainer sebelum memuat data
  skillsContainer.innerHTML = '';

  // Ambil data JSON menggunakan fetch
  fetch('./js/data/skill.json')
    .then(response => response.json())
    .then(data => {
      // Iterasi melalui setiap objek dalam data JSON
      data.skillsData.forEach(function (skill) {
        // Buat elemen HTML untuk setiap keterampilan
        var skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        var skillItemInner = document.createElement('div');
        skillItemInner.className = 'skill-item-inner outer-shadow';
        var icon = document.createElement('div');
        icon.className = 'icon inner-shadow';
        var img = document.createElement('img');
        img.src = skill.icon;
        img.alt = skill.name;

        var h3 = document.createElement('h3');
        h3.textContent = skill.name;

        // Susun elemen-elemen HTML
        icon.appendChild(img);
        skillItemInner.appendChild(icon);
        skillItemInner.appendChild(h3);
        skillItem.appendChild(skillItemInner);
        skillsContainer.appendChild(skillItem);
      });
    })
    .catch(error => {
      console.error('Error fetching skills data:', error);
    });
}


// Fungsi untuk memuat data JSON ke dalam elemen HTML
function loadExperience() {
  var experienceContainer = document.querySelector('.experience .timeline .row');

  // Bersihkan kontainer sebelum memuat data
  experienceContainer.innerHTML = '';

  // Ambil data JSON menggunakan fetch
  fetch('./js/data/experience.json')
    .then(response => response.json())
    .then(data => {
      // Iterasi melalui setiap objek dalam data JSON
      data.experienceData.forEach(function (exp) {
        // Buat elemen HTML untuk setiap pengalaman
        var timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        var timelineItemInner = document.createElement('div');
        timelineItemInner.className = 'timeline-item-inner outer-shadow';
        var icon = document.createElement('i');
        icon.className = 'fas fa-briefcase icon';
        var dateSpan = document.createElement('span');
        dateSpan.textContent = exp.date;
        var titleH3 = document.createElement('h3');
        titleH3.textContent = exp.title;
        var subTitleH4 = document.createElement('h4');
        subTitleH4.textContent = exp.place;
        var descriptionP = document.createElement('p');
        descriptionP.textContent = exp.description;

        // Susun elemen-elemen HTML
        timelineItemInner.appendChild(icon);
        timelineItemInner.appendChild(dateSpan);
        timelineItemInner.appendChild(titleH3);
        timelineItemInner.appendChild(subTitleH4);
        timelineItemInner.appendChild(descriptionP);
        timelineItem.appendChild(timelineItemInner);
        experienceContainer.appendChild(timelineItem);
      });
    })
    .catch(error => {
      console.error('Error fetching experience data:', error);
    });
}

// education.js

// Fungsi untuk memuat data JSON pendidikan ke dalam elemen HTML
function loadEducation() {
  var educationContainer = document.querySelector('.education .timeline .row');

  // Bersihkan kontainer sebelum memuat data
  educationContainer.innerHTML = '';

  // Ambil data JSON menggunakan fetch
  fetch('./js/data/education.json')
    .then(response => response.json())
    .then(data => {
      // Iterasi melalui setiap objek dalam data JSON
      data.educationData.forEach(function (edu) {
        // Buat elemen HTML untuk setiap pendidikan
        var timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        var timelineItemInner = document.createElement('div');
        timelineItemInner.className = 'timeline-item-inner outer-shadow';
        var icon = document.createElement('i');
        icon.className = 'fas fa-graduation-cap icon';
        var periodSpan = document.createElement('span');
        periodSpan.textContent = edu.period;
        var degreeH3 = document.createElement('h3');
        degreeH3.textContent = edu.degree;
        var institutionH4 = document.createElement('h4');
        institutionH4.textContent = edu.institution;
        var descriptionP = document.createElement('p');
        descriptionP.textContent = edu.description;

        // Susun elemen-elemen HTML
        timelineItemInner.appendChild(icon);
        timelineItemInner.appendChild(periodSpan);
        timelineItemInner.appendChild(degreeH3);
        timelineItemInner.appendChild(institutionH4);
        timelineItemInner.appendChild(descriptionP);
        timelineItem.appendChild(timelineItemInner);
        educationContainer.appendChild(timelineItem);
      });
    })
    .catch(error => {
      console.error('Error fetching education data:', error);
    });
}

// // Fungsi untuk memuat testimoni dari data JSON
// function loadAchievements() {
//   var container = document.querySelector('.testi-slider-container');

//   // Bersihkan kontainer sebelum memuat data
//   container.innerHTML = '';

//   // Ambil data JSON menggunakan fetch
//   fetch('./js/data/achievement.json')
//     .then(response => response.json())
//     .then(data => {
//       // Iterasi melalui setiap testimoni dalam data JSON
//       data.achievements.forEach(function (testimonial, index) {
//         // Buat elemen HTML untuk setiap testimoni
//         var item = document.createElement('div');
//         item.className = 'testi-item' + (index === 0 ? ' active' : '');
//         item.style.width = slideWidth + 'px';

//         var leftQuote = document.createElement('i');
//         leftQuote.className = 'fas fa-quote-left left';

//         var rightQuote = document.createElement('i');
//         rightQuote.className = 'fas fa-quote-right right';

//         var img = document.createElement('img');
//         img.src = testimonial.image;
//         img.alt = 'achievement';

//         var span = document.createElement('span');
//         span.textContent = testimonial.name;

//         // Susun elemen-elemen HTML
//         item.appendChild(leftQuote);
//         item.appendChild(rightQuote);
//         item.appendChild(img);
//         item.appendChild(span);

//         container.appendChild(item);
//       });
//     })
//     .catch(error => {
//       console.error('Error fetching testimonials:', error);
//     });
// }

// Panggil fungsi untuk memuat data saat halaman dimuat
window.onload = function () {
  loadExperience();
  loadSkills();
  loadEducation();
  startTypingEffect();
};
