let items = [];
let uniqueCategories = [];
let selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
let displayedItems = 0;
let displayedItemsWithFilters = 0;

function displayItems() {
    const productGrid = document.getElementById('items');

    const itemsToDisplay = items;
    productGrid.innerHTML = '';

    for (let i = 0; i < itemsToDisplay.length; i++) {
        const item = itemsToDisplay[i];
        const col = document.createElement('div');
        col.classList.add('col', 'col-lg-4', 'col-md-6', 'col-sm-12');

        const itemCard = document.createElement('div');
        itemCard.classList.add('item-card');
        itemCard.setAttribute('data-item', item.name);

        const img = document.createElement('img');
        img.src = item.image_url;
        img.alt = item.name;
        itemCard.appendChild(img);

        const name = document.createElement('p');
        name.classList.add('name');
        name.textContent = item.name;
        itemCard.appendChild(name);

        const ratingContainer = document.createElement('div');
        ratingContainer.classList.add('rating-container');
        const rating = document.createElement('p');
        rating.classList.add('rating');
        rating.textContent = item.rating.toFixed(1) + ' ';
        for (let j = 0; j < 5; j++) {
            const star = document.createElement('i');
            star.classList.add('bi', 
                j < item.rating ? 'bi-star-fill' : 'bi-star', 'stars');
            rating.appendChild(star);
        }
        ratingContainer.appendChild(rating);
        itemCard.appendChild(ratingContainer);

        const priceContainer = document.createElement('div');
        priceContainer.classList.add('price-container');
        
        if (item.discount_price === null) {
            const Aprice = document.createElement('span');
            Aprice.classList.add('price', 'discount-price');
            Aprice.textContent = item.actual_price + '₽';
            priceContainer.appendChild(Aprice); 
        } else {
            const Dprice = document.createElement('span');
            Dprice.classList.add('price', 'discount-price');
            Dprice.textContent = item.discount_price + '₽ ';
            priceContainer.appendChild(Dprice);

            const Aprice = document.createElement('span');
            Aprice.classList.add('price', 'actual-price');
            Aprice.textContent = item.actual_price + '₽';
            priceContainer.appendChild(Aprice);

            const discountPercentage = Math.round(
                ((item.actual_price - item.discount_price) 
                    / item.actual_price) * 100
            );
            const discount = document.createElement('span');
            discount.classList.add('discount');
            discount.textContent = ' -' + discountPercentage + '%';
            priceContainer.appendChild(discount);
        }

        itemCard.appendChild(priceContainer);
        
        const addButton = document.createElement('button');
        addButton.classList.add('add-button', 'btn', 'btn-dark');
        addButton.textContent = 'Добавить';

        addButton.onclick = function() {
            selectedItems.push(item.id);
            localStorage.setItem('selectedItems', 
                JSON.stringify(selectedItems));
            createNotification("Добавили " + item.name + " в Вашу корзину!");
        };

        itemCard.appendChild(addButton);

        col.appendChild(itemCard);
        productGrid.appendChild(col);
    }
}



function getUniqueCategories() {
    items.forEach(item => {
        if (!uniqueCategories.includes(item.main_category))
            uniqueCategories.push(item.main_category); 
    });
}

function addCategories() {
    const categoryList = document.querySelector('.list-unstyled');

    uniqueCategories.forEach((category) => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'category';
        checkbox.value = category;
        li.appendChild(checkbox);
        li.appendChild(document.createTextNode(` ${category}`));
        categoryList.appendChild(li);
    });
}

window.onload = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (query) {
        document.getElementById('search').value = query;
        await performSearch(query);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    loadItems().then(() => {
        getUniqueCategories();
        addCategories();
        displayItems();
    });
    
    const searchInput = document.getElementById("search");
    const autocompleteList = document.createElement("ul");
    autocompleteList.classList.add("autocomplete-list");
    searchInput.parentNode.appendChild(autocompleteList);

    searchInput.addEventListener("input", async () => {
        const query = searchInput.value.trim();
        if (query.length < 2) {
            autocompleteList.innerHTML = "";
            return;
        }

        try {
            const response = await fetch(`http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/autocomplete?query=${encodeURIComponent(query)}&api_key=50b76637-a9bd-455e-a5a7-bf158dc4a7ef`);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const suggestions = await response.json();
            if (!Array.isArray(suggestions)) {
                throw new Error("API вернуло не массив!");
            }
            autocompleteList.innerHTML = "";

            suggestions.forEach(suggestion => {
                const item = document.createElement("li");
                item.textContent = suggestion;
                item.addEventListener("click", () => {
                    const words = searchInput.value.split(" ");
                    words[words.length - 1] = suggestion;
                    searchInput.value = words.join(" ");
                    autocompleteList.innerHTML = "";
                });
                autocompleteList.appendChild(item);
            });

        } catch (error) {
            console.error("Ошибка загрузки автодополнения:", error);
        }
    });

    document.addEventListener("click", (event) => {
        if (!searchInput.contains(event.target) && !autocompleteList.contains(event.target)) {
            autocompleteList.innerHTML = "";
        }
    });
});