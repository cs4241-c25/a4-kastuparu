import {useEffect, useState} from 'react'
import axios from 'axios'
import {
    Button, Container,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

function App() {

    const [loggedIn, setLoggedIn] = useState(false);

    const [tasks, setTasks] = useState([])

    const [createTaskName, setCreateTaskName] = useState("");
    const [createPriority, setCreatePriority] = useState("");
    const [createDueDate, setCreateDueDate] = useState(dayjs());

    const [editTaskId, setEditTaskId] = useState("");
    const [editTaskName, setEditTaskName] = useState("");
    const [editPriority, setEditPriority] = useState("");
    const [editDueDate, setEditDueDate] = useState(dayjs());

    axios.interceptors.response.use(response => {
        return response
    }, error => {
        if (error.response.status === 401) {
            setLoggedIn(false)
        }
        return error;
    });

    useEffect(() => {
        loadTasks()
    }, [loggedIn])

    const loadTasks = () => {
        axios.get('/api/tasks').then(response => {
            if (response.status === 200) {
                setLoggedIn(true)
                setTasks(response.data)
            }
        })
    }

    const loginButton = () => {
        return (
            <Button variant="contained" onClick={() => {
                window.open(loggedIn ? '/api/logout' : '/api/login', '_self')
            }}>
                {loggedIn ? "Logout" : "Login"}
            </Button>
        )
    }

    const createTask = () => {

        function submitTask() {
            const json = {
                taskName: createTaskName,
                priority: createPriority,
                dueDate: createDueDate.format("YYYY-MM-DD")
            }

            axios.post('/api/tasks', json).then(() => loadTasks())
        }

        return (
            <Container>
            <Typography variant="h3">Create Task</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Task Name</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <TextField id="createTaskName" label="Task Name" variant="outlined" value={createTaskName}
                                       onChange={(e) => setCreateTaskName(e.target.value)} />
                        </TableCell>
                        <TableCell>
                            <Select
                                id="createPriority"
                                value={createPriority}
                                label="Priority"
                                onChange={(e) => setCreatePriority(e.target.value)}
                                variant='standard'>
                                <MenuItem value={'low'}>low</MenuItem>
                                <MenuItem value={'medium'}>medium</MenuItem>
                                <MenuItem value={'high'}>high</MenuItem>
                            </Select>
                        </TableCell>
                        <TableCell>
                            <DatePicker value={createDueDate}
                                        onChange={(newDueDate) => setCreateDueDate(newDueDate)} />
                        </TableCell>
                        <TableCell>
                            <Button variant="contained" onClick={submitTask}>Create Task</Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table><br/>
            </Container>
        )
    }

    const tasksTable = () => {
        return (
            <Container>
            <Typography variant="h3">My Tasks</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Task Name</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Overdue?</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tasks.map((task) => {
                        if (editTaskId === task._id) {
                            return editTableRow(task)
                        }
                        else {
                            return tableRow(task)
                        }
                    })}
                </TableBody>
            </Table>
                <br/>
            </Container>
        )
    }

    const tableRow = (task) => {

        const deleteButton = (task) => {
            return (
                <Button variant="outlined" onClick={() => {
                    axios.delete('/api/tasks', {data: {_id: task._id}}).then(() => loadTasks())
                }}>Delete</Button>
            )
        }

        const editButton = (task) => {
            return (
                <Button variant="outlined" onClick={() => {
                    setEditTaskId(task._id)
                    setEditTaskName(task.taskName)
                    setEditPriority(task.priority)
                    setEditDueDate(dayjs(task.dueDate))
                }}>Edit</Button>
            )
        }

        return (
            <TableRow key={task._id}>
                <TableCell>{task.taskName}</TableCell>
                <TableCell>{task.priority}</TableCell>
                <TableCell>{task.dueDate}</TableCell>
                <TableCell>{task.overdue ? 'yes' : 'no'}</TableCell>
                <TableCell>{deleteButton(task)}</TableCell>
                <TableCell>{editButton(task)}</TableCell>
            </TableRow>
        )
    }

    const editTableRow = (task) => {
        function submitEditTask() {
            const json = {
                _id: editTaskId,
                taskName: editTaskName,
                priority: editPriority,
                dueDate: editDueDate.format("YYYY-MM-DD")
            }
            setEditTaskId("")
            axios.put('/api/tasks', json).then(() => loadTasks())
        }
        return (
            <TableRow key={task._id}>
                <TableCell>
                    <TextField id="editTaskName" label="Task Name" variant="outlined" value={editTaskName}
                               onChange={(e) => setEditTaskName(e.target.value)} />
                </TableCell>
                <TableCell>
                    <Select
                        id="editPriority"
                        value={editPriority}
                        label="Priority"
                        onChange={(e) => setEditPriority(e.target.value)}
                        variant='standard'>
                        <MenuItem value={'low'}>low</MenuItem>
                        <MenuItem value={'medium'}>medium</MenuItem>
                        <MenuItem value={'high'}>high</MenuItem>
                    </Select>
                </TableCell>
                <TableCell>
                    <DatePicker value={editDueDate}
                                onChange={(newDueDate) => setEditDueDate(newDueDate)} />
                </TableCell>
                <TableCell>{task.overdue ? 'yes' : 'no'}</TableCell>
                <TableCell>
                    <Button variant="contained" onClick={submitEditTask}>Submit</Button>
                </TableCell>
            </TableRow>
        )
    }

    const loginMessage = () => {
        return (
            <Typography variant="body1" align="center">Please log in to view your tasks.</Typography>
        )
    }

    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                {loginButton()}
                <Typography variant="h1" align="center">Task List</Typography>
                {loggedIn ? createTask() : null}
                {loggedIn ? tasksTable() : null}
                {loggedIn ? null : loginMessage()}
            </LocalizationProvider>
        </>
    )
}

export default App