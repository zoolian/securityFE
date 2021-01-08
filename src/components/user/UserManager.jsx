import React, { useState, useEffect, useContext } from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'redux'

import UserService from '../../services/UserService'
import PageService from '../../services/PageService'
import UserCard from './UserCard'
import withNetHandler from '../hoc/withNetErrHandler'
import AuthenticationService from '../../services/AuthenticationService'
import { USER_MANAGER_ID as PAGE_ID } from '../../Constants'
import { Context } from '../../store/Store'

const UserManager = (props) => {
  const [users, setUsers] = useState([])
  const [showDisabled, setShowDisabled] = useState(false)
  const [state] = useContext(Context)
  const authService = new AuthenticationService()
  const [error, setError] = useState(false)
  

  useEffect(() => {
    if(!authService.loginStatus()) {
      props.history.push("/auth/login/user-manager")
      return null
    }

    if(!authService.validate(PAGE_ID)) { setError(<h3>Token expired</h3>) }
  },[])

  // comment
  // TODO: change this to backend logic/API call
  useEffect(() => {
    let auth = false
    if(state.roles.length && !auth) {
      PageService.getPageById(PAGE_ID)
      .then(response => {
        state.roles.forEach(userRole => {
          response.data.roles.forEach(pageRole => {
            if (pageRole.id === userRole.id) {
              loadUsers()
              auth = true
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

  const loadUsers = () => {
    UserService.getUsersAll()
    .then(response => {
      setUsers(response.data)
    })
    .catch(e => { // CONSIDER: forward to error page, or return error div
      let fetchError = e.message || e.response.data
      console.log(fetchError)
      setError(<h3>{fetchError}</h3>)
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
        <UserCard key={user.id} username={user.username} enabled={user.enabled} roles={user.roles} {...user.person} showDisabled={showDisabled} id={user.id} />
      ))
    )
  }

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