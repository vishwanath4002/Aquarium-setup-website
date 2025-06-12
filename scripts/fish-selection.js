let fishData = [];
let selectedFish = [];
let tankSize = 100;
let remaining = tankSize;

const grid = document.getElementById("fish-grid");
const remDisplay = document.getElementById("remaining-capacity");
const modal = document.getElementById("fish-modal");
const modalContent = document.getElementById("fish-modal-content");

function updateRemaining() {
  const used = selectedFish.reduce((sum, f) => {
    const fish = fishData.find(x => x.name === f.name);
    return sum + (fish ? fish.min_tank_liters * f.count : 0);
  }, 0);
  remaining = tankSize - used;
  remDisplay.textContent = remaining;
}

function showFishModal(fish) {
  modalContent.innerHTML = `
    <button id="close-modal">&times;</button>
    <h2>${fish.name}</h2>
    <img src="${fish.image}" alt="${fish.name}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px;">
    <p><strong>Scientific Name:</strong> ${fish.scientific_name}</p>
    <p><strong>Size:</strong> ${fish.size_cm} cm</p>
    <p><strong>pH Range:</strong> ${fish.pH_range || "N/A"}</p>
    <p><strong>Temperature:</strong> ${fish.temperature || "N/A"}</p>
    <p><strong>Tank Mates:</strong> ${fish.compatible_fish ? fish.compatible_fish.join(", ") : "N/A"}</p>
    <p><strong>Description:</strong> ${fish.description || "No description available."}</p>
  `;
  modal.style.display = "flex";
  document.getElementById("close-modal").onclick = () => {
    modal.style.display = "none";
  };
}

// Hide modal if clicked outside content
window.addEventListener("click", e => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

function renderFishCards(list) {
  grid.innerHTML = "";
  list.forEach(fish => {
    const card = document.createElement("div");
    card.className = "fish-card";
    card.innerHTML = `
      <img src="${fish.image}" alt="${fish.name}">
      <div class="fish-card-content">
        <h3>${fish.name}</h3>
        <p><em>${fish.scientific_name}</em></p>
        <p>Size: ${fish.size_cm} cm • ${fish.expense_level}</p>
        <button onclick="addFish('${fish.name}')">+</button>
        <span id="count-${fish.name}">0</span>
        <button onclick="removeFish('${fish.name}')">–</button>
      </div>`;
    
    card.addEventListener("click", e => {
      if (e.target.tagName.toLowerCase() === "button") return;
      showFishModal(fish);
    });

    grid.appendChild(card);
  });
}

function addFish(name) {
  const fish = fishData.find(f => f.name === name);
  if (!fish) return;

  let entry = selectedFish.find(f => f.name === name);
  if (!entry) {
    entry = { name, count: 0 };
    selectedFish.push(entry);
  }

  if (entry.count >= fish.max_per_tank) {
    alert("Max number for this fish reached.");
    return;
  }

  if (remaining < fish.min_tank_liters) {
    alert("Not enough space in the tank.");
    return;
  }

  entry.count++;
  updateUI(name);
}

function removeFish(name) {
  const entry = selectedFish.find(f => f.name === name);
  if (!entry) return;

  entry.count--;
  if (entry.count <= 0) {
    selectedFish = selectedFish.filter(f => f.name !== name);
  }

  updateUI(name);
}

function updateUI(name) {
  const entry = selectedFish.find(f => f.name === name);
  document.getElementById(`count-${name}`).textContent = entry?.count || 0;
  updateRemaining();
}

async function init() {
  try {
    document.getElementById("tank-size-display").textContent = tankSize;
    const resp = await fetch("../data/fish-data.json");
    if (!resp.ok) throw new Error("Failed to fetch fish data.");
    fishData = await resp.json();
    renderFishCards(fishData.filter(f => f.min_tank_liters <= tankSize));
    updateRemaining();
  } catch (err) {
    console.error("Error initializing:", err);
    grid.innerHTML = `<p style="color:red;">Failed to load fish data. Please check the console and your JSON file.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init();

  // Add event listener for the Reset button
  const resetButton = document.getElementById("reset-filters-button");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      location.reload(); // reloads the page, resetting filters and selections
    });
  }
});

