document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo-list');
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    
    // 检查是否在本地开发环境
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('localhost');
    
    // 数据文件路径
    const DATA_FILE = '/static/todos-data.json';
    
    // 从服务器或本地存储加载数据
    async function loadTodos() {
        let todos = [];
        
        try {
            // 尝试从服务器加载数据文件
            const response = await fetch(DATA_FILE + '?' + Date.now()); // 添加时间戳防止缓存
            if (response.ok) {
                todos = await response.json();
            }
        } catch (error) {
            console.log('从服务器加载失败，尝试从本地存储加载');
        }
        
        // 如果服务器没有数据，从 localStorage 加载（仅本地环境）
        if (todos.length === 0 && isLocalhost) {
            todos = JSON.parse(localStorage.getItem('todos') || '[]');
        }
        
        // 清空列表并重新渲染
        todoList.innerHTML = '';
        todos.forEach(todo => addTodoToDOM(todo.text, todo.completed));
    }
    
    // 保存数据（仅本地环境）
    async function saveTodos() {
        if (!isLocalhost) {
            console.log('非本地环境，无法保存');
            return;
        }
        
        const todos = [];
        document.querySelectorAll('#todo-list li').forEach(item => {
            todos.push({
                text: item.querySelector('.todo-text').textContent,
                completed: item.classList.contains('completed')
            });
        });
        
        // 保存到 localStorage
        localStorage.setItem('todos', JSON.stringify(todos));
        
        // 尝试保存到文件系统（需要本地服务器支持）
        try {
            await saveToFile(todos);
        } catch (error) {
            console.log('保存到文件失败，仅保存到 localStorage');
        }
    }
    
    // 保存到文件（需要后端支持，这里提供前端代码）
    async function saveToFile(todos) {
        // 这个功能需要你在本地添加一个简单的保存接口
        // 或者手动将 localStorage 中的数据复制到 static/todos-data.json
        const response = await fetch('/api/save-todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todos)
        });
        
        if (!response.ok) {
            throw new Error('保存失败');
        }
    }
    
    // 创建待办事项的 DOM 元素
    function addTodoToDOM(text, completed) {
        const li = document.createElement('li');
        if (completed) {
            li.classList.add('completed');
        }
        
        li.innerHTML = `
            <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''} ${!isLocalhost ? 'disabled' : ''} />
            <span class="todo-text">${text}</span>
            <span class="status-emoji">${completed ? '😊' : '😔'}</span>
            ${isLocalhost ? `<button class="delete-btn">${completed ? '🗑️' : '❌'}</button>` : ''}
        `;
        
        // 只在本地环境添加事件监听器
        if (isLocalhost) {
            // 监听勾选框
            li.querySelector('.checkbox').addEventListener('change', (e) => {
                li.classList.toggle('completed');
                
                // 更新表情和按钮图标
                const emoji = li.querySelector('.status-emoji');
                const deleteBtn = li.querySelector('.delete-btn');
                if (li.classList.contains('completed')) {
                    emoji.textContent = '😊';
                    if (deleteBtn) deleteBtn.textContent = '🗑️';
                } else {
                    emoji.textContent = '😔';
                    if (deleteBtn) deleteBtn.textContent = '❌';
                }
                
                saveTodos();
            });
            
            // 监听删除按钮
            const deleteBtn = li.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    if (confirm('确定要删除这个待办事项吗？')) {
                        li.remove();
                        saveTodos();
                    }
                });
            }
        }
        
        todoList.appendChild(li);
    }
    
    // 显示环境状态
    function showEnvironmentStatus() {
        const statusDiv = document.createElement('div');
        statusDiv.className = `environment-status ${isLocalhost ? 'local' : 'production'}`;
        statusDiv.innerHTML = isLocalhost ? 
            '✅ 本地环境 - 可以编辑待办事项' : 
            '🔒 只能查看';
        
        // 插入到待办事项列表前面
        todoList.parentNode.insertBefore(statusDiv, todoList);
    }
    
    // 根据环境调整UI
    function adjustUI() {
        if (!isLocalhost) {
            // 生产环境：隐藏输入区域
            const inputArea = document.querySelector('.input-area');
            if (inputArea) {
                inputArea.style.display = 'none';
            }
        } else {
            // 本地环境：显示输入区域
            const inputArea = document.querySelector('.input-area');
            if (inputArea) {
                inputArea.style.display = 'flex';
            }
        }
    }
    
    // 监听"添加"按钮（仅本地环境）
    addBtn.addEventListener('click', () => {
        if (!isLocalhost) {
            alert('只能在本地环境（localhost:4000）编辑待办事项');
            return;
        }
        
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
    showEnvironmentStatus();
    adjustUI();
    loadTodos();
    
    // 如果是本地环境，提供导出功能
    if (isLocalhost) {
        addExportFunction();
    }
    
    // 添加导出功能（帮助你手动保存数据）
    function addExportFunction() {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'export-btn';
        exportBtn.innerHTML = '📁 导出数据到文件';
        
        exportBtn.addEventListener('click', () => {
            const todos = JSON.parse(localStorage.getItem('todos') || '[]');
            const dataStr = JSON.stringify(todos, null, 2);
            
            // 创建下载链接
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'todos-data.json';
            link.click();
            URL.revokeObjectURL(url);
            
            alert('📋 数据已导出！请将 todos-data.json 文件放到 themes/hingle/source/static/ 目录下，然后重新部署。');
        });
        
        const inputArea = document.querySelector('.input-area');
        inputArea.parentNode.insertBefore(exportBtn, inputArea.nextSibling);
    }
});