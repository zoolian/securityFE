import axios from 'axios'

import { API_URL, SIGNUP_API_URL } from '../Constants'

class UserService {
  constructor() {
    this.instance = axios.create({
      baseURL: API_URL,
      withCredentials: true
    })
  }
  
  getUsersAll() {
    return this.instance.get(`/users/`)
  }

  getUserById(id) {
    return this.instance.get(`/users/id/${id}`)
  }

  getUserByUsername(username) {
    return this.instance.get(`/users/username/${username}`)
  }
  
  getUserByEmail(email) {
    return this.instance.get(`/users/email/${email}`)
  }

  deleteUser(id) {
    return this.instance.delete(`/users/${id}`)
  }

  createOrUpdateUser(id, user) {
    if(id !== "new") {
      return this.instance.put(`/users/${id}`, user)
    }
    return this.instance.post(`/users`, user)
  }

  updatePassword(userId, password) {
    const passwordObject = {
      userId,
      password
    }
    return this.instance.put(`/users/secret/${userId}`, passwordObject)
  }

  signup(user) {
    return axios.post(SIGNUP_API_URL, user)
  }

  getInstance() {
    return this.instance
  }
  
}

export default new UserService()