import React, {useState, useEffect, useContext} from 'react'

import UserService from '../services/UserService'
import Input from './ui/Input'
import validate from '../utils/validate.js'
import AuthenticationService from '../services/AuthenticationService'
import { Context } from '../store/Store'

const Profile = (props) => {
	const [user, setUser] = useState({  // this is the form user fields
    id: props.match.params.id || null,
    username: '',
		person: {}
	})
	const [password, setPassword] = useState('')
	const [state] = useContext(Context)
	const [error, setError] = useState(null)
	const [pageValid, setPageValid] = useState(true)
	const authService = new AuthenticationService()
	const [passwordField, setPasswordField] = useState(false)
	const [showSaveSuccess, setShowSaveSuccess] = useState(false)

	// ----------------------- VALIDATION RULES -----------------------
		const [passwordValid] = useState({
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
    authService.validate(PAGE_ID)
  },[])

  useEffect(() => {
    if(!authService.loginStatus()) {
      props.history.push("/auth/login/user-manager")
      return null
    }

    if(state.validationResult) {
      authService.logout()
      setTimeout(() => setError(<h3>{state.validationResult}</h3>), 3000)
      props.history.push("/auth/login")
    }
  },[state.validationResult])
	
	const fetchUser = () => {
		UserService.getUserByUsername(authService.loginStatus())
    .then(response => {
      setUser(response.data)
    })
    .catch(e => { // CONSIDER: forward to error page, or return error div
      let error = e.message || e.response.data
      console.log(error)
      setError(<div>Exception in fetching users: {error}</div>)
    })
	}

	useEffect(() => {
    fetchUser()
	},[])
	
	const onSubmit = (event) => {
		event.preventDefault()

    if(!pageValid) return

		UserService.createOrUpdateUser(user.id, user)
		.then(() => {
			resetPage()
    })
    .catch(e => {
      let error = e.message || e.response.data
      console.log(error)
      setError(<div>Exception in saving user: {error}</div>)
		})
		
		if(password) {
			UserService.updatePassword(user.id, password)
			.then(() => {
				resetPage()
			})
			.catch(e => {
				let error = e.message || e.response.data
				console.log(error)
				setError(<div>Exception in saving password: {error}</div>)
			})
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

	const resetPage = () => {
		setShowSaveSuccess(true)
		setTimeout(() => setShowSaveSuccess(false), 4000)
		setPasswordField(false)
	}

	const onCancelClicked = () => {
		setPasswordField(false)
		setPassword('')
		fetchUser()
	}

	return !error ? (
		<>
			<h1 className="ml-2 d-inline">{ state.username }'s profile</h1>
			<div className="container">
				<form onSubmit={onSubmit}>
					
					<Input elementType="input" name="firstName" value={user.person.firstName} label="First Name" isValid={firstNameValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setUser, user, { person: {...user.person, firstName: event.target.value} }, firstNameValid, setFirstNameValid)
            }}
          />
          
          <Input elementType="input" name="lastName" value={user.person.lastName} label="Last Name" isValid={lastNameValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setUser, user, { person: {...user.person, lastName: event.target.value} }, lastNameValid, setLastNameValid)
            }}
          />

          <Input elementType="input" name="email" value={user.person.email} label="Email" isValid={emailValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setUser, user, { person: {...user.person, email: event.target.value} }, emailValid, setEmailValid)
            }}
          />
					<Input elementType="password" name="password" value={password} label="Password" isValid={passwordValid.isValid} show={passwordField}
            changed={(event) => {
							setPassword(event.target.value)
							validate(event.target.value, pageValid)
						}}
          />

					<div className="d-flex justify-content-between m-1">
						<input className="btn btn-primary btn-lg" type="submit" value='Save' />
						<div>
							<button type="button" onClick={() => setPasswordField(!passwordField)} className={"btn btn-primary btn-lg mx-1 " + (passwordField ? 'd-none' : '')}>{passwordField ? '' : 'Set Password' }</button>
							<button type="button" onClick={onCancelClicked} className="btn btn-danger btn-lg mx-1">Cancel Changes</button>
						</div>
					</div>					
				</form>
				<h2 className={showSaveSuccess ? '' : 'd-none'}>Changes successfully saved</h2>
			</div>
		</>		
	) : error
}

export default Profile