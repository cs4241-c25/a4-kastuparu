// FRONT-END (CLIENT) JAVASCRIPT HERE
const priorityOptions = ["low", "medium", "high"]

const loadTasks = async function() {
    const response = await fetch('/data')

    if (response.status === 401) {
        console.log("Not authenticated")
        const loginButton = document.querySelector('#loginButton')
        loginButton.innerHTML = `<a href="/auth/github">Login</a>`
        const main = document.querySelector("main")
        main.innerHTML = `<p>Please log in to view your tasks.</p>`
        return
    }

    const tasks = await response.json()

    const tableBody = document.querySelector('#tableBody')
    tableBody.innerHTML = ``

    tasks.forEach(task => {
        const row = document.createElement("tr")
        row.id = `task-${task._id}`
        row.innerHTML = `<td>${task.taskName}</td>
                            <td>${task.priority}</td>
                            <td>${task.dueDate}</td>
                            <td>${task.overdue}</td>
                            <td><input type="button" id="delete-task-${task._id}" value="Delete"/></td>
                            <td><input type="button" id="edit-task-${task._id}" value="Edit"</td>`
        tableBody.appendChild(row)

        const deleteButton = document.querySelector("#delete-task-" + task._id)
        deleteButton.addEventListener("click", async function () {
            await fetch('/data', {
                method: "DELETE",
                headers: {'content-type': 'application/json'},
                body: JSON.stringify({_id: task._id})
            })
            await loadTasks()
        })

        const editButton = document.querySelector("#edit-task-" + task._id)
        editButton.addEventListener("click", function () {
            const row = document.querySelector("#task-" + task._id)
            row.innerHTML = `<td><input type="text" id="editTaskName" name="editTaskName" placeholder="Task Name" value="${task.taskName}"></td>
                            <td>
                                <select name="editPriority" id="editPriority" class="priority">
                                    <option value="low">low</option>
                                    <option value="medium">medium</option>
                                    <option value="high">high</option>
                                </select>
                            </td>
                            <td><input type="date" id="editDueDate" name="editDueDate" value="${task.dueDate}"></td>
                            <td>${task.overdue}</td>
                            <td><input type="submit" id="edit-submit-task-${task._id}" value="Submit"></td>`
            for (let i = 0; i < priorityOptions.length; i++) {
                if (priorityOptions[i] === task.priority) {
                    document.querySelector("#editPriority").selectedIndex = i
                }
            }
            const editSubmitButton = document.querySelector("#edit-submit-task-" + task._id)
            editSubmitButton.addEventListener("click", async function () {
                const taskName = document.querySelector('#editTaskName')
                const priority = document.querySelector('#editPriority')
                const dueDate = document.querySelector('#editDueDate')
                const json = {_id: task._id, taskName: taskName.value, priority: priority.value, dueDate: dueDate.value}
                await fetch('/data', {
                    method: "PUT",
                    headers: {'content-type': 'application/json'},
                    body: JSON.stringify(json)
                })
                await loadTasks()
            })
        })
    })
}

const submit = async function(event) {
    // stop form submission from trying to load
    // a new .html page for displaying results...
    // this was the original browser behavior and still
    // remains to this day
    event.preventDefault()

    const taskName = document.querySelector('#taskName')
    const priority = document.querySelector('#priority')
    const dueDate = document.querySelector('#dueDate')

    const json = {taskName: taskName.value, priority: priority.value, dueDate: dueDate.value}

    await fetch('/data', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(json)
    })

    await loadTasks()
}

window.onload = function() {
    const button = document.querySelector('#createTask');
    button.onclick = submit;
}

window.addEventListener('DOMContentLoaded', loadTasks)
