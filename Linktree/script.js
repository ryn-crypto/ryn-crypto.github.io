// loadData.js
const jsonUrl = "data.json";
const cardContainer = document.getElementById("cardContainer");

function fetchDataAndFilter(tag) {
  cardContainer.innerHTML = '';
  fetch(jsonUrl)
    .then((response) => response.json())
    .then((data) => {
      const filteredData = tag.toLowerCase() === 'all' ? data : data.filter(item => item.tag.toLowerCase() === tag);

      for (let i = 0; i < filteredData.length; i += 2) {
        const row = document.createElement("div");
        row.classList.add("row", "mb-3");

        for (let j = i; j < i + 2 && j < filteredData.length; j++) {
          const item = filteredData[j];

          const col = document.createElement("div");
          col.classList.add("col-md-6");

          const card = document.createElement("div");
          card.classList.add("card", "mb-3");

          const link = document.createElement("a");
          link.classList.add("nav-link");
          link.setAttribute("href", item.url);
          link.setAttribute("target", "_blank");

          const cardBody = document.createElement("div");
          cardBody.classList.add("card-body", "d-flex", "align-items-center");

          const img = document.createElement("img");
          img.setAttribute("src", `img/${item.img.toLowerCase()}.png`);
          img.setAttribute("alt", "Image");
          img.setAttribute("width", "50");
          img.setAttribute("height", "50");

          const contentCol = document.createElement("div");
          contentCol.classList.add("col-md-8", "p-0", "ps-4");

          const title = document.createElement("h5");
          title.classList.add("card-title");
          title.textContent = item.title;

          const description = document.createElement("p");
          description.classList.add("card-text");
          description.textContent = item.description;

          const iconCol = document.createElement("div");
          iconCol.classList.add("col-md-2", "d-flex", "justify-content-end");

          const arrowIcon = document.createElement("i");
          arrowIcon.classList.add("fa-solid", "fa-chevron-right");

          cardBody.appendChild(img);
          cardBody.appendChild(contentCol);
          cardBody.appendChild(iconCol);
          contentCol.appendChild(title);
          contentCol.appendChild(description);
          card.appendChild(link);
          link.appendChild(cardBody);
          iconCol.appendChild(arrowIcon);
          col.appendChild(card);
          row.appendChild(col);

          cardContainer.appendChild(row);
        }
      }

    })
    .catch((error) => {
      console.log("Error fetching data:", error);
    });
}


let tag = "all";

function showInitialData() {
  fetchDataAndFilter(tag);
}

function handleNavLinks() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const tagSelect = this.getAttribute('href');
      const cards = document.querySelectorAll('.card');

      // Menghapus class 'active' dari semua elemen
      navLinks.forEach(item => {
        if (!item.classList.contains('title')) {
          item.classList.remove('active');
        }
      });

      // Menambahkan class 'active' pada elemen yang diklik
      this.classList.add('active');

      console.log(tagSelect);

      tag = tagSelect;
      fetchDataAndFilter(tag);
    });
  });
}

showInitialData();
handleNavLinks();