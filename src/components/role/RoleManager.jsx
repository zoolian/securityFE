import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom'

import RoleService from '../../services/RoleService';
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
  
  useEffect(() => {
    if(authService.loginStatus()) {
      authService.validateLocalLogin(PAGE_ID)
    }
  },[])

  useEffect(() => {
    if(!authService.loginStatus()) {
      props.history.push("/auth/login/role-manager")
      return null
    }

    if(state.validationResult) {
      authService.logout()
      setError(<h3>{state.validationResult}</h3>)
      setTimeout(() => props.history.push("/auth/login"), 3000)      
    }
  },[state.validationResult])

  useEffect(() => {
		if(state.id) {
			authService.validatePageAccess(PAGE_ID, state.id)
			.then(response => {
				setError(response.data ? false : <h3>Access Denied</h3>)
				if(response.data) loadRoles()
			})
			.catch(e => {
				console.log(e.response.data.message)
				setError(<div>Exception in access validation: {e.response.data.message}</div>)
			})
		}
	},[state.id])

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
    props.history.push('/role-form/new')
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