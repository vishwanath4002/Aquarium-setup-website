const slider = document.getElementById("tank-slider");
const image = document.getElementById("tank-image");
const sizeText = document.getElementById("size-value");

slider.addEventListener("input", function () {
  const size = parseInt(this.value);
  sizeText.textContent = size;

  // Change image size (scale linearly between 100px and 400px)
  const minSize = 10, maxSize = 200;
  const minWidth = 100, maxWidth = 400;
  const newWidth = minWidth + ((size - minSize) / (maxSize - minSize)) * (maxWidth - minWidth);

  image.style.width = `${newWidth}px`;
  const tankSize = localStorage.getItem("selectedTankSize");
});

window.onload = () => {
  localStorage.removeItem("selectedFish");
  localStorage.removeItem("selectedPlants");
  localStorage.removeItem("selectedTankSize");
};

const nextBtn = document.getElementById("next-button");
// Handle "Next" button click
nextBtn.addEventListener("click", function () {
  const selectedSize = parseInt(slider.value);

  // Store in localStorage or send to backend later
  localStorage.setItem("selectedTankSize", selectedSize);

  // Redirect to next page (replace 'fish-selection.html' with your real next step)
  window.location.href = "../html/fish_selection.html";
});