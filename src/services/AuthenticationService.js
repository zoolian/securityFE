import { useContext } from 'react'
import axios from 'axios'

import UserService from './UserService'
import { USERNAME_ATTRIBUTE_NAME, DATE_ATTRIBUTE_NAME, API_URL } from '../Constants'
import { Context } from '../store/Store'

function AuthenticationService() {
  [this.state, this.dispatch] = useContext(Context)
  this.axiosInstance = axios.create({
      baseURL: API_URL,
      withCredentials: true
  })
}

AuthenticationService.prototype.executeJWTAuthentication = function(username, password) {  
  this.axiosInstance.post('/authenticate', { username, password })
  .then(response => {
    this.registerJWTLogin(username, response.data.token, response.data.date)
    return false
  })
  .catch(e => {
    console.log(e)
    this.dispatch({ type: 'SET_LOGIN_STATUS', payload: false })
    this.dispatch({ type: 'SET_SHOW_LOGIN_FAILED', payload: false })
    return true
  })
}

AuthenticationService.prototype.registerJWTLogin = function(username, token, date) {
  localStorage.setItem(USERNAME_ATTRIBUTE_NAME, username)
  localStorage.setItem(DATE_ATTRIBUTE_NAME, date)
  this.dispatch({ type: 'SET_USERNAME', payload: username })
  this.dispatch({ type: 'SET_LOGIN_STATUS', payload: true })
  UserService.getUserByUsername(username)
  .then(response => {    
    this.dispatch({ type: 'SET_ROLES', payload: response.data.roles })
  })
  this.deployAxiosInterceptors(token)
}

AuthenticationService.prototype.logout = function() {
  localStorage.removeItem(USERNAME_ATTRIBUTE_NAME)
  localStorage.removeItem(DATE_ATTRIBUTE_NAME)
  this.axiosInstance.post('/logout') //, { withCredentials: false }
}

AuthenticationService.prototype.loginStatus = function() {
  if(localStorage.getItem(DATE_ATTRIBUTE_NAME) < new Date().toISOString()) {
    return null
  }
  return localStorage.getItem(USERNAME_ATTRIBUTE_NAME)
}

AuthenticationService.prototype.validate = async function() {
  //let pageRoles = []
  await UserService.getUserByUsername(localStorage.getItem(USERNAME_ATTRIBUTE_NAME))  // reload user roles. may have been changed.
  .then(response => {
    this.dispatch({ type: 'SET_ROLES', payload: response.data.roles })
    this.dispatch({ type: 'SET_USERNAME', payload: response.data.username })
    this.dispatch({ type: 'SET_LOGIN_STATUS', payload: true })
  })
  .catch(e => {
    console.log(e)
    return false
  })

  this.axiosInstance.get('/validate')
  .then(() => {    
  })
  .catch(e => {
    console.log(e)
    return false
  })
  return true
}

AuthenticationService.prototype.sendReset = (email, id) => {
  return this.axiosInstance.post('/reset/' + id, { email })
}

// TODO: build API function for validation
// AuthenticationService.prototype.validateResetUrl = () => {

// }

AuthenticationService.prototype.deployAxiosInterceptors = function() {
  this.axiosInstance.interceptors.response.use(response => {
    return response
  }, error => {
    console.log(error)
    return Promise.reject(error)
  })
}

export default AuthenticationService