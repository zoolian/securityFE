import axios from 'axios'

class RoleService {
  constructor() {
    this.instance = axios.create({
      baseURL: 'http://localhost:8080/security',
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
    if(id != -1) {
      return this.instance.put(`/roles/${id}`, role)
    }
    return this.instance.post(`/roles`, role)
  }

  getInstance() {
    return this.instance
  }
  
}

export default new RoleService()