import React, { useState, useContext, useEffect } from 'react';
import { withRouter } from 'react-router-dom'
import { compose } from 'redux'

import PageService from '../../services/PageService';
import AuthenticationService from '../../services/AuthenticationService';
import Spinner from '../ui/Spinner'
import withNetHandler from '../hoc/withNetErrHandler'
import PageCard from './PageCard';
import { PAGE_MANAGER_ID as PAGE_ID } from '../../Constants'
import { Context } from '../../store/Store'

const PageManager = (props) => {
  const [pages, setPages] = useState([])
  const [showDisabled, setShowDisabled] = useState(false)
  const [state] = useContext(Context)
  const authService = new AuthenticationService()
  const [error, setError] = useState(false)
  
  useEffect(() => {
    if(!authService.loginStatus()) {
      props.history.push("/auth/login/page-manager")
      return
    }

    if(!authService.validate(PAGE_ID)) { setError(<h3>Token expired</h3>) }
  },[])

  useEffect(() => {
    let auth = false
    if(state.roles.length && !auth) {
      PageService.getPageById(PAGE_ID)
      .then(response => {
        state.roles.forEach(userRole => {
          response.data.roles.forEach(pageRole => {
            if (pageRole.id === userRole.id) {
              loadPages()
              auth= true
            }
            setError(auth ? false : <h3>Access Denied</h3>)
          })
        })
      })
      .catch(e => {
        console.log(e)
        setError(<h3>Access Denied</h3>)
      })
    }    
  },[state])

  const loadPages = () => {
    PageService.getPagesAll()
    .then(response => {
      setPages(response.data)
    })
    .catch(e => {
      let fetchError = e.message || e.response.data
      console.log(fetchError)
      setError(<h3>{fetchError}</h3>)
    })
  }

  const onShowDisabledClicked = () => {
    setShowDisabled(!showDisabled)
  }

  const addPageClicked = () => {
    props.history.push('/page-form/new')
  }

  // use Reactstrap or something similar to dynamically set btn-primary vs btn-secondary or something
  let cards = error || <Spinner/>
  const currentButtonClasses = showDisabled ? "btn-over btn btn-primary" : "btn-over btn btn-secondary"
  // let classes = ['btn']
  // this.state.showDisabled ? classes.push('btn-primary') : classes.push('btn-secondary')
  //  . . . {classes.join(' ')} ... for the className

  if(pages.length) {
    cards = (
      pages.map((page) => (
        <PageCard key={page.id} page={page} loadPages={loadPages} showDisabled={showDisabled} />
      ))
    )
  }

  return (
    <div className="container-fluid">
      <h1 className="my-3">Site pages with security management</h1>
      <div className="container-fluid mb-5 pb-5">
        <div className="row">
          {cards}
        </div>
        <div className="d-flex justify-content-between fixed-bottom m-5">
          <button className="btn-over btn btn-success btn-lg" onClick={addPageClicked}>Add page for access management</button>        
          <button onClick={onShowDisabledClicked} className={currentButtonClasses}>{showDisabled ? 'Hide disabled pages' : 'Show disabled pages' }</button>
        </div>
      </div>
    </div>
  )
}

export default compose(withRouter, withNetHandler)(PageManager, PageService.getInstance())