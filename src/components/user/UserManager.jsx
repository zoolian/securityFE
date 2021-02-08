import React, { useState, useEffect, useContext } from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'redux'

import UserService from '../../services/UserService'
import UserCard from './UserCard'
import Spinner from '../ui/Spinner'
import withNetHandler from '../hoc/withNetErrHandler'
import AuthenticationService from '../../services/AuthenticationService'
import { USER_MANAGER_ID as PAGE_ID } from '../../Constants'
import { Context } from '../../store/Store'
import { handleError } from '../../utils/handleError'

const UserManager = (props) => {
  const [users, setUsers] = useState([])
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
      props.history.push("/auth/login/user-manager")
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
				if(response.data) loadUsers()
			})
			.catch(e => {
				setError(handleError(e, "auth: validatePageAccess"))
			})
		}
	},[state.id])

  const loadUsers = () => {
    UserService.getUsersAll()
    .then(response => {
      setUsers(response.data)
    })
    .catch(e => { // CONSIDER: forward to error page
      setError(handleError(e, "user list GET"))
    })
  }

  const onShowDisabledClicked = () => {
    setShowDisabled(!showDisabled)
  }

  const addUserClicked = () => {
    props.history.push('/user-form/new')
  }

  // use Reactstrap or something similar to dynamically set btn-primary vs btn-secondary or something
  if(!authService.loginStatus()) {
    props.history.push("/auth/login/user-manager")
    return null
  }

  let cards = []
  const currentButtonClasses = showDisabled ? "btn-over btn btn-primary" : "btn-over btn btn-secondary"

  if(users.length) {
    cards = (        
      users.map((user) => (
        <UserCard key={user.id} username={user.username} firstName={user.firstName} lastName={user.lastName} email={user.email} enabled={user.enabled} roles={user.roles} showDisabled={showDisabled} id={user.id} />
      ))
    )
  }

  if(!error && !cards.length) return <Spinner/>

  return !error ? (
    <div className="container-fluid">
      <h1 className="my-3">User list</h1>
      <div className="container-fluid mb-5 pb-5">
        <div className="row">
          {cards}
        </div>
        <div className="d-flex justify-content-between fixed-bottom m-5">
          <button className="btn-over btn btn-success btn-lg" onClick={addUserClicked} >Add new user</button>
          <button onClick={onShowDisabledClicked} className={currentButtonClasses}>{showDisabled ? 'Hide disabled users' : 'Show disabled users' }</button>
        </div>
      </div>
    </div>
  ) : error
}

export default compose(withRouter, withNetHandler)(UserManager, UserService.getInstance())