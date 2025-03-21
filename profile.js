let items = [];
let orders = [];

async function loadOrders() {
    const API_URL = "http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=50b76637-a9bd-455e-a5a7-bf158dc4a7ef";

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();
        orders = data;        
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
    }
}

async function deleteOrder(orderId) {
    try {
        const response = await fetch(`http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=50b76637-a9bd-455e-a5a7-bf158dc4a7ef`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        createNotification("Заказ удален!");
    } catch (error) {
        console.error("Ошибка при удалении заказов:", error);
    }

    location.reload();
}

function orderIdsToItems(orderIds) {
    let result = "";
    for (id of orderIds) {
        const item = (items.find(order => order.id === id));
        result += '🎯' + item.name + '<br>';
    }
    return result;
}

function countPrice(orderIds) {
    let result = 0;
    for (id of orderIds) {
        const item = (items.find(order => order.id === id));
        result += (item.discount_price !== null) ? 
            item.discount_price : item.actual_price;
    }
    return result;
}

function deleteConfirmation(row, orderID) {
    let existingDelWindow = document.querySelector(".delete-box");
    if (existingDelWindow) {
        existingDelWindow.remove();
    }

    let existingDWindow = document.querySelector(".details-box");
    if (existingDWindow) {
        existingDWindow.remove();
    }

    let existingEwindow = document.querySelector(".edit-box");
    if (existingEwindow) {
        existingEwindow.remove();
    }

    const deleteConf = document.createElement("div");
    const oId = orderID;
    deleteConf.className = "delete-box";

    const toptext = document.createElement("p");
    toptext.style.fontWeight = "bold";
    toptext.textContent = "Удаление заказа";

    const line1 = document.createElement("hr");
    const line2 = document.createElement("hr");
    line1.classList.add("lines");
    line2.classList.add("lines");

    const crossBtn = document.createElement("button");
    crossBtn.className = "cross-button";
    crossBtn.textContent = "X";

    const orderIndex = row.getAttribute('data-index');

    const text = document.createElement("p");
    text.textContent = "Вы уверены, что хотите удалить заказ №" + 
        (parseInt(orderIndex) + 1) + " ?";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "cancel-button";
    cancelBtn.textContent = "Отмена";

    const yesBtn = document.createElement("button");
    yesBtn.className = "yes-button";
    yesBtn.textContent = "Да";

    crossBtn.addEventListener("click", () => {
        deleteConf.style.display = "none";
    });

    cancelBtn.addEventListener("click", () => {
        deleteConf.style.display = "none";
    });

    yesBtn.addEventListener("click", async () => {
        await deleteOrder(oId);
        deleteConf.style.display = "none";
        location.reload();
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "deleteConfBtn-container";
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(yesBtn);

    deleteConf.appendChild(toptext);
    deleteConf.appendChild(line1);
    deleteConf.appendChild(crossBtn);
    deleteConf.appendChild(text);
    deleteConf.appendChild(line2);
    deleteConf.appendChild(buttonContainer);

    document.body.appendChild(deleteConf);
    deleteConf.style.display = "block";

}

function detailsWindow(orderID) { 
    let existingDelWindow = document.querySelector(".delete-box");
    if (existingDelWindow) {
        existingDelWindow.remove();
    }

    let existingDWindow = document.querySelector(".details-box");
    if (existingDWindow) {
        existingDWindow.remove();
    }

    let existingEwindow = document.querySelector(".edit-box");
    if (existingEwindow) {
        existingEwindow.remove();
    }

    const detailsWind = document.createElement("div");
    detailsWind.className = "details-box";

    const toptext = document.createElement("p");
    toptext.style.fontWeight = "bold";
    toptext.textContent = "Просмотр заказа";

    const line1 = document.createElement("hr");
    const line2 = document.createElement("hr");
    line1.classList.add("lines");
    line2.classList.add("lines");

    const crossBtn = document.createElement("button");
    crossBtn.className = "cross-button";
    crossBtn.textContent = "X";
    
    const table = document.createElement("table");
    table.className = "details-table";

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    const order = orders.find(order => order.id === orderID);
    const data = {
        created_at: dateReformer(order.created_at),
        delivery: {
            full_name: order.full_name,
            phone: order.phone,
            email: order.email,
            address: order.delivery_address,
            date: dateReformerDateOnly(order.delivery_date),
            time: order.delivery_interval,
        },
        items: orderIdsToItems(order.good_ids),
        total_price: countPrice(order.good_ids) + ' ₽',
        comment: order.comment,
    };

    const rows = [
        ["Дата оформления", data.created_at],
        ["Имя", data.delivery.full_name],
        ["Номер телефона", data.delivery.phone],
        ["Email", data.delivery.email],
        ["Адрес доставки", data.delivery.address],
        ["Дата доставки", data.delivery.date],
        ["Время доставки", data.delivery.time],
        ["Состав заказа", data.items],
        ["Стоимсоть заказа", data.total_price],
        ["Комментарий", data.comment || "Нет комментариев"],
    ];

    rows.forEach(([label, value]) => {
        const row = document.createElement("tr");

        const cellLabel = document.createElement("td");
        cellLabel.textContent = label;

        const cellValue = document.createElement("td");
        cellLabel.style.fontWeight = "bold";

        if (label === "Состав заказа") {
            const scrollContainer = document.createElement("div");
            scrollContainer.style.maxHeight = "100px";
            scrollContainer.style.overflowY = "auto";
            scrollContainer.style.marginBottom = "20px"; 

            scrollContainer.innerHTML = data.items;

            cellValue.appendChild(scrollContainer);
        } else if (label === "Время доставки") {
            cellValue.innerHTML = value;
        } else {
            cellValue.textContent = value;
        }

        row.appendChild(cellLabel);
        row.appendChild(cellValue);

        tbody.appendChild(row);
    });
 
    const okBtn = document.createElement("button");
    okBtn.className = "ok-button";
    okBtn.textContent = "ОК";

    crossBtn.addEventListener("click", () => {
        detailsWind.style.display = "none";
    });

    okBtn.addEventListener("click", () => {
        detailsWind.style.display = "none";
    });

    detailsWind.appendChild(toptext);
    detailsWind.appendChild(crossBtn);
    detailsWind.appendChild(line1);
    detailsWind.appendChild(table);
    detailsWind.appendChild(line2);
    detailsWind.appendChild(okBtn);

    document.body.appendChild(detailsWind);
    detailsWind.style.display = "block";
}

function dateToInputFormat(date) {
    const [day, month, year] = date.split('.');
    
    return `${year}-${month}-${day}`;
}

async function editOrder(orderID, newData) {
    const API_URL = `http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderID}?api_key=50b76637-a9bd-455e-a5a7-bf158dc4a7ef`;

    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(newData)
        });
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }       
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
    }
}

function editWindow(orderID) { 
    let existingDelWindow = document.querySelector(".delete-box");
    if (existingDelWindow) {
        existingDelWindow.remove();
    }

    let existingDWindow = document.querySelector(".details-box");
    if (existingDWindow) {
        existingDWindow.remove();
    }

    let existingEwindow = document.querySelector(".edit-box");
    if (existingEwindow) {
        existingEwindow.remove();
    }

    const detailsWind = document.createElement("div");
    detailsWind.className = "edit-box";

    const toptext = document.createElement("p");
    toptext.style.fontWeight = "bold";
    toptext.textContent = "Редактирование заказа";

    const line1 = document.createElement("hr");
    const line2 = document.createElement("hr");
    line1.classList.add("lines");
    line2.classList.add("lines");

    const crossBtn = document.createElement("button");
    crossBtn.className = "cross-button";
    crossBtn.textContent = "X";
    
    const table = document.createElement("table");
    table.className = "details-table";

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    const order = orders.find(order => order.id === orderID);

    const data = {
        created_at: dateReformer(order.created_at),
        delivery: {
            full_name: order.full_name,
            phone: order.phone,
            email: order.email,
            address: order.delivery_address,
            date: dateReformerDateOnly(order.delivery_date),
            time: order.delivery_interval,
        },
        items: orderIdsToItems(order.good_ids),
        total_price: countPrice(order.good_ids) + ' ₽',
        comment: order.comment,
    };

    const rows = [
        ["Дата оформления", data.created_at],
        ["Имя", data.delivery.full_name],
        ["Номер телефона", data.delivery.phone],
        ["Email", data.delivery.email],
        ["Адрес доставки", data.delivery.address],
        ["Дата доставки", data.delivery.date],
        ["Время доставки", data.delivery.time],
        ["Состав заказа", data.items],
        ["Стоимсоть заказа", data.total_price],
        ["Комментарий", data.comment || "Нет комментариев"],
    ];

    rows.forEach(([label, value]) => {
        const row = document.createElement("tr");

        const cellLabel = document.createElement("td");
        cellLabel.textContent = label;
        cellLabel.style.fontWeight = "bold";

        const cellValue = document.createElement("td");

        if (label === "Состав заказа") {
            const scrollContainer = document.createElement("div");
            scrollContainer.style.maxHeight = "100px";
            scrollContainer.style.overflowY = "auto";
            scrollContainer.style.border = "solid 1px";
            scrollContainer.style.marginBottom = "20px"; 

            scrollContainer.innerHTML = data.items;

            cellValue.appendChild(scrollContainer);
        } else if (label === "Комментарий") {
            const textAreaField = document.createElement('textarea');
            textAreaField.classList.add('comment-section');
            textAreaField.value = value;
            textAreaField.setAttribute('id', 'editComment');

            cellValue.appendChild(textAreaField);
        } else if (label === "Имя" || label === "Номер телефона" || 
                label === "Email" || label === "Адрес доставки") {

            const inputField = document.createElement('input');
            inputField.value = value;

            let inputId;
            switch (label) {
            case "Имя":
                inputId = "editFullName";
                break;
            case "Номер телефона":
                inputId = "editPhone";
                break;
            case "Email":
                inputId = "editEmail";
                break;
            case "Адрес доставки":
                inputId = "editAddress";
                break;
            }
            inputField.setAttribute('id', inputId);

            cellValue.appendChild(inputField);
        } else if (label === "Дата доставки") {
            const inputField = document.createElement('input');
            inputField.type = 'date';
            inputField.setAttribute('id', 'editDate');
            inputField.value = dateToInputFormat(value);
            cellValue.appendChild(inputField);
        } else if (label === "Время доставки") {
            const selectField = document.createElement('select');
            selectField.id = 'editTime';
            selectField.name = 'delivery_interval';

            const options = [
                "08:00-12:00",
                "12:00-14:00",
                "14:00-18:00",
                "18:00-22:00"
            ];

            options.forEach(optionValue => {
                const option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionValue;
                if (optionValue === value) {
                    option.selected = true;
                }
                selectField.appendChild(option);
            });

            cellValue.appendChild(selectField);
        } else {
            cellValue.textContent = value;
        }

        row.appendChild(cellLabel);
        row.appendChild(cellValue);

        tbody.appendChild(row);
    });
 
    const okBtn = document.createElement('button');
    okBtn.className = "ok-button";
    okBtn.textContent = "ОК";

    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-button';
    saveBtn.textContent = "Сохранить";

    const btnsRow = document.createElement('div');
    btnsRow.className = ('buttons-row');

    btnsRow.appendChild(saveBtn);
    btnsRow.appendChild(okBtn);

    crossBtn.addEventListener("click", () => {
        detailsWind.style.display = "none";
    });

    okBtn.addEventListener("click", () => {
        detailsWind.style.display = "none";
    });

    saveBtn.addEventListener("click", async () => {
        const updatedData = {
            full_name: document.getElementById("editFullName").value.trim(),
            delivery_address: document.getElementById(
                "editAddress").value.trim(),
            delivery_date: document.getElementById("editDate").value.trim(),
            delivery_interval: document.getElementById("editTime").value.trim(),
            phone: document.getElementById("editPhone").value.trim(),
            email: document.getElementById("editEmail").value.trim(),
            comment: document.getElementById("editComment").value.trim(),
        };
    
        await editOrder(orderID, updatedData);
        location.reload();
    });

    detailsWind.appendChild(toptext);
    detailsWind.appendChild(crossBtn);
    detailsWind.appendChild(line1);
    detailsWind.appendChild(table);
    detailsWind.appendChild(line2);
    detailsWind.appendChild(btnsRow);

    document.body.appendChild(detailsWind);
    detailsWind.style.display = "block";
}

function displayOrders() {
    const tableBody = document.querySelector('#ordersHistory tbody');
    tableBody.innerHTML = '';

    const sortedOrders = orders.sort((a, b) => 
        (new Date(b.delivery_date) - new Date(a.delivery_date)));

    sortedOrders.forEach((order, index) => {
        const row = document.createElement('tr');
        row.classList.add('orderHistoryRow');

        const registrationDate = dateReformer(order.created_at);

        let fullPrice = 500;
        let wholeOrder = '';

        for (let i = 0; i < order.good_ids.length; i++) {
            const currentItem = items.find(item => 
                item.id === order.good_ids[i]);
            wholeOrder += '🎯' + currentItem.name + '; <br>';
            fullPrice += (currentItem.discount_price !== null) ? 
                currentItem.discount_price : currentItem.actual_price;
        }

        const deliveryTime = dateReformerDateOnly(order.delivery_date) + '<br>' 
            + order.delivery_interval;

        const cellIndex = document.createElement('td');
        cellIndex.textContent = index + 1;
        row.setAttribute('data-index', index);
        row.appendChild(cellIndex);

        const cellRegDate = document.createElement('td');
        cellRegDate.textContent = registrationDate;
        row.appendChild(cellRegDate);

        const cellOrder = document.createElement('td');

        const scrollContainer = document.createElement("div");
        scrollContainer.style.maxHeight = "100px";
        scrollContainer.style.overflowY = "auto";

        scrollContainer.innerHTML = wholeOrder;

        cellOrder.appendChild(scrollContainer);
        cellOrder.classList.add('wholeOrder');
        row.appendChild(cellOrder);

        const cellPrice = document.createElement('td');
        cellPrice.textContent = fullPrice + ' ₽';
        row.appendChild(cellPrice);

        const cellDeliveryTime = document.createElement('td');
        cellDeliveryTime.innerHTML = deliveryTime;
        row.appendChild(cellDeliveryTime);

        const cellActions = document.createElement('td');
        cellActions.classList.add("actionButtonsCell");
        
        const detailsButton = document.createElement('button');
        detailsButton.classList.add("historyButtons");
        detailsButton.classList.add('btn', 'btn-outline-dark', 'me-1');
        detailsButton.innerHTML = `<i class="bi bi-eye"></i>`;
        detailsButton.addEventListener('click', () => detailsWindow(order.id));

        const editButton = document.createElement('button');
        editButton.classList.add("historyButtons");
        editButton.classList.add('btn', 'btn-outline-dark', 'me-1');
        editButton.innerHTML = `<i class="bi bi-pencil"></i>`;
        editButton.addEventListener('click', () => editWindow(order.id));

        const deleteButton = document.createElement('button');
        deleteButton.classList.add("historyButtons");
        deleteButton.classList.add('btn', 'btn-outline-dark', 'me-1');
        deleteButton.innerHTML = `<i class="bi bi-trash"></i>`;
        deleteButton.addEventListener('click', () => 
            deleteConfirmation(row, order.id));

        cellActions.appendChild(detailsButton);
        cellActions.appendChild(editButton);
        cellActions.appendChild(deleteButton); 
        
        row.appendChild(cellActions);

        tableBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    Promise.all([loadOrders(), loadItems()]).then(() => {
        displayOrders();
    }).catch(error => {
        console.error("Ошибка при загрузке данных:", error);
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
