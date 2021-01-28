import React, { useContext, useEffect, useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom'
import Logo from '../Logo'

import {Context} from '../../store/Store'
import AuthenticationService from '../../services/AuthenticationService.js';

const Header = (props) => {
  const [state, dispatch] = useContext(Context);
  const [authContent, setAuthContent] = useState("")
  const authService = new AuthenticationService()

  const onLogoutClicked = () => {
    dispatch({type: 'SET_TOKEN', payload: ''})
		dispatch({type: 'SET_USERNAME', payload: ''})
		dispatch({type: 'SET_ROLES', payload: []})
		dispatch({type: 'SET_LOGIN_STATUS', payload: false})
    dispatch({type: 'SET_SHOW_LOGIN_FAILED', payload: false})
    authService.logout()
	  props.history.push("/home/logout")
  }

  useEffect(() => {    
    setAuthContent(authService.loginStatus() ? (
      <ul className="navbar-nav">
        <li className="nav-item">
          <NavLink className="nav-link" to="/profile">Welcome, {authService.loginStatus()}</NavLink>
        </li>
        <li className="nav-item">
          <span className="nav-link btn" onClick={onLogoutClicked}>Logout</span>
        </li>
      </ul>
    ) : (
      <ul className="navbar-nav">
        <li className="nav-item">
          <NavLink className="nav-link" to="/auth/login">Login</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/auth/signup">Sign Up</NavLink>
        </li>
      </ul>
    ))
  },[state.id, state.loginStatus])

  return (
    <header>
      <nav className="navbar navbar-expand-md navbar-dark bg-dark justify-content-between">
        <NavLink to="/home" className="navbar-brand"><Logo/></NavLink>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/user-manager">Users</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/role-manager">Roles</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/page-manager">Page Access</NavLink>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Apps
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <a className="dropdown-item" href="https://blog.jmscottnovels.com/">Blog</a>
                <a className="dropdown-item" href="#">More to Come</a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">TBD</a>
              </div>
            </li>
          </ul>
          {authContent}          
        </div>
      </nav>
    </header>
  )
}

export default withRouter(Header)