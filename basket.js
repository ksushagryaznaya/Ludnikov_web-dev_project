let items = [];
let wholeBasket = [];

function displayBusket() {}

function generateUId() {
    return Date.now() + Math.random().toString(36);
};

async function sendOrder() {
    try {
        const form = document.getElementById('orderFormData');
        const formData = new FormData(form);

        const dateValue = formData.get('delivery_date');
        const [year, month, day] = dateValue.split('-');
        const formattedDate = `${day}.${month}.${year}`;
        formData.set('delivery_date', formattedDate);

        if (formData.get('comment') == '') {
            formData.delete('comment');
        }

        const selectedGoods = JSON.parse(localStorage.getItem('selectedItems'));

        for (let item of selectedGoods) {
            formData.append('good_ids', item);
        }

        const response = await fetch(
            "http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=50b76637-a9bd-455e-a5a7-bf158dc4a7ef", 
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const result = await response.json();

        createNotification("Заказ успешно отправлен!");

        localStorage.removeItem('selectedItems');

        location.reload();
    } catch (error) {
        console.error("ОШИБКА: ", error);
        createNotification("НЕ УДАЛОСЬ ОТПРАВИТЬ");
    }
};

function removeItemFromBasket(Uid) {
    wholeBasket = wholeBasket.filter(item => item.uniqueId !== Uid);    
    const savedIDs = wholeBasket.map(item => item.id);
    localStorage.setItem('selectedItems', JSON.stringify(savedIDs));
    displayBusket();
}

displayBusket = function() {
    const itemsContainer = document.getElementById("chosen-container");
    const totalP = document.getElementById('totalPrice');
    let total = 500;

    itemsContainer.innerHTML = '';

    if (wholeBasket.length == 0) {
        document.getElementById("empty").style.display = "block";
    } else {
        document.getElementById("empty").style.display = "none";
        wholeBasket.forEach(item => {
            const col = document.createElement('div');
            col.classList.add('col', 'col-lg-4', 'col-md-6', 'col-sm-12');

            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');
            itemCard.setAttribute('data-item', item.name);
            itemCard.setAttribute('data-unique-id', item.uniqueId);

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
            ratingContainer.appendChild(rating);
            rating.classList.add('rating');
            rating.textContent = item.rating.toFixed(1) + ' ';
            for (let j = 0; j < 5; j++) {
                const star = document.createElement('i');
                star.classList.add('bi', 
                    j < item.rating ? 'bi-star-fill' : 'bi-star', 'stars');
                rating.appendChild(star);
            }
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
        
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('add-button', 'btn', 'btn-dark');
            deleteButton.textContent = 'Удалить';

            deleteButton.onclick = function() {
                removeItemFromBasket(item.uniqueId);
                createNotification("Убрали " + item.name + 
                    " из Вашей корзины!");
            };

            itemCard.appendChild(deleteButton);

            total += (item.discount_price === null) ? 
                item.actual_price : item.discount_price;
            
            col.appendChild(itemCard);
            itemsContainer.appendChild(col);
        });
    }
    totalP.querySelector('span').textContent = `${total}₽`;
};

function loadSelectedItems() {
    const savedIDs = JSON.parse(localStorage.getItem('selectedItems')) || [];
    savedIDs.forEach(id => {
        const item = items.find(i => i.id === id);
        const newItem = {...item, uniqueId: generateUId()};
        wholeBasket.push(newItem);
    });
    displayBusket();
};

document.getElementById("resetB").onclick = function() {
    localStorage.removeItem('selectedItems');
    location.reload();
};

document.getElementById("postB").onclick = function(event) {
    event.preventDefault();

    const nameForm = document.getElementById('nameField');
    const phoneForm = document.getElementById('phoneField');
    const emailForm = document.getElementById('emailField');
    const addressForm = document.getElementById('addressField');
    const deliveryDate = document.querySelector('#delDate');
    const deliveryTime = document.getElementById('delTime');
    const order = JSON.parse(
        localStorage.getItem('selectedItems')) || [];

    if (order.length === 0) {
        createNotification('Выберите товары в каталоге!');
    } else if (nameForm.value === '') {
        createNotification('Укажите имя!');
    } else if (phoneForm.value === '') {
        createNotification('Укажите номер телефона!');
    } else if (emailForm.value === '') {
        createNotification('Укажите адрес электронной почты!');
    } else if (addressForm.value === '') {
        createNotification('Укажите адрес доставки!');
    } else if (deliveryDate.value === '') {
        createNotification('Укажите дату доставки!');
    } else if (deliveryTime.value === '') {
        createNotification('Укажите время доставки!');
    } else {
        sendOrder();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    loadItems().then(() => {
        loadSelectedItems();
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
            console.log("Ответ API:", suggestions);
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