import React, { useEffect, useState } from 'react'
import Modal from '../ui/Modal'

const withNetErrHandler = (Child, axios) => {
	const WithNetErrHandler = props => {
    const [error, setError] = useState(null)
    const requestInterceptor = axios.interceptors.request.use(
      request => {
        setError(null)
        return request
      }
		)
		
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        setError(error.response ? error.response.data : error.message)
        return Promise.reject(error)
      }
		)
		
    useEffect(
      () => {
        return () => {
          axios.interceptors.request.eject(requestInterceptor)
          axios.interceptors.response.eject(responseInterceptor)
        }
      },
      [requestInterceptor, responseInterceptor]
		)
		
		// REVIEW: look at this.state.error and grab header and content for modal?
    return <>
      <Modal show={error} header="network error" content={error} toggle={() => setError(null)} />
			<Child {...props} />
    </>
  }
  return WithNetErrHandler		
}

export default withNetErrHandler