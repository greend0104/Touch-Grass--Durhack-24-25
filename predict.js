const apiBase = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", function() {
    let points = 0;
    const time = new URLSearchParams(window.location.search).get("time")
    const username = new URLSearchParams(window.location.search).get("username")
    setTimeout(async () => {
        const submitRoute = new URL("/submit", apiBase);
        await fetch(submitRoute, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                points,
                username
            })
        });
        window.location.href = "/"
    }, parseInt(time) * 60 * 1000)

    var video = document.getElementById("videoElement");
    var canvas = document.getElementById("canvasElement");
    var photo = document.getElementById("photoElement");
    var captureButton = document.getElementById("captureButton");
    var uploadButton = document.getElementById("uploadButton");
    var generateButton = document.getElementById("generateButton");

    const objectList = ["Hat", "Headphones", "Jacket", "Light switch", "Pen", "Umbrella"];
    let randomItem = null; // Declare randomItem here to make it accessible

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (error) {
                console.log("Something went wrong!", error);
            });
    }

    function capturePhoto() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const photoDataUrl = canvas.toDataURL('image/jpeg');
        photo.src = photoDataUrl;
        photo.style.display = 'block';
    }

    function uploadPhoto() {
        const photoDataUrl = canvas.toDataURL('image/jpeg');
        const blob = dataURLToBlob(photoDataUrl);

        const formData = new FormData();
        formData.append('file', blob, 'photo.jpg');

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            //displayResponse(data);
            compareWithPrediction(data); // Compare after receiving the prediction data
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function dataURLToBlob(dataURL) {
        const parts = dataURL.split(';base64,');
        const byteString = atob(parts[1]);
        const mimeString = parts[0].split(':')[1];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }

    function generateRandomItem() {
        randomItem = objectList[Math.floor(Math.random() * objectList.length)];
        console.log('Generated item:', randomItem);
        alert(`Generated item: ${randomItem}`);
    }

    function compareWithPrediction(predictionData) {
        if (!randomItem) {
            alert('Please generate an item first.');
            return;
        }

        let matchFound = false;

        predictionData.forEach(item => {
            if (item.name === randomItem) {
                matchFound = true;
            }
        });

        if (matchFound) {
            alert(`Match found: ${randomItem}`);
            points++
        } else {
            alert(`No match found for: ${randomItem}`);
        }
    }

    captureButton.addEventListener('click', capturePhoto);
    uploadButton.addEventListener('click', uploadPhoto);
    generateButton.addEventListener('click', generateRandomItem);
});
