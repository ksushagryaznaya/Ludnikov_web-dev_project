function createNotification(text) {
    const notificationContainer = document.getElementById('notifications');
    notificationContainer.innerHTML = '';

    const notsBox = document.createElement('div');
    notsBox.classList.add('notification-box');
    
    const notsText = document.createElement('span');
    notsText.classList.add('notification-text');
    notsText.textContent = '🔔 ' + text;
    notsBox.appendChild(notsText);
    
    const closeButton = document.createElement('span');
    closeButton.classList.add('close-button');
    closeButton.innerHTML = '×';

    closeButton.onclick = function() {
        notsBox.remove();
    };
    
    notsBox.appendChild(closeButton);

    notificationContainer.appendChild(notsBox);
}

document.getElementById("searchBtn").addEventListener("click", async () => {
    const query = document.getElementById("search").value.trim();
    if (query.length === 0) {
        createNotification("Введите запрос для поиска!");
        return;
    }

    if (!window.location.pathname.includes("index.html")) {
        window.location.href = `/index.html?q=${encodeURIComponent(query)}`;
        return;
    }

    await performSearch(query);
});

async function performSearch(query) {
    try {
        const API_URL = `http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?query=${encodeURIComponent(query)}&api_key=50b76637-a9bd-455e-a5a7-bf158dc4a7ef`;
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        items = data;

        const productGrid = document.getElementById('items');
        productGrid.innerHTML = "";
        displayedItems = 0;

        if (items.length === 0) {
            productGrid.innerHTML = "<p>Нет товаров, соответствующих вашему запросу</p>";
        } else {
            displayItems(8);
        }

    } catch (error) {
        console.error("Ошибка при поиске товаров:", error);
        createNotification("Ошибка при загрузке товаров!", "error");
    }
}

function dateReformer (dateToReform) {
    const [date, time] = dateToReform.split('T');
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
    
    return `${day}.${month}.${year} ${hour}:${minute}`;
}

function dateReformerDateOnly (dateToReform) {
    const [year, month, day] = dateToReform.split('-');
    
    return `${day}.${month}.${year}`;
}

async function loadItems() {
    const API_URL = "http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=50b76637-a9bd-455e-a5a7-bf158dc4a7ef";
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();
        items = data;
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
    }
}