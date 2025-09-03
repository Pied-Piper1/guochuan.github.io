document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo-list');
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');

    // 从 localStorage 加载数据
    function loadTodos() {
        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        todos.forEach(todo => addTodoToDOM(todo.text, todo.completed));
    }

    // 将数据保存到 localStorage
    function saveTodos() {
        const todos = [];
        document.querySelectorAll('#todo-list li').forEach(item => {
            todos.push({
                text: item.querySelector('.todo-text').textContent,
                completed: item.classList.contains('completed')
            });
        });
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // 创建待办事项的 DOM 元素
    function addTodoToDOM(text, completed) {
        const li = document.createElement('li');
        if (completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''} />
            <span class="todo-text">${text}</span>
            <button class="delete-btn">❌</button>
        `;

        // 监听勾选框
        li.querySelector('.checkbox').addEventListener('change', (e) => {
            li.classList.toggle('completed');
            saveTodos();
        });

        // 监听删除按钮
        li.querySelector('.delete-btn').addEventListener('click', (e) => {
            li.remove();
            saveTodos();
        });

        todoList.appendChild(li);
    }

    // 监听“添加”按钮
    addBtn.addEventListener('click', () => {
        const text = todoInput.value.trim();
        if (text) {
            addTodoToDOM(text, false);
            todoInput.value = '';
            saveTodos();
        }
    });

    // 监听回车键
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBtn.click();
        }
    });

    // 页面加载时执行
    loadTodos();
});