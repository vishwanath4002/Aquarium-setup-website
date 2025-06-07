const slider = document.getElementById("tank-slider");
const image = document.getElementById("tank-image");
const sizeText = document.getElementById("size-value");
const nextBtn = document.getElementById("next-button");

slider.addEventListener("input", function () {
  const size = parseInt(this.value);
  sizeText.textContent = size;

  // Change image size (scale linearly between 100px and 400px)
  const minSize = 10, maxSize = 200;
  const minWidth = 100, maxWidth = 400;
  const newWidth = minWidth + ((size - minSize) / (maxSize - minSize)) * (maxWidth - minWidth);

  image.style.width = `${newWidth}px`;
});

window.onload = () => {
  localStorage.removeItem("selectedFish");
  localStorage.removeItem("selectedPlants");
  localStorage.removeItem("selectedTankSize");
};

nextBtn.addEventListener("click", function () {
  const selectedSize = parseInt(slider.value);
  localStorage.setItem("selectedTankSize", selectedSize);
  window.location.href = "fish-selection.html";
});
