import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom'

import RoleService from '../../services/RoleService';
import PageService from '../../services/PageService';
import RoleCard from './RoleCard'
import Spinner from '../ui/Spinner'
import AuthenticationService from '../../services/AuthenticationService';
import { ROLE_MANAGER_ID as PAGE_ID } from '../../Constants'
import { Context } from '../../store/Store'

const RoleManager = (props) => {
  const [roles, setRoles] = useState([])
  const [showDisabled, setShowDisabled] = useState(false)
  const [state] = useContext(Context)
  const authService = new AuthenticationService()
  const [error, setError] = useState(false)
  let auth = false

  useEffect(() => {
    if(!authService.loginStatus()) {
      props.history.push("/auth/login/role-manager")
      return null
    }

    if(!authService.validate(PAGE_ID)) setError(<h3>Token expired</h3>) 
  },[])

  useEffect(() => {
    if(state.roles.length && !auth) {
      PageService.getPageById(PAGE_ID)
      .then(response => {
        state.roles.map(userRole => {
          if(response.data.roles.some(pageRole => { return pageRole.id === userRole.id })) {
            loadRoles()
            auth = true
          }
          setError(auth ? false : <h3>Access Denied</h3>)
        })
      })
      .catch(e => {
        console.log(e)
        setError(<h3>Access Denied</h3>)
      })
    }
  },[state])

  const loadRoles = () => {
    RoleService.getRolesAll()
    .then(response => {
      setRoles(response.data)
    })
    .catch(e => { // FIX ME: forward to error page?
      let fetchError = e.message || e.response.data
      console.log(fetchError)
      setError(<h3>{fetchError}</h3>)
    })
  }

  const onShowDisabledClicked = () => {
    setShowDisabled(!showDisabled)
  }

  const addRoleClicked = () => {
    props.history.push('/role-form/-1')
  }

  // use Reactstrap or something similar to dynamically set btn-primary vs btn-secondary or something
  let cards = error || <Spinner/>
  const currentButtonClasses = showDisabled ? "btn-over btn btn-primary" : "btn-over btn btn-secondary"
  // let classes = ['btn']
  // this.state.showDisabled ? classes.push('btn-primary') : classes.push('btn-secondary')
  //  . . . {classes.join(' ')} ... for the className

  if(roles.length) {
    cards = (        
      roles.map((role) => (
        <RoleCard key={role.id} name={role.name} enabled={role.enabled} description={role.description} showDisabled={showDisabled} id={role.id} />
      ))
    )
  }

  return !error ? (
    <div className="container-fluid">
      <h1 className="my-3">Security role list</h1>
      <div className="container-fluid mb-5 pb-5">
        <div className="row">
        {cards}
        </div>
        <div className="d-flex justify-content-between fixed-bottom m-5">
          <button className="btn-over btn btn-success btn-lg" onClick={addRoleClicked} >Add new</button>
          <button onClick={onShowDisabledClicked} className={currentButtonClasses}>{showDisabled ? 'Hide disabled roles' : 'Show disabled roles' }</button>
        </div>          
      </div>
    </div>
  ) : error
  
}

export default withRouter(RoleManager)