document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("hamburger-menu");
  const nav = document.getElementById("animateme");

  if (!menuButton || !nav) {
    console.error("Menu button or nav container not found");
    return;
  }

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.classList.toggle("open"); // only toggles class
    menuButton.setAttribute("aria-expanded", isOpen);
  });
});
