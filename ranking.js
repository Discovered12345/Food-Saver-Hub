document.addEventListener("DOMContentLoaded", function () {
    let votes = JSON.parse(localStorage.getItem("votes")) || {
        pizza: { upvotes: 0, downvotes: 0, total: 0 },
        burger: { upvotes: 0, downvotes: 0, total: 0 },
        salad: { upvotes: 0, downvotes: 0, total: 0 }
    };

    function updateUI() {
        Object.keys(votes).forEach(food => {
            document.getElementById(`${food}-upvotes`).textContent = votes[food].upvotes;
            document.getElementById(`${food}-downvotes`).textContent = votes[food].downvotes;
            document.getElementById(`${food}-total`).textContent = votes[food].total;
        });

        sortFoodItems();
    }

    function vote(food, value) {
        if (value === 1) {
            votes[food].upvotes++;
        } else {
            votes[food].downvotes++;
        }
        votes[food].total = votes[food].upvotes - votes[food].downvotes;
        localStorage.setItem("votes", JSON.stringify(votes));
        updateUI();
    }

    function sortFoodItems() {
        let container = document.getElementById("food-container");
        let items = Array.from(container.getElementsByClassName("food-item"));

        items.sort((a, b) => {
            let foodA = a.dataset.food;
            let foodB = b.dataset.food;
            return votes[foodB].total - votes[foodA].total; // Sort descending
        });

        items.forEach(item => container.appendChild(item));
    }

    // Ensure buttons work
    window.vote = vote;

    // Initialize UI
    updateUI();
});
