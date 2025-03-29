//to aid with the ranking of cafeteria foods

let votes = {
  Pasta: 0,
  Pizza: 0,
  Salad: 0
};

function updateVotes(meal) {
  votes[meal]++
  document.getElementById(meal.toLowerCase() + 'votes').textContent = votes[meal];
  document.getElementById('votemessage').textContent = 'You voted for ${meall}';
}
