document.addEventListener("DOMContentLoaded", function() {
    let visible = true;

    let button = document.getElementById("exampleButton");
    if (button) {
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
    }

    let satelliteButton = document.getElementById("satelliteButton");
    if (satelliteButton) {
        satelliteButton.addEventListener("click", async function () {
            const resp = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
            const response = await resp.json();

            document.getElementById(
                "satelliteText"
            ).innerText = `${response.latitude}, ${response.longitude}`;
        });
    }

    let uploadButton = document.getElementById("uploadButton");
    if (uploadButton) {
        uploadButton.addEventListener("click", uploadImage);
    }

    async function uploadImage() {
        console.log("Upload button clicked");
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file first.');
            return;
        }

        console.log("File selected:", file.name);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                body: formData
            });

            console.log("Response received");

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const data = await response.json();
            console.log("Data received:", data);
            displayResponse(data);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    function displayResponse(data) {
        const responseDiv = document.getElementById('response');
        responseDiv.innerHTML = '';

        data.forEach(item => {
            const div = document.createElement('div');
            div.textContent = `${item.name}: ${item.value}`;
            responseDiv.appendChild(div);
        });
    }
});
