import axios from 'axios'

class PageService {
  constructor() {
    this.instance = axios.create({
      baseURL: 'http://localhost:8080/security',
      withCredentials: true
    })
  }

  getPagesAll() {
    return this.instance.get(`/pages/`)
  }

  getPageById(id) {
    return this.instance.get(`/pages/id/${id}`)
  }

  deletePage(id) {
    return this.instance.delete(`/pages/${id}`)
  }

  createOrUpdatePage(id, page) {
    if(id != -1) {
      return this.instance.put(`/pages/${id}`, page)
    }
    return this.instance.post(`/pages`, page)
  }

  getInstance() {
    return this.instance
  }
  
}

export default new PageService()