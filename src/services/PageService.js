import axios from 'axios'

import { SECURITY_API_URL } from '../Constants'

class PageService {
  constructor() {
    this.instance = axios.create({
      baseURL: SECURITY_API_URL,
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
    if(id !== "new") {
      return this.instance.put(`/pages/${id}`, page)
    }
    return this.instance.post(`/pages`, page)
  }

  getInstance() {
    return this.instance
  }
  
}

export default new PageService()