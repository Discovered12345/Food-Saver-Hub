// User Management
let currentUser = null;
const users = JSON.parse(localStorage.getItem('users')) || [];
const foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];
const mealPlans = JSON.parse(localStorage.getItem('mealPlans')) || [];
const votes = JSON.parse(localStorage.getItem('votes')) || [];

const MENU_OPTIONS = [
    'Pizza',
    'Hamburgers',
    'Cheesy Bread',
    'Hot Dog',
    'Fries',
    'Tater Tots',
    'Chicken Nuggets',
    'Mac and Cheese',
    'Spaghetti',
    'Grilled Cheese'
];

const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
];

// Authentication Functions
function toggleAuth(mode = 'login') {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.querySelector('.auth-tab:nth-child(1)');
    const registerTab = document.querySelector('.auth-tab:nth-child(2)');

    if (mode === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showToast(`Welcome back, ${user.name}!`);
        showDashboard();
        return true;
    }
    showToast('Invalid credentials', 'error');
    return false;
}

function register(name, email, role, password) {
    if (users.some(u => u.email === email)) {
        showToast('Email already exists', 'error');
        return false;
    }
    const user = { id: Date.now(), name, email, role, password };
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    showToast('Registration successful! Please login.');
    toggleAuth('login');
    return true;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    const dashboard = document.getElementById('dashboard');
    const loginSection = document.getElementById('login-section');
    
    if (dashboard) dashboard.classList.add('hidden');
    if (loginSection) loginSection.classList.remove('hidden');
    
    showToast('Logged out successfully');
}

// Dashboard Management
function showDashboard() {
    const loginSection = document.getElementById('login-section');
    const dashboard = document.getElementById('dashboard');
    const userName = document.getElementById('user-name');
    const staffControls = document.getElementById('staff-controls');
    
    if (loginSection) loginSection.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
    if (userName) userName.textContent = `${currentUser.name} (${currentUser.role})`;
    
    if (staffControls && currentUser.role === 'staff') {
        staffControls.classList.remove('hidden');
    }
    
    loadFoodBoard();
    loadVotingSystem();
    loadMealPlanning();
    updateAnalytics();
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => section.classList.add('hidden'));
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        if (sectionId === 'analytics') {
            initializeChart();
        }
    }
}

// Voting System
function loadVotingSystem() {
    const votingGrid = document.getElementById('voting-grid');
    if (!votingGrid) return;

    const currentWeek = getWeekNumber(new Date());
    votingGrid.innerHTML = '';
    
    MENU_OPTIONS.forEach(option => {
        const userVotes = votes.filter(v => v.week === currentWeek && v.choice === option);
        const yesVotes = userVotes.filter(v => v.vote === 'yes').length;
        const noVotes = userVotes.filter(v => v.vote === 'no').length;
        const totalVotes = yesVotes + noVotes;
        const approvalRate = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
        
        const userVote = votes.find(v => 
            v.userId === currentUser.id && 
            v.week === currentWeek && 
            v.choice === option
        );

        const card = document.createElement('div');
        card.className = 'food-card';
        card.innerHTML = `
            <h3>${option}</h3>
            <div class="vote-stats">
                Current votes: ${yesVotes} yes / ${noVotes} no
            </div>
            <div class="progress-bar">
                <div class="fill ${userVote?.vote === 'yes' ? 'yes' : 'no'}" 
                     style="width: ${approvalRate}%"></div>
            </div>
            <div class="vote-buttons">
                <div class="vote-button yes ${userVote?.vote === 'yes' ? 'selected' : ''}"
                     onclick="submitVote('${option}', 'yes')">
                    Yes
                </div>
                <div class="vote-button no ${userVote?.vote === 'no' ? 'selected' : ''}"
                     onclick="submitVote('${option}', 'no')">
                    No
                </div>
            </div>
        `;
        votingGrid.appendChild(card);
    });
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function submitVote(choice, vote) {
    const currentWeek = getWeekNumber(new Date());
    const existingVote = votes.findIndex(v => 
        v.userId === currentUser.id && 
        v.week === currentWeek && 
        v.choice === choice
    );

    if (existingVote !== -1) {
        votes[existingVote].vote = vote;
    } else {
        votes.push({
            userId: currentUser.id,
            week: currentWeek,
            choice,
            vote,
            timestamp: Date.now()
        });
    }

    localStorage.setItem('votes', JSON.stringify(votes));
    loadVotingSystem();
    showToast(`Vote for ${choice} recorded!`);
}

// Food Board Management
function loadFoodBoard() {
    const foodList = document.getElementById('available-food');
    if (!foodList) return;

    foodList.innerHTML = '';
    
    const availableFood = foodItems.filter(item => item.status === 'available');
    availableFood.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'food-item';
        itemElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>Quantity: ${item.quantity}</p>
            <p>Available until: ${item.expiry}</p>
            ${currentUser.role === 'student' ? 
                `<button onclick="claimFood(${item.id})">Claim</button>` : ''}
        `;
        foodList.appendChild(itemElement);
    });
}

function addFoodItem(name, quantity, expiry) {
    const item = {
        id: Date.now(),
        name,
        quantity,
        expiry,
        addedBy: currentUser.id,
        status: 'available'
    };
    foodItems.push(item);
    localStorage.setItem('foodItems', JSON.stringify(foodItems));
    loadFoodBoard();
    showToast('Food item added successfully');
}

function claimFood(foodId) {
    const item = foodItems.find(f => f.id === foodId);
    if (item) {
        item.status = 'claimed';
        item.claimedBy = currentUser.id;
        localStorage.setItem('foodItems', JSON.stringify(foodItems));
        loadFoodBoard();
        updateAnalytics();
        showToast('Food item claimed successfully');
    }
}

// Meal Planning
function loadMealPlanning() {
    const mealGrid = document.getElementById('meal-grid');
    if (!mealGrid) return;

    mealGrid.innerHTML = '';
    
    DAYS_OF_WEEK.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        const mainDish = getRandomMenuOption();
        const sides = getRandomMenuOption();

        dayCard.innerHTML = `
            <h3>${day}</h3>
            <div class="meal-section">
                <h4>Main Dish</h4>
                <div class="meal-item">
                    <div>${mainDish}</div>
                    <div class="quantity">Qty: ${Math.floor(Math.random() * 50) + 50}</div>
                    <span class="meal-tag">Main</span>
                </div>
            </div>
            <div class="meal-section">
                <h4>Sides</h4>
                <div class="meal-item">
                    <div>${sides}</div>
                    <div class="quantity">Qty: ${Math.floor(Math.random() * 30) + 30}</div>
                    <span class="meal-tag">Side</span>
                </div>
            </div>
        `;
        
        mealGrid.appendChild(dayCard);
    });
}

function getRandomMenuOption() {
    return MENU_OPTIONS[Math.floor(Math.random() * MENU_OPTIONS.length)];
}

// Analytics
function updateAnalytics() {
    const foodSaved = document.getElementById('food-saved');
    const co2Reduced = document.getElementById('co2-reduced');
    const moneySaved = document.getElementById('money-saved');
    
    const claimedFood = foodItems.filter(item => item.status === 'claimed');
    const totalKgSaved = claimedFood.length * 0.5;
    const co2Value = totalKgSaved * 2.5;
    const moneyValue = totalKgSaved * 10;

    if (foodSaved) foodSaved.textContent = `${totalKgSaved.toFixed(1)} kg`;
    if (co2Reduced) co2Reduced.textContent = `${co2Value.toFixed(1)} kg`;
    if (moneySaved) moneySaved.textContent = `$${moneyValue.toFixed(2)}`;

    initializeChart();
}

function initializeChart() {
    const ctx = document.getElementById('preference-chart');
    if (!ctx) return;

    const currentWeek = getWeekNumber(new Date());
    const weeklyVotes = votes.filter(v => v.week === currentWeek);
    
    const voteData = MENU_OPTIONS.map(option => {
        const itemVotes = weeklyVotes.filter(v => v.choice === option);
        const yesVotes = itemVotes.filter(v => v.vote === 'yes').length;
        const noVotes = itemVotes.filter(v => v.vote === 'no').length;
        return {
            option,
            yesVotes,
            noVotes
        };
    });

    if (window.preferenceChart) {
        window.preferenceChart.destroy();
    }

    window.preferenceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: voteData.map(d => d.option),
            datasets: [
                {
                    label: 'Yes Votes',
                    data: voteData.map(d => d.yesVotes),
                    backgroundColor: '#4ade80'
                },
                {
                    label: 'No Votes',
                    data: voteData.map(d => d.noVotes),
                    backgroundColor: '#ef4444'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Votes'
                    }
                }
            }
        }
    });
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Event Listeners
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    login(email, password);
});

document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const role = document.getElementById('register-role').value;
    const password = document.getElementById('register-password').value;
    register(name, email, role, password);
});

document.getElementById('add-food-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('food-name').value;
    const quantity = document.getElementById('food-quantity').value;
    const expiry = document.getElementById('food-expiry').value;
    addFoodItem(name, quantity, expiry);
    e.target.reset();
});

// Check for logged in user on page load
window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
});