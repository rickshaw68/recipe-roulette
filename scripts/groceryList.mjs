document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("grocery-list");
    const input = document.getElementById("grocery-input");
    const addBtn = document.getElementById("add-item");
    const clearBtn = document.getElementById("clear-list");

    let items = JSON.parse(localStorage.getItem("groceryList")) || [];

    // Function to render the grocery list on the page
    function renderList() {
        list.innerHTML = "";
        items.forEach((item, index) => {
            const li = document.createElement("li");
            li.classList.add("grocery-item");
            li.textContent = item;

            // add a remove button for desktop view
            const remove = document.createElement("button");
            remove.textContent = "❌";
            remove.classList.add("remove-button");
            remove.onclick = () => {
                items.splice(index, 1);
                localStorage.setItem("groceryList", JSON.stringify(items));
                renderList();
            };

            li.appendChild(remove);
            list.appendChild(li);
        
            // add swipe functionality for mobile view to remove items
            let touchStartX = 0;
            let touchEndX = 0;

            li.addEventListener("touchstart", (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });

            li.addEventListener("touchend", (e) => {
                touchEndX = e.changedTouches[0].screenX;
                if (touchStartX - touchEndX > 75) {
                li.classList.add("swipe-away");
                setTimeout(() => {
                    items.splice(index, 1);
                    localStorage.setItem("groceryList", JSON.stringify(items));
                    renderList();
                }, 300); // <-- animation duration
                }
            });
        });
    }

  // Add item event listener
  // This will add a new item to the grocery list and save it to localStorage
  function addItem() {
    const value = input.value.trim();
    if (value) {
        items.push(value);
        localStorage.setItem("groceryList", JSON.stringify(items));
        input.value = "";
        renderList();
    }
  }

    // Add item on button click
    addBtn.addEventListener("click", addItem);

    // Add item on Enter key press
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
        e.preventDefault(); // Prevent form submission inside a form
        addItem();
        }
    });

    // Clear list event listener 
    // This will clear the grocery list and remove it from localStorage
    // when the clear button is clicked
    clearBtn.addEventListener("click", () => {
        items = [];
        localStorage.removeItem("groceryList");
        renderList();
    });

    // Initial render of the grocery list
    renderList();

    const printButton = document.getElementById("print-grocery");
    if (printButton) {
        console.log("Looking for #print-grocery...");
        const printButton = document.getElementById("print-grocery");
        console.log("Found button:", printButton);

        printButton.addEventListener("click", () => {
                
        // add a delay to make sure the list if rendered before printing
            setTimeout(() => {
                window.print();
            }, 100); // <-- 100 milliseconds delay
        });

    }
}); 
