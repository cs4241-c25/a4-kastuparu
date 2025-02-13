import {useEffect, useState} from 'react'
import axios from 'axios'

function App() {

    const [loggedIn, setLoggedIn] = useState(false);
    const [tasks, setTasks] = useState([])

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
            console.log(response)
            if (response.status === 200) {
                setLoggedIn(true)
                setTasks(response.data)
            }
        })
    }

    const loginButton = () => {
        return (
            <button onClick={() => {
                window.open(loggedIn ? '/api/logout' : '/api/login', '_self')
            }}>
                {loggedIn ? "Logout" : "Login"}
            </button>
        )
    }

    return (
        <>
            {loginButton()}
        </>
    )
}

export default App