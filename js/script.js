// =========================================================
// GLOBAL STATE
// =========================================================

let allInstruments = [];
let activeCategory = "all";
let currentSearch = "";
let activeButton = null;

// =========================================================
// LOAD DATA
// =========================================================

fetch('data/instruments.json')
    .then(response => response.json())
    .then(data => {

        allInstruments = data || [];

        applyFilters();

        // AUTO ACTIVATE "ALL" BUTTON
        const allButton = document.querySelector(".categories button");

        if (allButton) {
            allButton.classList.add("active");
            activeButton = allButton;
        }
    })
    .catch(error => {
        console.error("Error loading instruments:", error);
    });

// =========================================================
// CENTRAL FILTER ENGINE
// =========================================================

function applyFilters() {

    let filtered = [...allInstruments];

    // CATEGORY FILTER
    if (activeCategory !== "all") {
        filtered = filtered.filter(item =>
            item.category === activeCategory
        );
    }

    // SEARCH FILTER (FIXED LOGIC)
    if (currentSearch.trim() !== "") {

    const q = currentSearch.toLowerCase().trim();

    filtered = filtered.filter(item => {

        const name = (item.name || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        const type = (item.type || "").toLowerCase();

        const nameMatch = name
            .split(" ")
            .some(word => word.startsWith(q));

        return (
            nameMatch ||
            category.startsWith(q) ||
            type.startsWith(q)
        );
    });
}

    displayInstruments(filtered);
}

// =========================================================
// DISPLAY STREAMING LAYOUT
// =========================================================

function displayInstruments(instruments) {

    const container = document.getElementById("catalogRows");

    container.innerHTML = "";

    if (!instruments || instruments.length === 0) {
        container.innerHTML = `
            <p style="text-align:center; color:#777;">
                No instruments found.
            </p>
        `;
        return;
    }

    const grouped = {};

    instruments.forEach(item => {

        const category = item.category || "other";
        const type = item.type || "general";

        if (!grouped[category]) grouped[category] = {};
        if (!grouped[category][type]) grouped[category][type] = [];

        grouped[category][type].push(item);
    });


    Object.keys(grouped).forEach(category => {

        const categorySection = document.createElement("section");
        categorySection.className = "category-section";

        categorySection.id = `category-${category}`;


        const categoryTitle = document.createElement("h2");
        categoryTitle.className = "main-category-title";
        categoryTitle.innerText = category.toUpperCase();

        categorySection.appendChild(categoryTitle);


        Object.keys(grouped[category]).forEach(type => {

            const subTitle = document.createElement("h3");
            subTitle.className = "subcategory-title";

            subTitle.innerText =
                type.charAt(0).toUpperCase() + type.slice(1);

            categorySection.appendChild(subTitle);


            const rowWrapper = document.createElement("div");
            rowWrapper.className = "row-wrapper";


            const leftBtn = document.createElement("button");
            leftBtn.className = "row-arrow left";
            leftBtn.innerHTML = "‹";


            const rightBtn = document.createElement("button");
            rightBtn.className = "row-arrow right";
            rightBtn.innerHTML = "›";


            const row = document.createElement("div");
            row.className = "row-cards";


            leftBtn.onclick = () => scrollRow(row, -1);
            rightBtn.onclick = () => scrollRow(row, 1);



            grouped[category][type].forEach(item => {


                const card = document.createElement("div");

                card.className = "card";

                card.setAttribute(
                    "data-category",
                    item.category
                );


                card.onclick = () => openModal(item);



                card.innerHTML = `

                    <img src="${item.image}" alt="${item.name}">

                    <h3>${item.name}</h3>

                    <p>${item.description}</p>


                    <div class="colors">

                        <span class="colors-label">
                            Colors:
                        </span>


                        ${
                            item.colors && item.colors.length > 0
                            ?
                            item.colors
                                .map(color =>
                                    `<span class="color-pill">${color}</span>`
                                )
                                .join("")
                            :
                            `<span class="color-pill">N/A</span>`
                        }

                    </div>



                    ${
                        (item.category === "piano" || item.category === "drums" || item.category === "guitar") && item.detailsImage
                        ?
                        `
                        <button class="details-btn">
                            View Details
                        </button>
                        `
                        :
                        ""
                    }

                `;



                // PIANO - GUITAR - DRUMS DETAILS BUTTON ONLY
                if ((item.category === "piano" || item.category === "drums" || item.category === "guitar") && item.detailsImage) {

                    const btn =
                        card.querySelector(".details-btn");


                    btn.onclick = (e) => {

                        e.stopPropagation();

                        openDetailsModal(item);

                    };

                }



                row.appendChild(card);

            });



            rowWrapper.appendChild(leftBtn);

            rowWrapper.appendChild(row);

            rowWrapper.appendChild(rightBtn);


            categorySection.appendChild(rowWrapper);

        });


        container.appendChild(categorySection);

    });

}



// =========================================================
// OPEN PIANO DETAILS IMAGE
// =========================================================

function openDetailsModal(item) {

    document.getElementById("modalImage").src =
        item.detailsImage;


    document.getElementById("modalTitle").innerText =
        item.name;


    document.getElementById("modalDescription").innerText =
        "";


    document.getElementById("productModal")
        .classList.add("active");


    document.body.classList.add("modal-open");

}


/* =========================================================
   ROW ARROWS (HORIZONTAL SCROLL CONTROL)
========================================================= */

function scrollRow(row, direction) {
    const scrollAmount = 300; // adjust speed

    row.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth"
    });
}

// =========================================================
// CATEGORY FILTER
// =========================================================

function filterProducts(category, button) {

    // REMOVE OLD ACTIVE
    if (activeButton) {
        activeButton.classList.remove("active");
    }

    // SET NEW ACTIVE
    if (button) {
        button.classList.add("active");
        activeButton = button;
    }

    activeCategory = category;

    applyFilters();

    /* =========================================
    SCROLL TO SELECTED CATEGORY
    ========================================= */

    setTimeout(() => {

        let target;

        // ALL button
        if (category === "all") {

            target = document.querySelector(".category-section");

        } else {

            target = document.getElementById(
                `category-${category}`
            );
        }

        if (target) {

            window.scrollTo({
                top: target.offsetTop - 375,
                behavior: "smooth"
            });
        }

    }, 50);
}

// =========================================================
// SEARCH FUNCTION 
// =========================================================

function searchInstruments(query) {

    currentSearch = query;

    applyFilters();
}

// =========================================================
// OPEN MODAL
// =========================================================

function openModal(item) {

    document.getElementById("productModal").classList.add("active");

    document.body.classList.add("modal-open");

    document.getElementById("modalImage").src = item.image || "";
    document.getElementById("modalTitle").innerText = item.name || "";
    document.getElementById("modalDescription").innerText = item.description || "";

    const colorsContainer = document.getElementById("modalColors");
    colorsContainer.innerHTML = "";

    if (item.colors && item.colors.length > 0) {

        item.colors.forEach(color => {

            const span = document.createElement("span");
            span.classList.add("color-pill");
            span.innerText = color;

            colorsContainer.appendChild(span);
        });

    } else {
        colorsContainer.innerHTML = "<span class='color-pill'>No colors</span>";
    }
}

// =========================================================
// CLOSE MODAL
// =========================================================

function closeModal() {
    document.getElementById("productModal").classList.remove("active");

    document.body.classList.remove("modal-open");
}

// =========================================================
// CLOSE OUTSIDE CLICK
// =========================================================

window.onclick = function(event) {

    const modal = document.getElementById("productModal");

    if (event.target === modal) {
        closeModal();
    }
};

// =========================================================
// MOBILE MENU
// =========================================================

function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("active");
}

// =========================================================
// ESC KEY
// =========================================================

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closeModal();
});

// =========================================================
// MOBILE MENU TOGGLE
// =========================================================

function toggleMenu() {
    const nav = document.getElementById("navLinks");
    nav.classList.toggle("active");
}

// =========================================================
// AUTO-CLOSE MENU WHEN CLICKING A LINK
// =========================================================

document.querySelectorAll("#navLinks a").forEach(link => {
    link.addEventListener("click", () => {
        document.getElementById("navLinks").classList.remove("active");
    });
});

/* =========================================================
   HERO BUTTON SCROLL
========================================================= */

function scrollToCatalog() {

    const firstCategory =
        document.querySelector(".category-section");

    if (firstCategory) {

        window.scrollTo({
            top: firstCategory.offsetTop - 375,
            behavior: "smooth"
        });
    }
}

