/* ----------------------------------------------------
   ASSET DATABASE
   ---------------------------------------------------- */
const db = {
    elements: {
        red: "https://imgur.com/Qq0sEsV.png",
        blue: "https://i.imgur.com/A1mjmm2.png",
        purple: "https://i.imgur.com/Wfne7SR.png",
        green: "https://i.imgur.com/jiCg0Co.png",
        yellow: "https://i.imgur.com/99Kovhb.png"
    },
    gradients: {
        red: "url('https://i.imgur.com/a51fStC.png')",
        blue: "url('https://i.imgur.com/wxeW5z5.png')",
        purple: "url('https://i.imgur.com/wj7im8E.png')",
        green: "url('https://i.imgur.com/SiEtAuy.png')",
        yellow: "url('https://i.imgur.com/ZPJQxHl.png')"
    },
    borders: {
        red: "border-red",
        blue: "border-blu",
        purple: "border-pur",
        green: "border-grn",
        yellow: "border-yel"
    },
    tags: {
        ultra: "https://i.imgur.com/UvO3qhj.png"
    }
};

/* ----------------------------------------------------
   AUTOMATION LOGIC
   ---------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll('.char-card');

    items.forEach(card => {
        // 1. Get Data from HTML Attributes
        const name = card.getAttribute('data-name');
        const el = card.getAttribute('data-element'); // red, blue, etc
        const rar = card.getAttribute('data-rarity'); // ultra, etc

        // 2. Add Name Bar (Top)
        if(name) {
            const nameDiv = document.createElement('div');
            nameDiv.className = 'char-name-bar';
            nameDiv.innerText = name;
            card.appendChild(nameDiv);
        }

        // 3. Add Element Icon & Background Logic
        if(el && db.elements[el]) {
            // Add Icon
            const iconImg = document.createElement('img');
            iconImg.src = db.elements[el];
            iconImg.className = 'element-icon-img';
            card.appendChild(iconImg);

            // Add Gradient Background (Bottom)
            const gradDiv = document.createElement('div');
            gradDiv.className = 'gradient-overlay';
            gradDiv.style.backgroundImage = db.gradients[el];
            card.appendChild(gradDiv);

            // Add Border Class
            if(db.borders[el]) {
                card.classList.add(db.borders[el]);
            }
        }

        // 4. Add Rarity Tag (Ultra)
        if(rar === 'ultra' && db.tags.ultra) {
            const tagImg = document.createElement('img');
            tagImg.src = db.tags.ultra;
            tagImg.className = 'ul-tag';
            card.appendChild(tagImg);
        }
    });
});

/* ----------------------------------------------------
   SEARCH LOGIC
   ---------------------------------------------------- */
document.getElementById('searchInput').addEventListener('keyup', function() {
  let filter = this.value.toLowerCase();
  let cols = document.querySelectorAll('.char-item');

  cols.forEach(function(col) {
    let card = col.querySelector('.char-card');
    if(card) {
        let name = card.getAttribute('data-name').toLowerCase();
        if (name.includes(filter)) {
          col.style.display = ''; // Show
        } else {
          col.style.display = 'none'; // Hide
        }
    }
  });
});