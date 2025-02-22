import axios from 'axios'

const api = axios.create({
  baseURL: 'https://iot-pig-monitoring-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api