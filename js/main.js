// navigation menu

(() => {
	const hamburgerBtn = document.querySelector(".hamburger-btn"),
		navMenu = document.querySelector(".nav-menu"),
		closeNavBtn = navMenu.querySelector(".close-nav-menu");

	hamburgerBtn.addEventListener("click", showNavMenu);
	closeNavBtn.addEventListener("click", hideNavMenu);

	function showNavMenu() {
		navMenu.classList.add("open");
		bodyscrollingToggle();
	}

	function hideNavMenu() {
		navMenu.classList.remove("open");
		fadeOutEffect();
		bodyscrollingToggle();
	}

	function fadeOutEffect() {
		document.querySelector(".fade-out-effect").classList.add("active");
		setTimeout(() => {
			document.querySelector(".fade-out-effect").classList.remove("active");
		}, 300);
	}

	// Event listener untuk smooth scroll pada klik menu
	// Fungsi untuk memperbarui status menu navigasi
	function updateNavMenuState(targetItem) {
		const activeNav = navMenu.querySelector(".active");
		if (activeNav) {
			activeNav.classList.remove("active", "inner-shadow");
			activeNav.classList.add("outer-shadow", "hover-in-shadow");
		}

		targetItem.classList.remove("outer-shadow", "hover-in-shadow");
		targetItem.classList.add("active", "inner-shadow");
	}

	// Fungsi untuk mengganti URL tanpa memicu loncatan halaman
	function updateURL(hash) {
		history.pushState(null, null, hash);
	}

	// Fungsi untuk menampilkan section yang aktif
	function activateSection(targetSection) {
		// Menyembunyikan section yang aktif sebelumnya
		const activeSection = document.querySelector(".section.active");
		if (activeSection) {
			activeSection.classList.add("hide");
			activeSection.classList.remove("active");
		}

		// Menampilkan section yang baru
		targetSection.classList.add("active");
		targetSection.classList.remove("hide");
	}

	// Fungsi untuk melakukan scroll dengan efek smooth
	function smoothScrollTo(targetSection) {
		window.scrollTo({
			top: targetSection.offsetTop - 70, // Menyesuaikan posisi scroll
			behavior: "smooth",
		});
	}

	// Event listener untuk klik pada link navigasi
	document.addEventListener("click", (event) => {
		if (event.target.classList.contains("link-item")) {
			if (event.target.hash !== "") {
				event.preventDefault();
				const hash = event.target.hash;
				const targetSection = document.querySelector(hash);

				if (targetSection) {
					// Update menu navigasi
					updateNavMenuState(event.target);

					// Jika menu navigasi terbuka, sembunyikan dan tampilkan section yang sesuai
					if (navMenu.classList.contains("open")) {
						fadeOutEffect();
						activateSection(targetSection);
						hideNavMenu();
					} else {
						// Lakukan scroll ke section tanpa efek tambahan
						smoothScrollTo(targetSection);
					}
				}
			}
		}
		if (window.innerWidth < 768) {
			if (event.target.classList.contains("link-item") && event.target.hash === "#about") {
				event.preventDefault();
				const targetSection = document.querySelector("#about");

				if (targetSection) {
					fadeOutEffect();
					activateSection(targetSection);
				}
			}
		}
	});

	// Event listener untuk scroll
	window.addEventListener("scroll", () => {
		let sections = document.querySelectorAll(".section");
		let navItems = navMenu.querySelectorAll(".link-item");

		sections.forEach((section) => {
			const sectionTop = section.offsetTop - 200;  // Mengurangi 200px dari top
			const sectionBottom = sectionTop + section.offsetHeight;

			if (window.scrollY >= sectionTop && window.scrollY <= sectionBottom) {
				// Update menu navigasi untuk menandai section yang aktif
				navItems.forEach((item) => {
					if (item.hash === `#${section.id}`) {
						updateNavMenuState(item); // Update status navigasi

						// Ganti URL dengan hash section yang aktif
						updateURL(`#${section.id}`);
					} else {
						item.classList.remove("active", "inner-shadow");
						item.classList.add("outer-shadow", "hover-in-shadow");
					}
				});
			}
		});
	});
})();

// About Section Tabs

(() => {
	const aboutSection = document.querySelector(".about-section"),
		tabsContainer = document.querySelector(".about-tabs");

	tabsContainer.addEventListener("click", (event) => {
		// if target contain 'tab-item' class and not contains 'active' class
		if (event.target.classList.contains("tab-item") &&
			!event.target.classList.contains("active")) {
			const target = event.target.getAttribute("data-target");
			// deactivate existing active 'tab-item'
			tabsContainer.querySelector(".active").classList.remove("outer-shadow", "active");
			// activate new 'tab-item'
			event.target.classList.add("active", "outer-shadow");
			// deactivate existing active 'tab-content'
			aboutSection.querySelector(".tab-content.active").classList.remove("active");
			// activate new 'tab-content'
			aboutSection.querySelector(target).classList.add("active");
		}
	})
})();

// hide togle while scrolling
function bodyscrollingToggle() {
	document.body.classList.toggle("hidden-scrolling");
}

//  Portfolio filter and popup
(() => {

	const filterContainer = document.querySelector(".portfolio-filter"),
		portfolioItemsContainer = document.querySelector(".portfolio-items"),
		portfolioItems = document.querySelectorAll(".portfolio-item"),
		popup = document.querySelector(".portfolio-popup"),
		prevBtn = document.querySelector(".pp-prev"),
		nextBtn = document.querySelector(".pp-next"),
		closeBtn = document.querySelector(".pp-close"),
		projectDetailsContainer = popup.querySelector(".pp-details"),
		projectDetailsBtn = popup.querySelector(".pp-project-details-btn");
	let itemIndex, slideIndex, screenshots;

	// Filter Portfolio Items
	filterContainer.addEventListener("click", (event) => {
		if (event.target.classList.contains("filter-item") &&
			!event.target.classList.contains("active")) {
			//  deactivate existing active 'filter-item'
			filterContainer.querySelector(".active").classList.remove("outer-shadow", "active");
			// active new 'filter item'
			event.target.classList.add("active", "outer-shadow");
			const target = event.target.getAttribute("data-target");
			portfolioItems.forEach((item) => {
				if (target === item.getAttribute("data-category") || target === 'all') {
					item.classList.remove("hide");
					item.classList.add("show");
				}
				else {
					item.classList.remove("show");
					item.classList.add("hide");
				}
			})
		}
	})

	portfolioItemsContainer.addEventListener("click", (event) => {
		if (event.target.closest(".portfolio-item-inner")) {
			const portfolioItem = event.target.closest(".portfolio-item-inner").parentElement;
			// get the portfoli index
			itemIndex = Array.from(portfolioItem.parentElement.children).indexOf(portfolioItem);
			screenshots = portfolioItems[itemIndex].querySelector(".portfolio-item-img img").getAttribute("data-screenshots");
			// convert screnshot into array
			screenshots = screenshots.split(",");
			if (screenshots.length === 1) {
				prevBtn.style.display = "none";
				nextBtn.style.display = "none";
			}
			else {
				prevBtn.style.display = "block";
				nextBtn.style.display = "block";
			}
			slideIndex = 0;
			popupToggle();
			popupSlideshow();
			popupDetails();
		}
	})

	closeBtn.addEventListener("click", () => {
		popupToggle();
		if (projectDetailsContainer.classList.contains("active")) {
			popupDetailsToggle();
		}
	})

	function popupToggle() {
		popup.classList.toggle("open");
		bodyscrollingToggle();
	}

	function popupSlideshow() {
		const imgSrc = screenshots[slideIndex];
		const popupImg = popup.querySelector(".pp-img");
		// active loader until the popupImg loaded
		popup.querySelector(".pp-loader").classList.add("active");
		popupImg.src = imgSrc;
		popupImg.onload = () => {
			// deactivate loader after the popupImg loaded
			popup.querySelector(".pp-loader").classList.remove("active");
		}
		popup.querySelector(".pp-counter").innerHTML = (slideIndex + 1) + " of " + screenshots.length;
	}

	// next slide
	nextBtn.addEventListener("click", () => {
		if (slideIndex === screenshots.length - 1) {
			slideIndex = 0;
		}
		else {
			slideIndex++;
		}
		popupSlideshow();
	})


	// prev slide
	prevBtn.addEventListener("click", () => {
		if (slideIndex === 0) {
			slideIndex = screenshots.length - 1
		}
		else {
			slideIndex--;
		}
		popupSlideshow();
	})

	function popupDetails() {
		//  if portfolio item details not exists
		if (!portfolioItems[itemIndex].querySelector(".portfolio-item-details")) {
			projectDetailsBtn.style.display = "none";
			return; /* end function exwution*/
		}
		projectDetailsBtn.style.display = "block";
		// get the project details
		const details = portfolioItems[itemIndex].querySelector(".portfolio-item-details").innerHTML;
		// set the project details
		popup.querySelector(".pp-project-details").innerHTML = details;
		// get the project title
		const title = portfolioItems[itemIndex].querySelector(".portfolio-item-title").innerHTML;
		// set the project title
		popup.querySelector(".pp-title h2").innerHTML = title;
		// get the project category
		const category = portfolioItems[itemIndex].getAttribute("data-category")
		// set the project category
		popup.querySelector(".pp-project-category").innerHTML = category.split("-").join(" ");
	}

	projectDetailsBtn.addEventListener("click", () => {
		popupDetailsToggle();
	})

	function popupDetailsToggle() {
		if (projectDetailsContainer.classList.contains("active")) {
			projectDetailsBtn.querySelector("i").classList.remove("fa-minus");
			projectDetailsBtn.querySelector("i").classList.add("fa-plus");
			projectDetailsContainer.classList.remove("active");
			projectDetailsContainer.style.maxHeight = 0 + "px";
		}
		else {
			projectDetailsBtn.querySelector("i").classList.remove("fa-plus");
			projectDetailsBtn.querySelector("i").classList.add("fa-minus");
			projectDetailsContainer.classList.add("active");
			projectDetailsContainer.style.maxHeight = projectDetailsContainer.scrollHeight + "px";
			popup.scrollTo(0, projectDetailsContainer.offsetTop);
		}
	}


})();

// Testimonial Slider

(() => {
	const sliderContainer = document.querySelector(".testi-slider-container"),
		slides = sliderContainer.querySelectorAll(".testi-item");
	slideWidth = sliderContainer.offsetWidth,
		prevBtn = document.querySelector(".testi-slider-nav .prev"),
		nextBtn = document.querySelector(".testi-slider-nav .next"),
		activeSlide = sliderContainer.querySelector(".testi-item.active");
	let slideIndex = Array.from(activeSlide.parentElement.children).indexOf(activeSlide);

	// set  width of all slides
	slides.forEach((slide) => {
		slide.style.width = slideWidth + "px";
	})

	// set width of slidecontainer
	sliderContainer.style.width = slideWidth * slides.length + "px";

	nextBtn.addEventListener("click", () => {
		if (slideIndex === slides.length - 1) {
			slideIndex = 0;
		}
		else {
			slideIndex++;
		}
		slider();
	})

	prevBtn.addEventListener("click", () => {
		if (slideIndex === 0) {
			slideIndex = slides.length - 1;
		}
		else {
			slideIndex--;
		}
		slider();
	})

	function slider() {
		// deactivate existing active slides
		sliderContainer.querySelector(".testi-item.active").classList.remove("active");
		//  activate new slide
		slides[slideIndex].classList.add("active");
		sliderContainer.style.marginLeft = - (slideWidth * slideIndex) + "px";
	}

	slider();

})();

// hide all section exept active

// (() => {
// 	const section = document.querySelectorAll(".section");
// 	section.forEach((section) => {
// 		if (!section.classList.contains("active")) {
// 			section.classList.add("hide");
// 		}
// 	})

// })();

// save change color or mode (dark or light)

window.addEventListener("load", () => {
	// preloader 
	document.querySelector(".preloader").classList.add("fade-out");
	setTimeout(() => {
		document.querySelector(".preloader").style.display = "none";
	}, 600)
})

document.getElementById("contactForm").addEventListener("submit", function (event) {
	event.preventDefault(); // Mencegah form mengirim data secara default

	// Ambil nilai input
	let name = document.querySelector("input[name='name']").value;
	let email = document.querySelector("input[name='email']").value;
	let subject = document.querySelector("input[name='subject']").value;
	let message = document.querySelector("textarea[name='message']").value;

	// Validasi sederhana
	if (!name || !email || !subject || !message) {
		console.log(name, email, subject, message);
		alert("Harap isi semua kolom!");
		return;
	}

	// Format isi email
	let body = `${message}`;

	// Buat link mailto
	let mailtoLink = `mailto:riyandotianto2@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

	// Buka aplikasi email pengguna
	window.location.href = mailtoLink;
});
