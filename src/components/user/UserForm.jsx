import React, { useState, useEffect, useContext } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { compose } from 'redux'

import UserService from '../../services/UserService'
import RoleService from '../../services/RoleService'
import PageService from '../../services/PageService'
import Modal from '../ui/Modal'
import withNetHandler from '../hoc/withNetErrHandler'
import Input from '../ui/Input'
import Spinner from '../ui/Spinner'
import useStateWithPromise from '../hoc/useStateWithPromise'
import validate from '../../utils/validate.js'
import AuthenticationService from '../../services/AuthenticationService';
import { USER_FORM_ID as PAGE_ID } from '../../Constants'
import { Context } from '../../store/Store'

// CONSIDER: implement an email send here for a new user to set a password. maybe open the signup page with fields populated

const UserForm = (props) => {
  const [user, setUser] = useStateWithPromise({
    id: props.match.params.id || null,
    username: '',
    firstName: '',
		lastName: '',
		email: '',
    roles: [],
    enabled: true
  })
  const [allRoles, setAllRoles] = useStateWithPromise([])
  const [modalHeader, setModalHeader] = useState('')
  const [modalContent, setModalContent] = useState('')
  const [pageValid, setPageValid] = useState(true)
  const [state] = useContext(Context) // this is the logged in user state
  const authService = new AuthenticationService()
  const [error, setError] = useState(false)
    
  // ----------------------- VALIDATION RULES -----------------------
  const [usernameValid, setUsernameValid] = useState({
    isValid: true,
    rules: {
      required: true,
      minLength: 5
    }
  })
  const [firstNameValid, setFirstNameValid] = useState({
    isValid: true,
    rules: {
      required: true,
      minLength: 2
    }
  })
  const [lastNameValid, setLastNameValid] = useState({
    isValid: true,
    rules: {
      required: true,
      minLength: 2
    }
  })
  const [emailValid, setEmailValid] = useState({
    isValid: true,
    rules: {
      required: true,
      isEmail: true
    }
  })
  const [ageValid, setAgeValid] = useState({
    isValid: true,
    rules: {
      required: false,
      isNumber: true
    }
  })
  // ----------------------- VALIDATION RULES, END -----------------------

  // const errorClasses = 'alert alert-warning py-1 mb-1 small' // add this if we want to show error messages under fields

  const loadUser = async(data) => {
    const { username, enabled, roles, person } = data
    await setUser({...user, 
      username,
      person,
      enabled,
      roles
    })
  }

  const loadAllRoles = async(data) => {
    await setAllRoles(data)
  }

  useEffect(() => {
    if(!authService.loginStatus()) {
      props.history.push("/auth/login")
      return
    }

    if(!authService.validate(PAGE_ID)) {
      setError(<div>Token expired</div>)
      return
    }
    loadRoles()
  },[])

  useEffect(() => {
		if(state.id) {
			authService.validatePageAccess(PAGE_ID, state.id)
			.then(response => {
				setError(response.data ? false : <h3>Access Denied</h3>)
				if(response.data && user.id !=="new") fetchUser()
			})
			.catch(e => {
				console.log(e.response.data.message)
				setError(<div>Exception in access validation: {e.response.data.message}</div>)
			})
		}
  },[state.id])

  const fetchUser = () => { 
    UserService.getUserById(user.id)
    .then(response => {
      loadUser(response.data)
    })
    .catch(e => { // CONSIDER: forward to error page, or return error div
      let error = e.message || e.response.data
      console.log(error)
      setError(<div>Exception in fetching users: {error}</div>)
    })    
  }

  const loadRoles = () => {
    RoleService.getRolesAll()
    .then(response => {
      loadAllRoles(response.data)
    })
    .catch(e => { // CONSIDER: forward to error page, or return error div
      let error = e.message || e.response.data
      console.log(error)
      setError(<div>Exception in fetching roles: {error}</div>)
    })
  }

  // initialize security roles for page UI, ie checkboxes and hovering
  useEffect(() => {
    let initialRoles = [...allRoles]
    // if the array exists but the hover property has not been set then we're ready to init allRoles
    if(allRoles.length && allRoles[0].hover === undefined && ( user.username.length || user.id === "new" )) {
      allRoles.forEach((role, index) => {
        if(user.username.length) {
          initialRoles[index].checked = user.roles.some(userRole => { return userRole.id === role.id })
        } else initialRoles[index].checked = false
        
        initialRoles[index].hover = false
      })
      setAllRoles(initialRoles)
    }    
  },[allRoles, user])

  // user object persistence with screen state/the entire list needs to be on the screen, but the user should not have the whole list
  // construct array of roles from what was checked.
  const setUserRoles = (roles) => {    
    let newUserRoles = []
    
    roles.forEach((role) => {
      role.checked && newUserRoles.push({ id: role.id })
    })
    setUser({...user, roles: newUserRoles})
  }

  // new array so that a specific one can be set, then call setter for the state array
  const alterRole = (alterations, index) => {
    let newRoles = [...allRoles]
    let newRole = {}
    newRole = { ...newRoles[index], ...alterations }
    newRoles[index] = newRole
    setAllRoles(newRoles)
    return newRoles
  }
  // TODO: grab description on hover
  // const onRoleHover = (hover, index) => {
  //   alterRole({hover}, index)
  // }

  // on a checkbox event, set the page state and the user object for updating on submit
  const onRoleChecked = (checked, index) => {
    setUserRoles(alterRole({checked}, index))
  }

  // callback function for shutting it off
  const toggleModal = (header, description) => {
    setModalContent(modalContent.length ? '' : description)
    setModalHeader(modalHeader.length ? '' : header)
  }

  const deleteUserClicked = () => { // TODO: verify logged in
    UserService.deleteUser(user.id)
    .then(response => {
      console.log(`Piss off ghost ${user.id}! He's frickin gone.`, response)
      props.history.push("/user-manager")
    })
  }

  const onSubmit = (event) => {
    event.preventDefault()

    if(!pageValid) return

    UserService.createOrUpdateUser(user.id, user)
    .then(() => {
      props.history.push("/user-manager")
    }, (error) => {
      console.log(error)
    })
  }

  const inputChange = (event, setter, obj, alteration, rule, ruleSetter) => {
		const isValid = validate(event.target.value, rule)
    setter({ ...obj, ...alteration })
    if(rule && ruleSetter) {
      ruleSetter({ ...rule, isValid })
		}
		setPageValid(isValid)
	}

  // CONSIDER: edit button next to each role that routes to the edit page for it
  if(error) return error
  if(allRoles.length && allRoles[0].hover === undefined) {
    return <Spinner />
  }
  return (
    <>
      <div>
        <h1 className="ml-2 d-inline">{user.id ? `${user.username}` : 'New user'}</h1>
        {user.id ? <small className="m-2 float-right d-inline">ID: {user.id}</small> : ''}
      </div>
      <Modal show={modalContent.length ? true : false} content={modalContent} header={modalHeader} toggle={toggleModal} />

      <div className="container">
        <form onSubmit={onSubmit}>
          <Input elementType="input" name="username" value={user.username} label="Username" isValid={usernameValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setUser, user, { username: event.target.value }, usernameValid, setUsernameValid)
            }}
          />
          <Input elementType="input" name="firstName" value={user.firstName} label="First Name" isValid={firstNameValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setUser, user, { firstName: event.target.value}, firstNameValid, setFirstNameValid)
            }}
          />
          
          <Input elementType="input" name="lastName" value={user.lastName} label="Last Name" isValid={lastNameValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setUser, user, { lastName: event.target.value }, lastNameValid, setLastNameValid)
            }}          
          />
          <Input elementType="input" name="email" value={user.email} label="Email" isValid={emailValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setUser, user, { email: event.target.value }, emailValid, setEmailValid)
            }}
          />
          <Input elementType="input" name="age" value={user.age} label="Age" isValid={ageValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setUser, user, { age: event.target.value }, ageValid, setAgeValid)
            }}
          />
          <Input elementType="checkbox" name="enabled" value={user.enabled} checked={user.enabled} label="Enabled" show={true}
            changed={() => {
              setUser({...user, enabled: !user.enabled})
            }}
          />
          
          <fieldset>
            <legend className="pt-3">User security roles</legend>
            <ul className="list-group pb-3">
              {allRoles && allRoles.length > 0 ? (
                allRoles.map((role, index) => (
                  <li className="list-group-item">
                    <label key={index} >
                    <input key={index} type="checkbox" name={role.id} value={allRoles[index].checked} checked={allRoles[index].checked}
                      onChange={() => onRoleChecked(!allRoles[index].checked, index)}/>
                  {role.name}</label>
                  </li>                  
                ))
              ) : (<p>Loading...</p>)
              }
            </ul>
          </fieldset>
          <input className="btn btn-primary" type="submit" value="Save" />
        </form>
        <button
          className="btn btn-danger float-right delete"
          onClick={() => { if (window.confirm('Delete page? This kick is permanent.')) deleteUserClicked(user.id) } }
        ><small>Delete this user</small></button>
      </div>
    </>
  )
}

UserForm.propTypes = {
  loadUsers: PropTypes.func
}

export default compose(withRouter, withNetHandler)(UserForm, UserService.getInstance())

