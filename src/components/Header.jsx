import React, { useContext } from 'react';
import { NavLink, withRouter } from 'react-router-dom'
import Logo from './Logo'

import {Context} from '../store/Store'
import AuthenticationService from '../services/AuthenticationService.js';

const Header = (props) => {
  const [state, dispatch] = useContext(Context);
  const authService = new AuthenticationService()
  const username = authService.loginStatus()

  const onLogoutClicked = () => {
    dispatch({type: 'SET_TOKEN', payload: ''})
		dispatch({type: 'SET_USERNAME', payload: ''})
		dispatch({type: 'SET_ROLES', payload: []})
		dispatch({type: 'SET_LOGIN_STATUS', payload: false})
    dispatch({type: 'SET_SHOW_LOGIN_FAILED', payload: false})
    authService.logout()
	  props.history.push("/home/logout")
  }

  // authService.loginStatus() or state.loginStatus ??
  let authContent =  username ? (
    <ul className="navbar-nav navbar-collapse justify-content-end">
      <li className="nav-item">
        <NavLink className="nav-link" to="/profile">Welcome, {username}</NavLink>
      </li>
      <li className="nav-item">
        <span className="nav-link btn" onClick={onLogoutClicked}>Logout</span>
      </li>
    </ul>
  ) : (
    <ul className="navbar-nav navbar-collapse justify-content-end">
      <li className="nav-item">
        <NavLink className="nav-link" to="/auth/login">Login</NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/auth/signup">Sign Up</NavLink>
      </li>
    </ul>
  )

  return (
    <header>
      <nav className="navbar navbar-expand-md navbar-dark bg-dark">
        <NavLink to="/home" className="navbar-brand"><Logo/></NavLink>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link" to="/user-manager">Users</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/role-manager">Roles</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/page-manager">Page Access</NavLink>
            </li>
          </ul>
          {authContent}          
        </div>
      </nav>
    </header>
  )
}

export default withRouter(Header)