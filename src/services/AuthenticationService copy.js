import axios from 'axios'

import UserService from './UserService'
import { USERNAME_ATTRIBUTE_NAME, DATE_ATTRIBUTE_NAME } from '../Constants'

class AuthenticationService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'http://localhost:8080',
      withCredentials: true
    })
  }

  executeJWTAuthentication(username, password) {
    return this.axiosInstance.post('/authenticate', { username, password })
  }

  registerJWTLogin(username, token, date) {
    let user = ''
    localStorage.setItem(USERNAME_ATTRIBUTE_NAME, username)
    localStorage.setItem(DATE_ATTRIBUTE_NAME, date)
    UserService.getUserByUsername(username)
    .then(response => {
      user = response.data
    })
    this.deployAxiosInterceptors(token)
    console.log('register: user:', user)
    return user
  }

  logout() {
    localStorage.removeItem(USERNAME_ATTRIBUTE_NAME)
    localStorage.removeItem(DATE_ATTRIBUTE_NAME)
    this.axiosInstance.post('/logout') //, { withCredentials: false }
  }

  loginStatus() {
    if(localStorage.getItem(DATE_ATTRIBUTE_NAME) < Date.now()) {
      return null
    }
    return localStorage.getItem(USERNAME_ATTRIBUTE_NAME)
  }

  validateJWT() {
    return this.axiosInstance.get('/validate')
  }

  deployAxiosInterceptors() {
    this.axiosInstance.interceptors.response.use(response => {
      return response
    }, error => {
      console.log(error)
      return Promise.reject(error)
    })
  }
}

export default new AuthenticationService()