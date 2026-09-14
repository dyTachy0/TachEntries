// Javascript by caramelpuddinz on neocities

// Waits until the page has fully loaded before running the code
document.addEventListener('DOMContentLoaded', () => {

  // Your list of random messages will go here
  const messages = [
    "Shrimp on my desk, im the shrimp... goldshrimp",
    "Horsin' around the world 🐴🏇 around the world wide web 🌐",
    "Mango Pinapple Secret Encode?¿...",
	"You should'nt make Pentaerythriol Tetranitrate at home... but...",
	"I really like those banana gummies. Hot Damn"
  ];

  // This will grab the element with id="marquee-text"
  const marqueeText = document.getElementById('marquee-text');

  // Guard clause: stops execution if the element is not found
  if (!marqueeText) return;

  // This is the special welcome message that only shows the first time
  const welcomeMessage = "welcome to my autistic weblab corner ";

  // Checks if the user has visited before using sessionStorage
  if (!sessionStorage.getItem('visited')) {
    // If not visited, it will show the welcome message
    marqueeText.textContent = welcomeMessage;

    // Then mark that they’ve visited, so next time it won’t show again
    sessionStorage.setItem('visited', 'yes');
  } else {
    // If visited before, it will pick a random message from the list
    const randomIndex = Math.floor(Math.random() * messages.length);
    marqueeText.textContent = messages[randomIndex];
  }
});