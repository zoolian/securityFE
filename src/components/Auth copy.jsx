import React, { useState, useEffect, useContext } from 'react';
import { Link, withRouter } from 'react-router-dom'

import UserService from '../services/UserService'
import Input from './ui/Input'
import validate from '../utils/validate.js'
import AuthenticationService from '../services/AuthenticationService'
import {Context} from '../store/Store'
import { USERNAME_ATTRIBUTE_NAME, DATE_ATTRIBUTE_NAME } from '../Constants'

const Auth = (props) => {
	//const [password, setPassword] = useState('')
	const [user, setUser] = useState({
    id: props.match.params.id || null,
    username: '',
		person: {},
		password: '',
    enabled: true
	})
	const [state, dispatch] = useContext(Context);
	const [fetchError, setFetchError] = useState(null)
  const [pageValid, setPageValid] = useState(true)
  const { signUp } = props
  const authService = new AuthenticationService

// ----------------------- VALIDATION RULES -----------------------
	const [usernameValid, setUsernameValid] = useState({
    isValid: true,
    rules: {
      required: true,
      minLength: 4
    }
	})
	const [passwordValid, setPasswordValid] = useState({
    isValid: true,
    rules: {
      required: true,
      minLength: 4
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
	// ----------------------- VALIDATION RULES, END -----------------------
	
	useEffect(() => {
    if(!user.id || user.id == -1) {
      return
    }
    
    UserService.getUserById(user.id)
    .then(response => {
      setUser(response.data)
    })
    .catch(e => { // CONSIDER: forward to error page, or return error div
      let error = e.message || e.response.data
      console.log(error)
      setFetchError(<div>Exception in fetching users: {error}</div>)
    })
  },[])

  useEffect(() => {
    if(state.loginStatus) { props.history.push("/home") }
  },[state])

	const onSubmit = (event) => {
		event.preventDefault()

    if(!pageValid) return

		if(props.signUp) {
			UserService.createOrUpdateUser(user.id, user)
			.then((response) => {
				props.history.push("/user-manager")
      })
      .catch((error) => {
				console.log(error)
			})
		} else {
			authService.executeJWTAuthentication(user.username, user.password)
			// .then(response => {	// CONSIDER: dispath token would go here
			// 	localStorage.setItem(USERNAME_ATTRIBUTE_NAME, user.username)
    	// 	localStorage.setItem(DATE_ATTRIBUTE_NAME, response.data.date)
			// 	UserService.getUserByUsername(user.username)
			// 	.then(response => {
			// 		dispatch({type: 'SET_USERNAME', payload: user.username})
			// 		dispatch({type: 'SET_ROLES', payload: response.data.roles})
			// 		dispatch({type: 'SET_LOGIN_STATUS', payload: true})
			// 	})
			// 	.catch(e => {
			// 		console.log(e)
			// 	})
			// })
			// .catch(e => {
			// 	console.log(e)
			// 	dispatch({type: 'SET_LOGIN_STATUS', payload: false})
			// 	dispatch({type: 'SET_SHOW_LOGIN_FAILED', payload: false})
			// })
		}		
  }

  const inputChange = (event, setter, obj, alteration, rule, ruleSetter) => {
		const isValid = validate(event.target.value, rule)
    setter({ ...obj, ...alteration })
    if(rule && ruleSetter) {
      ruleSetter({ ...rule, isValid })
		}
		setPageValid(isValid)
	}
	
	if(state.loginStatus) {
		props.history.push('/user-manager')
	}
	if(fetchError) return fetchError

	return (
		<>
			<h1 className="ml-2 d-inline">{signUp ? 'Welcome! Create your profile' : 'Enter Credentials'}</h1>
			<div className="container">
				<form onSubmit={onSubmit}>
					<Input elementType="input" name="username" value={user.username} label="Username" isValid={usernameValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setUser, user, { username: event.target.value }, usernameValid, setUsernameValid)
            }}
          />

					<Input elementType="password" name="password" value={user.password} label="Password" isValid={passwordValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setUser, user, { password: event.target.value }, passwordValid, setPasswordValid)
            }}
          />

					<Input elementType="input" name="firstName" value={user.person.firstName} label="First Name" isValid={firstNameValid.isValid} show={signUp}
            changed={(event) => {
              inputChange(event, setUser, user, { person: {...user.person, firstName: event.target.value} }, firstNameValid, setFirstNameValid)
            }}
          />
          
          <Input elementType="input" name="lastName" value={user.person.lastName} label="Last Name" isValid={lastNameValid.isValid} show={signUp}
            changed={(event) => {
              inputChange(event, setUser, user, { person: {...user.person, lastName: event.target.value} }, lastNameValid, setLastNameValid)
            }}          
          />

          <Input elementType="input" name="email" value={user.person.email} label="Email" isValid={emailValid.isValid} show={signUp}
            changed={(event) => {
              inputChange(event, setUser, user, { person: {...user.person, email: event.target.value} }, emailValid, setEmailValid)
            }}
          />
					<input className="btn btn-primary" type="submit" value={signUp ? 'Submit' : 'Login'} />
				</form>
				<div>
					<span>{signUp ? "already a user?" : "need to create a profile?" }</span>
					<Link to={'/auth/' + (signUp ? 'login' : 'signup')}>Sign{ signUp ? " In" : "up"}</Link>
				</div>
				
			</div>
		</>		
	)
}

export default withRouter(Auth)