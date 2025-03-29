// Load votes from LocalStorage or set defaults
let votes = JSON.parse(localStorage.getItem("votes")) || { pizza: 0, burger: 0, salad: 0 };

// Function to handle voting
function vote(food, change) {
    votes[food] += change;
    localStorage.setItem("votes", JSON.stringify(votes)); // Save votes locally
    updateVotes();
}

// Update displayed votes
function updateVotes() {
    document.getElementById("pizza-votes").textContent = votes.pizza;
    document.getElementById("burger-votes").textContent = votes.burger;
    document.getElementById("salad-votes").textContent = votes.salad;
}

// Initialize votes on page load
updateVotes();
