let fishData = [];
let selectedFish = [];
const tankSize = parseInt(localStorage.getItem("selectedTankSize"),  10) || 100;
let remaining = tankSize;

const grid = document.getElementById("fish-grid");
const remDisplay = document.getElementById("remaining-capacity");
const modal = document.getElementById("fish-modal");
const modalContent = document.getElementById("fish-modal-content");

function showFishModal(fish) {
  modalContent.innerHTML = `
    <button id="close-modal">&times;</button>
    <h2>${fish.name}</h2>
    <img src="${fish.image}" alt="${fish.name}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px;">
    <p><strong>Scientific Name:</strong> ${fish.scientific_name}</p>
    <p><strong>Size:</strong> ${fish.size_cm} cm</p>
    <p><strong>pH Range:</strong> ${fish.pH_range.join(" - ") || "N/A"}</p>
    <p><strong>Temperature Range:</strong> ${fish.temperature.join(" - ") || "N/A"} °C</p>
    <p><strong>Hardness Range:</strong> ${fish.hardness_range.join(" - ") || "Unknown"} mg/L</p>
    <p><strong>Tank Mates:</strong> ${fish.compatible_fish ? fish.compatible_fish.join(", ") : "N/A"}</p>
    <p><strong>Schooling:</strong> ${fish.schooling?"Yes" : "No" || "Unknown"}</p>
    <p><strong>Compatible Plants:</strong> ${fish.compatible_plants.join(", ") || "Unknown"}</p>
    <p><strong>Max per Tank:</strong> ${fish.max_per_tank}</p>
    <p><strong>Minimum Tank Size:</strong> ${fish.min_tank_liters} L</p>
    <p><strong>Tank Level:</strong> ${fish.tank_level || "Unknown"}</p>
    <p><strong>Flow Preference:</strong> ${fish.flow_preference || "Unknown"}</p>
    <p><strong>Nitrate Sensiticity:</strong> ${fish.nitrate_sensitivity || "Unknown"}</p>
    <p><strong>Light Level:</strong> ${fish.light_level || "Unknown"}</p>
    <p><strong>Food Type:</strong> ${fish.food || "Unknown"}</p>
    <p><strong>Care Level:</strong> ${fish.care_level || "Unknown"}</p>
    <p><strong>Behavior:</strong> ${fish.behavior || "Unknown"}</p>
    <p><strong>Description:</strong> ${fish.description || "No description available."}</p>
  `;
  modal.style.display = "flex";
  document.getElementById("close-modal").onclick = () => {
    modal.style.display = "none";
  };
}


function updateRemaining() {
  let baseMinTank = 0;
  let extraLiters = 0;

  selectedFish.forEach(sel => {
    const fish = fishData.find(f => f.name === sel.name);
    if (!fish) return;

    baseMinTank = Math.max(baseMinTank, fish.min_tank_liters);

    if (fish.schooling) {
      const extraCount = Math.max(0, sel.count - fish.max_per_tank);

      // Use precomputed extra_liters_per_extra_fish if available
      const perFishExtra = fish.extra_liters_per_extra_fish;

      if (perFishExtra != null) {
        extraLiters += extraCount * perFishExtra;
      } else {
        // fallback estimate if not available
        const fallbackLiters = fish.size_cm * 0.5;
        extraLiters += extraCount * fallbackLiters;
      }
    }
  });

  remaining = tankSize - baseMinTank - extraLiters;
  remDisplay.textContent = remaining.toFixed(1);
}

function renderFishCards(list) {
  grid.innerHTML = "";

  updateRemaining(); // update remaining first

  const filteredList = list.filter(fish => {
    // Always show selected fish
    if (selectedFish.some(sel => sel.name === fish.name)) {
      return true;
    }

    // Incompatible with selected?
    for (const sel of selectedFish) {
      const selData = fishData.find(f => f.name === sel.name);
      if (!selData) continue;

      const compatible =
        selData.compatible_fish?.includes(fish.name) &&
        fish.compatible_fish?.includes(selData.name);

      if (!compatible) return false;
    }

    // Skip if this fish's base requirement > remaining
    if (fish.min_tank_liters > remaining) return false;

    return true;
  });

  filteredList.forEach(fish => {
    const card = document.createElement("div");
    card.className = "fish-card";
    card.innerHTML = `
      <img src="${fish.image}" alt="${fish.name}">
      <div class="fish-card-content">
        <h3>${fish.name}</h3>
        <p><em>${fish.scientific_name}</em></p>
        <p>Size: ${fish.size_cm} cm • ${fish.expense_level}</p>
        <button onclick="addFish('${fish.name}')">+</button>
        <span id="count-${fish.name}">${selectedFish.find(f => f.name === fish.name)?.count || 0}</span>
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

  if (entry.count >= fish.max_per_tank && fish.schooling== false){ 
    alert("Max number for this fish reached.");
    return;
  }

  if (remaining < fish.min_tank_liters && entry.count === 0) {
    alert("Not enough space in the tank.");
    return;
  }
  if (remaining < fish.extra_liters_per_extra_fish && entry.count > 0) {
    alert("Not enough space in the tank for this fish.");
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
  const countElement = document.getElementById(`count-${name}`);
  if (countElement) {
    countElement.textContent = entry?.count || 0;
  }
  updateRemaining();
  renderFishCards(fishData);
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

