// Load votes from LocalStorage or set defaults
let votes = JSON.parse(localStorage.getItem("votes")) || {
    pizza: { up: 0, down: 0 },
    burger: { up: 0, down: 0 },
    salad: { up: 0, down: 0 }
};

// Function to handle voting
function vote(food, change) {
    if (change === 1) {
        votes[food].up += 1;
    } else if (change === -1) {
        votes[food].down += 1;
    }
    localStorage.setItem("votes", JSON.stringify(votes)); // Save votes locally
    updateVotes();
}

// Update displayed votes and reorder items
function updateVotes() {
    const foodContainer = document.getElementById("food-container");
    const foodItems = Array.from(foodContainer.getElementsByClassName("food-item"));

    foodItems.forEach(item => {
        const food = item.getAttribute("data-food");
        const upvotes = votes[food].up;
        const downvotes = votes[food].down;
        const totalVotes = upvotes - downvotes;

        document.getElementById(`${food}-upvotes`).textContent = upvotes;
        document.getElementById(`${food}-downvotes`).textContent = downvotes;
        document.getElementById(`${food}-total`).textContent = totalVotes;
    });

    // Sort food items based on total votes
    foodItems.sort((a, b) => {
        const foodA = a.getAttribute("data-food");
        const foodB = b.getAttribute("data-food");
        const totalA = votes[foodA].up - votes[foodA].down;
        const totalB = votes[foodB].up - votes[foodB].down;
        return totalB - totalA;
    });

    // Reorder food items in the DOM
    foodItems.forEach(item => foodContainer.appendChild(item));
}

// Initialize votes on page load
updateVotes();
