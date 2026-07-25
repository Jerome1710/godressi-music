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
        const subtype = (item.subtype || "").toLowerCase();

        const nameMatch = name
            .split(" ")
            .some(word => word.startsWith(q));

        return (
            nameMatch ||
            category.startsWith(q) ||
            type.startsWith(q) ||
            subtype.startsWith(q)
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

    /*
        Structure:

        grouped
          └── category
                └── type
                      └── subtype
                            └── products
    */

    const grouped = {};

    instruments.forEach(item => {

        const category = item.category || "other";
        const type = item.type || "general";

        /*
            Products without a subtype are placed in a special
            internal group. This means your existing products
            will continue to work.
        */
        const subtype = item.subtype || "__no_subtype__";

        if (!grouped[category]) {
            grouped[category] = {};
        }

        if (!grouped[category][type]) {
            grouped[category][type] = {};
        }

        if (!grouped[category][type][subtype]) {
            grouped[category][type][subtype] = [];
        }

        grouped[category][type][subtype].push(item);
    });


    Object.keys(grouped).forEach(category => {

        const categorySection = document.createElement("section");
        categorySection.className = "category-section";
        categorySection.id = `category-${category}`;


        // MAIN CATEGORY: PIANO, GUITAR, DRUMS...
        const categoryTitle = document.createElement("h2");
        categoryTitle.className = "main-category-title";
        categoryTitle.innerText = category.toUpperCase();

        categorySection.appendChild(categoryTitle);


        Object.keys(grouped[category]).forEach(type => {

            // TYPE: ACOUSTIC, DIGITAL...
            const typeTitle = document.createElement("h3");
            typeTitle.className = "subcategory-title";
            typeTitle.innerText =
                type.charAt(0).toUpperCase() + type.slice(1);

            categorySection.appendChild(typeTitle);


            Object.keys(grouped[category][type]).forEach(subtype => {

                /*
                    Only show a subtype title when the product
                    actually has a subtype.
                */
                if (subtype !== "__no_subtype__") {

                    const subtypeTitle = document.createElement("h4");
                    subtypeTitle.className = "subsubcategory-title";

                    subtypeTitle.innerText =
                        subtype.charAt(0).toUpperCase() +
                        subtype.slice(1);

                    categorySection.appendChild(subtypeTitle);
                }


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


                grouped[category][type][subtype].forEach(item => {

                    const card = document.createElement("div");

                    card.className = "card";

                    card.setAttribute(
                        "data-category",
                        item.category || ""
                    );

                    card.setAttribute(
                        "data-type",
                        item.type || ""
                    );

                    card.setAttribute(
                        "data-subtype",
                        item.subtype || ""
                    );


                    card.onclick = () => openModal(item);


                    card.innerHTML = `

                        <img
                            src="${item.image || ""}"
                            alt="${item.name || "Instrument"}"
                        >

                        <h3>${item.name || ""}</h3>

                        <p>${item.description || ""}</p>


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
                            (
                                item.category === "piano" ||
                                item.category === "drums" ||
                                item.category === "guitar"
                            ) &&
                            item.detailsImage
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


                    // DETAILS BUTTON
                    if (
                        (
                            item.category === "piano" ||
                            item.category === "drums" ||
                            item.category === "guitar"
                        ) &&
                        item.detailsImage
                    ) {

                        const btn = card.querySelector(".details-btn");

                        btn.onclick = event => {

                            event.stopPropagation();

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

    // Clear colors from the previously opened product
    const colorsContainer = document.getElementById("modalColors");
    if (colorsContainer) {
        colorsContainer.innerHTML = "";
    }

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

