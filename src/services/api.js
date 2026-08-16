import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',

  headers: {
    'Content-Type': 'application/json',
  },
})

// =====================================================
// ADD JWT TOKEN
// =====================================================
api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user')

    if (userString) {
      try {
        const user = JSON.parse(userString)

        console.log(
          'API REQUEST:',
          config.method?.toUpperCase(),
          config.url
        )

        console.log(
          'TOKEN EXISTS:',
          !!user?.token
        )

        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`
        }
      } catch (error) {
        console.error(
          'Invalid user in localStorage:',
          error
        )

        localStorage.removeItem('user')
      }
    }

    return config
  },

  (error) => {
    return Promise.reject(error)
  }
)

// =====================================================
// HANDLE EXPIRED / INVALID TOKEN
// =====================================================
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api