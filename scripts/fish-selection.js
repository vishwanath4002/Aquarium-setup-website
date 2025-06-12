let fishData = [];
let selectedFish = [];
//let tankSize = parseInt(localStorage.getItem("selectedTankSize")) || 0;
let tankSize = 100; // Default tank size, can be changed later
let remaining = tankSize;

const grid = document.getElementById("fish-grid");
const remDisplay = document.getElementById("remaining-capacity");



function updateRemaining() {
  const used = selectedFish.reduce((sum, f) => {
    const fish = fishData.find(x => x.name === f.name);
    return sum + (fish ? fish.min_tank_liters * f.count : 0);
  }, 0);
  remaining = tankSize - used;
  remDisplay.textContent = remaining;
}

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
        <p>Size: ${fish.size_cm} cm • $${"$".repeat(fish.size_cm > 7 ? 3 : 1)}</p>
        <div class="extra-info" style="display: none;">
          <p><strong>pH Range:</strong> ${fish.ph_range || "N/A"}</p>
          <p><strong>Temperature:</strong> ${fish.temperature_range || "N/A"}</p>
          <p><strong>Tank Mates:</strong> ${fish.compatible_with ? fish.compatible_with.join(", ") : "N/A"}</p>
          <p><strong>Description:</strong> ${fish.description || "No description."}</p>
        </div>
        <button onclick="addFish('${fish.name}')">+</button>
        <span id="count-${fish.name}">0</span>
        <button onclick="removeFish('${fish.name}')">–</button>
      </div>`;
    
    card.addEventListener("click", e => {
      if (e.target.tagName.toLowerCase() === "button") return;
      const extra = card.querySelector(".extra-info");
      extra.style.display = extra.style.display === "none" ? "block" : "none";
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
  // Optional: re-render fish if filtering is needed
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

// 👇 Ensure DOM is ready before calling init()
document.addEventListener("DOMContentLoaded", init);
