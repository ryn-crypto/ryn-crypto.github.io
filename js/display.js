// Fungsi untuk memuat data JSON ke dalam elemen HTML
function loadSkills() {
  var skillsContainer = document.querySelector('.skills .row');

  // Bersihkan kontainer sebelum memuat data
  skillsContainer.innerHTML = '';

  // Ambil data JSON menggunakan fetch
  fetch('./js/data/skill.json')
    .then(response => response.json())
    .then(data => {
      console.log(data);
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
        img.dataset.hoverSrc = skill.icon_hover; // Tambahkan atribut data untuk menyimpan URL gambar saat hover
        var h3 = document.createElement('h3');
        h3.textContent = skill.name;

        // Tambahkan event listener untuk hover
        skillItem.addEventListener('mouseenter', function () {
          img.src = img.dataset.hoverSrc; // Mengubah sumber gambar saat mouse masuk
        });

        skillItem.addEventListener('mouseleave', function () {
          img.src = skill.icon; // Mengembalikan sumber gambar ke aslinya saat mouse meninggalkan
        });

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

// Panggil fungsi untuk memuat data saat halaman dimuat
window.onload = function () {
  loadExperience();
  loadSkills();
  loadEducation();
};