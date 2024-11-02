let visible = true;

let button = document.getElementById("exampleButton");
button.addEventListener("click", async function () {
  let paragraph = document.getElementById("blue");

  if (visible) {
    paragraph.style.visibility = "hidden";
    visible = false;
  } else {
    paragraph.style.visibility = "visible";
    visible = true;
  }
});

let satelliteButton = document.getElementById("satelliteButton");
satelliteButton.addEventListener("click", async function () {
  const resp = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
  const response = await resp.json();

  document.getElementById(
    "satelliteText"
  ).innerText = `${response.latitude}, ${response.longitude}`;
});
