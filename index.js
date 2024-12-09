document.addEventListener('DOMContentLoaded', getCards);
document.getElementById('card-form').addEventListener('submit', addCard);

function addCard(event) {
    event.preventDefault();
    const cardInput = document.getElementById('card-input').value;
    if (cardInput === '') return;

    const card = {
        title: cardInput,
        todos: []
    };

    saveLocalCards(card);
    addCardToDOM(card);
    document.getElementById('card-input').value = '';
}

function addCardToDOM(card) {
    const cardContainer = document.getElementById('card-container');
    const cardElement = document.createElement('div');
    cardElement.classList.add('col-md-4');
    cardElement.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${card.title}</h5>
                <form class="todo-form form-inline">
                    <input type="text" class="todo-input form-control mb-2 mr-sm-2" placeholder="Ajouter une tâche">
                    <button type="submit" class="btn btn-primary mb-2">Ajouter</button>
                </form>
                <div class="form-inline justify-content-center mb-3">
                    <select class="filter-todo form-control">
                        <option value="all">ALL</option>
                        <option value="completed">COMPLETED</option>
                        <option value="uncompleted">UNCOMPLETED</option>
                    </select>
                </div>
                <ul class="todo-list list-group mt-3"></ul>
            </div>
        </div>
    `;
    cardContainer.appendChild(cardElement);

    const todoForm = cardElement.querySelector('.todo-form');
    const filterTodo = cardElement.querySelector('.filter-todo');
    const todoList = cardElement.querySelector('.todo-list');

    todoForm.addEventListener('submit', function(event) {
        addTodo(event, todoList, card.title);
    });
    todoList.addEventListener('click', function(event) {
        modifyOrDeleteTodo(event, card.title);
    });
    filterTodo.addEventListener('change', function() {
        filterTodos(filterTodo, todoList);
    });

    card.todos.forEach(todo => addTodoToDOM(todo, todoList));
}

function addTodo(event, todoList, cardTitle) {
    event.preventDefault();
    const todoInput = event.target.querySelector('.todo-input').value;
    if (todoInput === '') return;

    const todo = {
        text: todoInput,
        timestamp: new Date().toLocaleString(),
        completed: false
    };

    saveLocalTodos(todo, cardTitle);
    addTodoToDOM(todo, todoList);
    event.target.querySelector('.todo-input').value = '';
}

function addTodoToDOM(todo, todoList) {
    const todoItem = document.createElement('li');
    todoItem.classList.add('list-group-item');
    if (todo.completed) {
        todoItem.classList.add('completed');
    }
    todoItem.innerHTML = `
        <input type="checkbox" class="complete-checkbox" ${todo.completed ? 'checked' : ''}>
        <input type="text" class="todo-text" value="${todo.text}" readonly>
        <small class="text-muted todo-timestamp">${todo.timestamp}</small>
        <button class="btn btn-warning btn-sm float-right edit-btn" ${todo.completed ? 'style="display:none;"' : ''}>✏️</button>
        <button class="btn btn-danger btn-sm float-right mr-2 trash-btn">🗑</button>
    `;
    todoList.appendChild(todoItem);
}

function modifyOrDeleteTodo(event, cardTitle) {
    const item = event.target;
    const todoItem = item.parentElement;
    const todoText = todoItem.querySelector('.todo-text').value;

    if (item.classList.contains('trash-btn')) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            todoItem.classList.add('slide-out');
            todoItem.addEventListener('animationend', function() {
                removeLocalTodos(todoText, cardTitle);
                todoItem.remove();
            });
        }
    }

    if (item.classList.contains('complete-checkbox')) {
        todoItem.classList.toggle('completed');
        updateLocalTodos(todoItem, cardTitle);
        const editBtn = todoItem.querySelector('.edit-btn');
        editBtn.style.display = todoItem.classList.contains('completed') ? 'none' : 'inline-block';
    }

    if (item.classList.contains('edit-btn')) {
        const todoTextElement = todoItem.querySelector('.todo-text');
        const checkbox = todoItem.querySelector('.complete-checkbox');
        const trashBtn = todoItem.querySelector('.trash-btn');
        if (todoTextElement.readOnly) {
            todoTextElement.readOnly = false;
            todoTextElement.focus();
            checkbox.style.display = 'none';
            trashBtn.style.display = 'none';
            item.innerHTML = '💾'; // Change icon to save
        } else {
            todoTextElement.readOnly = true;
            updateLocalTodos(todoItem, cardTitle);
            checkbox.style.display = 'inline-block';
            trashBtn.style.display = 'inline-block';
            item.innerHTML = '✏️'; // Change icon back to edit
        }
    }
}

function filterTodos(filterTodo, todoList) {
    const filter = filterTodo.value;
    const todos = todoList.querySelectorAll('.list-group-item');
    todos.forEach(todo => {
        switch (filter) {
            case 'all':
                todo.style.display = 'flex';
                break;
            case 'completed':
                if (todo.classList.contains('completed')) {
                    todo.style.display = 'flex';
                } else {
                    todo.style.display = 'none';
                }
                break;
            case 'uncompleted':
                if (!todo.classList.contains('completed')) {
                    todo.style.display = 'flex';
                } else {
                    todo.style.display = 'none';
                }
                break;
        }
    });
}

function saveLocalCards(card) {
    let cards = localStorage.getItem('cards') ? JSON.parse(localStorage.getItem('cards')) : [];
    cards.push(card);
    localStorage.setItem('cards', JSON.stringify(cards));
}

function saveLocalTodos(todo, cardTitle) {
    let cards = localStorage.getItem('cards') ? JSON.parse(localStorage.getItem('cards')) : [];
    const cardIndex = cards.findIndex(card => card.title === cardTitle);
    if (cardIndex !== -1) {
        cards[cardIndex].todos.push(todo);
        localStorage.setItem('cards', JSON.stringify(cards));
    }
}

function updateLocalTodos(todoItem, cardTitle) {
    let cards = localStorage.getItem('cards') ? JSON.parse(localStorage.getItem('cards')) : [];
    const cardIndex = cards.findIndex(card => card.title === cardTitle);
    if (cardIndex !== -1) {
        const todoText = todoItem.querySelector('.todo-text').value;
        const todoIndex = cards[cardIndex].todos.findIndex(todo => todo.text === todoText);
        if (todoIndex !== -1) {
            cards[cardIndex].todos[todoIndex].text = todoText;
            cards[cardIndex].todos[todoIndex].completed = todoItem.classList.contains('completed');
            localStorage.setItem('cards', JSON.stringify(cards));
        }
    }
}

function removeLocalTodos(todoText, cardTitle) {
    let cards = localStorage.getItem('cards') ? JSON.parse(localStorage.getItem('cards')) : [];
    const cardIndex = cards.findIndex(card => card.title === cardTitle);
    if (cardIndex !== -1) {
        cards[cardIndex].todos = cards[cardIndex].todos.filter(todo => todo.text !== todoText);
        localStorage.setItem('cards', JSON.stringify(cards));
    }
}

function getCards() {
    let cards = localStorage.getItem('cards') ? JSON.parse(localStorage.getItem('cards')) : [];
    cards.forEach(card => addCardToDOM(card));
}



















/*document.addEventListener('DOMContentLoaded', getCards);
document.getElementById('card-form').addEventListener('submit', addCard);

function addCard(event) {
    event.preventDefault();
    const cardInput = document.getElementById('card-input').value;
    if (cardInput === '') return;

    const card = {
        title: cardInput,
        todos: []
    };

    saveLocalCards(card);
    addCardToDOM(card);
    document.getElementById('card-input').value = '';
}

function addCardToDOM(card) {
    const cardContainer = document.getElementById('card-container');
    const cardElement = document.createElement('div');
    cardElement.classList.add('col-md-4');
    cardElement.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${card.title}</h5>
                <form class="todo-form form-inline">
                    <input type="text" class="todo-input form-control mb-2 mr-sm-2" placeholder="Ajouter une tâche">
                    <button type="submit" class="btn btn-primary mb-2">Ajouter</button>
                </form>
                <div class="form-inline  justify-content-center mb-3">
                    <select class="filter-todo form-control">
                        <option value="all">ALL</option>
                        <option value="completed">COMPLETED</option>
                        <option value="uncompleted">UNCOMPLETED</option>
                    </select>
                </div>
                <ul class="todo-list list-group mt-3"></ul>
            </div>
        </div>
    `;
    cardContainer.appendChild(cardElement);

    const todoForm = cardElement.querySelector('.todo-form');
    const filterTodo = cardElement.querySelector('.filter-todo');
    const todoList = cardElement.querySelector('.todo-list');

    todoForm.addEventListener('submit', function(event) {
        addTodo(event, todoList, card.title);
    });
    todoList.addEventListener('click', modifyOrDeleteTodo);
    filterTodo.addEventListener('change', function() {
        filterTodos(filterTodo, todoList);
    });

    card.todos.forEach(todo => addTodoToDOM(todo, todoList));
}

function addTodo(event, todoList, cardTitle) {
    event.preventDefault();
    const todoInput = event.target.querySelector('.todo-input').value;
    if (todoInput === '') return;

    const todo = {
        text: todoInput,
        timestamp: new Date().toLocaleString(),
        completed: false
    };

    saveLocalTodos(todo, cardTitle);
    addTodoToDOM(todo, todoList);
    event.target.querySelector('.todo-input').value = '';
}

function addTodoToDOM(todo, todoList) {
    const todoItem = document.createElement('li');
    todoItem.classList.add('list-group-item');
    if (todo.completed) {
        todoItem.classList.add('completed');
    }
    todoItem.innerHTML = `
        <input type="checkbox" class="complete-checkbox" ${todo.completed ? 'checked' : ''}>
        <input type="text" class="todo-text" value="${todo.text}" readonly>
        <small class="text-muted todo-timestamp">${todo.timestamp}</small>
        <button class="btn btn-warning btn-sm float-right edit-btn" ${todo.completed ? 'style="display:none;"' : ''}>✏️</button>
        <button class="btn btn-danger btn-sm float-right mr-2 trash-btn">🗑</button>
    `;
    todoList.appendChild(todoItem);
}

function modifyOrDeleteTodo(event) {
    const item = event.target;
    const todoItem = item.parentElement;

    if (item.classList.contains('trash-btn')) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            todoItem.classList.add('slide-out');
            todoItem.addEventListener('animationend', function() {
                todoItem.remove();
            });
        }
    }

    if (item.classList.contains('complete-checkbox')) {
        todoItem.classList.toggle('completed');
        const editBtn = document.querySelector('.edit-btn');
        editBtn.style.display = todoItem.classList.contains('completed') ? 'none' : 'inline-block';    }

    if (item.classList.contains('edit-btn')) {
        const todoText = todoItem.querySelector('.todo-text');
        const checkbox = todoItem.querySelector('.complete-checkbox');
        const trashBtn = todoItem.querySelector('.trash-btn');
        if (todoText.readOnly) {
            todoText.readOnly = false;
            todoText.focus();
            checkbox.style.display = 'none';
            trashBtn.style.display = 'none';
            item.innerHTML = '💾'; // Change icon to save
        } else {
            todoText.readOnly = true;
            checkbox.style.display = 'inline-block';
            trashBtn.style.display = 'inline-block';
            item.innerHTML = '✏️'; // Change icon back to edit
        }
    }
}

function filterTodos(filterTodo, todoList) {
    const filter = filterTodo.value;
    const todos = todoList.querySelectorAll('.list-group-item');
    todos.forEach(todo => {
        switch (filter) {
            case 'all':
                todo.style.display = 'flex';
                break;
            case 'completed':
                if (todo.classList.contains('completed')) {
                    todo.style.display = 'flex';
                } else {
                    todo.style.display = 'none';
                }
                break;
            case 'uncompleted':
                if (!todo.classList.contains('completed')) {
                    todo.style.display = 'flex';
                } else {
                    todo.style.display = 'none';
                }
                break;
        }
    });
}

function saveLocalCards(card) {
    let cards = localStorage.getItem('cards') ? JSON.parse(localStorage.getItem('cards')) : [];
    cards.push(card);
    localStorage.setItem('cards', JSON.stringify(cards));
}

function saveLocalTodos(todo, cardTitle) {
    let cards = localStorage.getItem('cards') ? JSON.parse(localStorage.getItem('cards')) : [];
    const cardIndex = cards.findIndex(card => card.title === cardTitle);
    if (cardIndex !== -1) {
        cards[cardIndex].todos.push(todo);
        localStorage.setItem('cards', JSON.stringify(cards));
    }
}

function getCards() {
    let cards = localStorage.getItem('cards') ? JSON.parse(localStorage.getItem('cards')) : [];
    cards.forEach(card => addCardToDOM(card));
}*/
