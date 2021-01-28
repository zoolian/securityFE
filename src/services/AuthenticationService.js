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
    this.dispatch({ type: 'SET_USERID', payload: response.data.id })
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

AuthenticationService.prototype.validateLocalLogin = function() {
  UserService.getUserByUsername(localStorage.getItem(USERNAME_ATTRIBUTE_NAME))  // reload user roles. may have been changed.
  .then(response => {
    this.dispatch({ type: 'SET_ROLES', payload: response.data.roles })
    this.dispatch({ type: 'SET_USERNAME', payload: response.data.username })
    this.dispatch({ type: 'SET_LOGIN_STATUS', payload: true })
    this.dispatch({ type: 'SET_USERID', payload: response.data.id })
    this.dispatch({ type: 'SET_VALIDATION_RESULT', payload: false })
    return true
  })
  .catch(e => {
    let fetchError = e.message || e.response.data
    console.log(fetchError)
    this.dispatch({ type: 'SET_VALIDATION_RESULT', payload: "No Profile" })
    return false
  })

  this.axiosInstance.get('/validate')
  .then(() => {
    return true
  })
  .catch(e => {
    let fetchError = e.message || e.response.data
    console.log(fetchError)
    this.dispatch({ type: 'SET_VALIDATION_RESULT', payload: "Token Expired" })
    return false
  })  
}

AuthenticationService.prototype.validatePageAccess = function(pageId, userId) {
  return this.axiosInstance.get(`/validate-page-access/${pageId}/${userId}`)
}

AuthenticationService.prototype.sendReset = (email, id) => {
  return this.axiosInstance.post('/reset/' + id, { email })
}

// TODO: build API method for password reset url validation
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