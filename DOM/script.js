document.addEventListener('DOMContentLoaded', () => {

    // State & DOM Elements 
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskCategoryInput = document.getElementById('task-category');
    const taskList = document.getElementById('task-list');

    const totalCount = document.getElementById('total-count');
    const completedCount = document.getElementById('completed-count');
    const pendingCount = document.getElementById('pending-count');

    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const clearAllBtn = document.getElementById('clear-all');

    const themeToggleBtn = document.getElementById('theme-toggle');


    renderTasks();
    updateCounters();
    initTheme();


    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = taskTitleInput.value.trim();
        const category = taskCategoryInput.value;

        if (!title || !category) return;

        const newTask = {
            id: Date.now().toString(),
            title: title,
            category: category,
            status: 'pending'
        };

        tasks.push(newTask);
        saveTasks();


        const fragment = document.createDocumentFragment();
        fragment.appendChild(createTaskElement(newTask));
        taskList.prepend(fragment); // 3️⃣ DOM Manipulation: prepend()

        updateCounters();
        taskForm.reset();
    });


    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-card ${task.status === 'completed' ? 'completed' : ''}`;


        li.setAttribute('data-id', task.id);
        li.setAttribute('data-status', task.status);
        li.setAttribute('data-category', task.category);


        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.appendChild(document.createTextNode(task.title));

        const metaSpan = document.createElement('span');
        metaSpan.className = 'task-meta';
        metaSpan.appendChild(document.createTextNode(task.category));

        contentDiv.append(titleSpan, metaSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn-secondary btn-sm complete-btn';
        completeBtn.textContent = task.status === 'completed' ? 'Undo' : 'Complete';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-primary btn-sm edit-btn';
        editBtn.textContent = 'Edit';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-danger btn-sm delete-btn';
        deleteBtn.textContent = 'Delete';

        actionsDiv.append(completeBtn, editBtn, deleteBtn);

        li.append(contentDiv, actionsDiv);

        return li;
    }

    function renderTasks(filterText = '', filterCat = 'All') {

        const fragment = document.createDocumentFragment();
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(filterText.toLowerCase());
            const matchesCat = filterCat === 'All' || task.category === filterCat;
            return matchesSearch && matchesCat;
        });

        filteredTasks.forEach(task => {
            fragment.appendChild(createTaskElement(task));
        });

        taskList.appendChild(fragment);
    }


    taskList.addEventListener('click', (e) => {
        const target = e.target;


        const taskCard = target.closest('.task-card');
        if (!taskCard) return;

        const taskId = taskCard.dataset.id;


        if (target.classList.contains('complete-btn')) {
            const task = tasks.find(t => t.id === taskId);
            task.status = task.status === 'pending' ? 'completed' : 'pending';
            saveTasks();


            taskCard.dataset.status = task.status;
            if (task.status === 'completed') {
                taskCard.classList.add('completed');
                target.textContent = 'Undo';
            } else {
                taskCard.classList.remove('completed');
                target.textContent = 'Complete';
            }
            updateCounters();
        }


        if (target.classList.contains('delete-btn')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();


            taskCard.classList.add('removing');
            taskCard.addEventListener('animationend', () => {
                taskCard.remove();
                updateCounters();
            });
        }


        if (target.classList.contains('edit-btn')) {
            const titleSpan = taskCard.querySelector('.task-title');
            const currentTitle = titleSpan.textContent;

            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = currentTitle;
            editInput.className = 'edit-input';

            titleSpan.replaceWith(editInput);
            target.textContent = 'Save';
            target.classList.remove('edit-btn');
            target.classList.add('save-btn');
            editInput.focus();
        }


        if (target.classList.contains('save-btn')) {
            const editInput = taskCard.querySelector('.edit-input');
            const newTitle = editInput.value.trim();

            if (newTitle) {
                const task = tasks.find(t => t.id === taskId);
                task.title = newTitle;
                saveTasks();

                const titleSpan = document.createElement('span');
                titleSpan.className = 'task-title';
                titleSpan.textContent = newTitle;

                editInput.replaceWith(titleSpan);
                target.textContent = 'Edit';
                target.classList.remove('save-btn');
                target.classList.add('edit-btn');
            }
        }
    });

    // --- Search & Filter (Bonus) ---
    searchInput.addEventListener('input', applyFilters);
    filterCategory.addEventListener('change', applyFilters);

    function applyFilters() {
        renderTasks(searchInput.value, filterCategory.value);
    }

    // Clear All 
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
            updateCounters();
        }
    });

    // Counters
    function updateCounters() {
        totalCount.textContent = tasks.length;
        completedCount.textContent = tasks.filter(t => t.status === 'completed').length;
        pendingCount.textContent = tasks.filter(t => t.status === 'pending').length;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Theme Toggle 
    function initTheme() {

        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    themeToggleBtn.addEventListener('click', () => {
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Attributes vs Properties Demonstration
    const demoBtn = document.getElementById('demo-attr-prop');
    const demoResult = document.getElementById('demo-result');

    demoBtn.addEventListener('click', () => {
        taskTitleInput.value = "Modified via Property!";
        const propValue = taskTitleInput.value;
        const attrValue = taskTitleInput.getAttribute('value');

        /*
          Demonstration Required
          Show the difference between:
          
          input.value
          
          and
          
          input.getAttribute("value")
          
          Explanation:
          - Attribute: Represents the initial state in the HTML markup.
          - Property: Represents the current state of the DOM node object in memory.
          When a user types or JS changes .value, the property updates, but the attribute does not.
        */
        demoResult.innerHTML = `
            <strong>Property (.value):</strong> "${propValue}" <br>
            <strong>Attribute (.getAttribute('value')):</strong> "${attrValue}"
        `;
    });


    const grandparent = document.getElementById('grandparent');
    const parent = document.getElementById('parent');
    const child = document.getElementById('child');


    grandparent.addEventListener('click', () => console.log('* Grandparent'), false);
    parent.addEventListener('click', () => console.log('* Parent'), false);
    child.addEventListener('click', () => console.log('* Child'), false);


    grandparent.addEventListener('click', () => console.log('* Grandparent'), true);
    parent.addEventListener('click', () => console.log('* Parent'), true);
    child.addEventListener('click', () => console.log('* Child'), true);

    /*
      Event Bubbling
      Example:
      * Child  
      * Parent  
      * Grandparent
      
      Event Capturing
      Example:
      * Grandparent  
      * Parent  
      * Child
      
      Explanation: 
      Capturing phase travels down the DOM tree, triggering listeners from Grandparent to Child.
      Bubbling phase travels up the DOM tree, triggering listeners from Child to Grandparent.
    */
});
