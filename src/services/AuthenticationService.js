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
    const fetchError = e.response ? e.response.data.message : e.message
    console.log(fetchError)
    this.dispatch({ type: 'SET_LOGIN_STATUS', payload: false })
    this.dispatch({ type: 'SET_SHOW_LOGIN_FAILED', payload: true })    
    this.dispatch({ type: 'SET_VALIDATION_RESULT', payload: fetchError })
    return true
  })
}

AuthenticationService.prototype.registerJWTLogin = function(username, token, date) {
  localStorage.setItem(USERNAME_ATTRIBUTE_NAME, username)
  localStorage.setItem(DATE_ATTRIBUTE_NAME, date)
  this.dispatch({ type: 'SET_USERNAME', payload: username })
  this.dispatch({ type: 'SET_LOGIN_STATUS', payload: true })
  this.dispatch({ type: 'SET_SHOW_LOGIN_FAILED', payload: false })
  this.dispatch({ type: 'SET_VALIDATION_RESULT', payload: false })
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
  this.axiosInstance.post('/logout')
  .then(() => { return true },
    e => {
      this.dispatch({ type: 'SET_VALIDATION_RESULT', payload: "NETWORK_ERROR" })
      console.log(e.response ? e.response.data.message : e.message)
  })
}

AuthenticationService.prototype.loginStatus = function() {
  if(localStorage.getItem(DATE_ATTRIBUTE_NAME) < new Date().toISOString()) {
    return null
  }
  return localStorage.getItem(USERNAME_ATTRIBUTE_NAME)
}

AuthenticationService.prototype.validateLocalLogin = function() {
  let fetchError = null
  UserService.getUserByUsername(localStorage.getItem(USERNAME_ATTRIBUTE_NAME))  // reload user roles. may have been changed.
  .then(response => {
    this.dispatch({ type: 'SET_ROLES', payload: response.data.roles })
    this.dispatch({ type: 'SET_USERNAME', payload: response.data.username })
    this.dispatch({ type: 'SET_LOGIN_STATUS', payload: true })
    this.dispatch({ type: 'SET_USERID', payload: response.data.id })
    this.dispatch({ type: 'SET_VALIDATION_RESULT', payload: false })
    this.axiosInstance.get('/validate') // get request and set cookie
    .then(() => {
      return true
    })
    .catch(e => {
      fetchError = e.response ? e.response.data.message : e.message
      console.log(fetchError)
      this.dispatch({ type: 'SET_VALIDATION_RESULT', payload: fetchError })
      return false
    })  
    return true
  })
  .catch(e => {
    fetchError = e.response ? e.response.data.message : e.message
    console.log(fetchError)
    this.dispatch({ type: 'SET_VALIDATION_RESULT', payload: fetchError })
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