const apiBase = "http://localhost:3000";

async function loadLeaderboard() {
  const leaderboardRoute = new URL("/leaderboard", apiBase);
  const res = await fetch(leaderboardRoute);
  return await res.json();
}

function getLeaderboardRow(username, score) {
  const scoreData = document.createElement("td");
  const userData = document.createElement("td");
  const row = document.createElement("tr");
  scoreData.textContent = score;
  userData.textContent = username;
  row.append(userData, scoreData);
  return row;
}

function populateLeaderboard(leaderboard) {
  const leaderboardRows = leaderboard.map(({ username, score }) =>
    getLeaderboardRow(username, score)
  );
  const leaderboardTbl = document.getElementById("leaderboard");
  leaderboardTbl.append(...leaderboardRows);
}

document.addEventListener("DOMContentLoaded", async () => {
  populateLeaderboard(await loadLeaderboard());
  const startButton = document.getElementById("start");
  startButton.onclick = () => {
    const time = document.getElementById("times").value;
    const name = document.getElementById("name").value;
    if (!name) return alert("Please provide your name!");
    window.location.href =
      "/page2.html?" + new URLSearchParams({ time, username: name }).toString();
  };
});
