const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    console.log("Please select a jpg, gif or png");
    return;
  }

  form.style.display = "block";
  filename.innerText = file.name;
}

// Make sure file is an image
function isFileImage(file) {
  const acceptedImageTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
  ];
  return file && acceptedImageTypes.includes(file["type"]);
}

img.addEventListener("change", loadImage);
