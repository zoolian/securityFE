import axios from 'axios'

class UserService {
  constructor() {
    this.instance = axios.create({
      baseURL: 'http://localhost:8080/security',
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

  deleteUser(id) {
    return this.instance.delete(`/users/${id}`)
  }

  createOrUpdateUser(id, user) {
    if(id != -1) {
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
    return axios.post('http://localhost:8080/signup', user)
  }

  getInstance() {
    return this.instance
  }
  
}

export default new UserService()