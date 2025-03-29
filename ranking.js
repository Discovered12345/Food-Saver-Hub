// Object to store vote counts
let votes = {
    Pasta: 0,
    Salad: 0,
    Pizza: 0
};

// Function to update votes
function updateVotes(meal) {
    votes[meal]++; // Increment vote count
    document.getElementById(meal.toLowerCase() + "Votes").textContent = votes[meal]; // Update UI
    document.getElementById("voteMessage").textContent = `You voted for ${meal}!`;
}

// Add event listeners to buttons
document.querySelectorAll(".voteButton").forEach(button => {
    button.addEventListener("click", function() {
        updateVotes(this.getAttribute("data-meal"));
    });
});
