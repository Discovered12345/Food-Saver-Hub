document.addEventListener("DOMContentLoaded", function () {
    let votes = JSON.parse(localStorage.getItem("votes")) || {
        pizza: { upvotes: 0, downvotes: 0, total: 0 },
        burger: { upvotes: 0, downvotes: 0, total: 0 },
        salad: { upvotes: 0, downvotes: 0, total: 0 }
    };

    // Function to update the UI with the latest vote counts
    function updateUI() {
        Object.keys(votes).forEach(food => {
            document.getElementById(`${food}-upvotes`).textContent = votes[food].upvotes;
            document.getElementById(`${food}-downvotes`).textContent = votes[food].downvotes;
            document.getElementById(`${food}-total`).textContent = votes[food].total;
        });

        sortFoodItems();
    }

    // Function to handle the vote logic
function vote(food, value) {
    // Ensure upvotes, downvotes, and total are initialized correctly
    if (!votes[food]) {
        votes[food] = { upvotes: 0, downvotes: 0, total: 0 };
    }

    if (value === 1) {
        votes[food].upvotes = (votes[food].upvotes || 0) + 1;
    } else {
        votes[food].downvotes = (votes[food].downvotes || 0) + 1;
    }

    votes[food].total = votes[food].upvotes - votes[food].downvotes;
    localStorage.setItem("votes", JSON.stringify(votes));
    updateUI();
}


    // Function to sort the food items based on total votes
    function sortFoodItems() {
        let container = document.getElementById("food-container");
        let items = Array.from(container.getElementsByClassName("food-item"));

        items.sort((a, b) => {
            let foodA = a.dataset.food;
            let foodB = b.dataset.food;
            return votes[foodB].total - votes[foodA].total; // Sort in descending order by total votes
        });

        items.forEach(item => container.appendChild(item));
    }

    // Add event listeners for voting buttons
    document.getElementById("pizza-upvote").addEventListener("click", () => vote("pizza", 1));
    document.getElementById("pizza-downvote").addEventListener("click", () => vote("pizza", -1));

    document.getElementById("burger-upvote").addEventListener("click", () => vote("burger", 1));
    document.getElementById("burger-downvote").addEventListener("click", () => vote("burger", -1));

    document.getElementById("salad-upvote").addEventListener("click", () => vote("salad", 1));
    document.getElementById("salad-downvote").addEventListener("click", () => vote("salad", -1));

    // Initialize the UI
    updateUI();
});
