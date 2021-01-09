import axios from 'axios'

import { SECURITY_API_URL } from '../Constants'

class RoleService {
  constructor() {
    this.instance = axios.create({
      baseURL: SECURITY_API_URL,
      withCredentials: true
    })
  }

  getRolesAll() {
    return this.instance.get(`/roles`)
  }

  getRoleById(id) {
    return this.instance.get(`/roles/id/${id}`)
  }

  deleteRole(id) {
    return this.instance.delete(`/roles/${id}`)
  }

  createOrUpdateRole(id, role) {
    if(id !== "new") {
      return this.instance.put(`/roles/${id}`, role)
    }
    return this.instance.post(`/roles`, role)
  }

  getInstance() {
    return this.instance
  }
  
}

export default new RoleService()