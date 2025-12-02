document.addEventListener("DOMContentLoaded", () => {
  const flashMessages = document.querySelectorAll(".flash-message");
  if (flashMessages.length) {
    setTimeout(() => {
      flashMessages.forEach((el) => {
        el.classList.add("fade-out");
      });
    }, 3000);
  }
});
