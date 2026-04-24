const API_URL = "http://localhost:3000/bfhl";

async function submitData() {
    const input = document.getElementById("nodeInput").value;
    const errorBox = document.getElementById("errorBox");
    const resultBox = document.getElementById("resultBox");

    errorBox.innerHTML = "";
    resultBox.innerHTML = "";

    if (!input.trim()) {
        errorBox.innerHTML = "Please enter node relationships.";
        return;
    }

    const dataArray = input
        .split(",")
        .map(item => item.trim())
        .filter(item => item !== "");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: dataArray
            })
        });

        const result = await response.json();

        resultBox.innerHTML = JSON.stringify(result, null, 2);

    } catch (error) {
        errorBox.innerHTML = "Failed to connect to backend API.";
    }
}