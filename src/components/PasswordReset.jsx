import React, {useState} from 'react'
import {Link, withRouter} from 'react-router-dom'

import UserService from '../services/UserService'
import Input from './ui/Input'
import validate from '../utils/validate.js'
//import AuthenticationService from '../services/AuthenticationService'

const PasswordReset = (props) => {
	const [error, setError] = useState(null)
	const [password, setPassword] = useState('')
	const [confirmedPassword, setConfirmedPassword] = useState('')
	const [pageValid] = useState(true)
	const [showSaveSuccess, setShowSaveSuccess] = useState(false)
	// TODO: build method for decrypting url and pull id from that
	const { id } = props.match.params

	// ----------------------- VALIDATION RULES -----------------------
	const [passwordValid] = useState({
    isValid: true,
    rules: {
      required: true,
			minLength: 5
    }
	})

  const [confirmedPasswordValid] = useState({
    isValid: true,
    rules: {
			required: true,
			minLength: 5,
			matches: passwordValid
    }
  })
	// ----------------------- VALIDATION RULES, END -----------------------

	// TODO: build url generator. Build validateResetUrl on backend
	// const validateUrl = () => {
	// 	AuthenticationService.validateResetUrl(window.location.pathname.split('/ZX').pop())
	// 	.then(() => {
	// 		// decrypt url path to grab user id and username
	// 	})
	// 	.catch(e => {
	// 		setError(<div>Malformed URL or expired: {e}</div>)
	// 	})
	// }
	
	const onSubmit = (event) => {
		event.preventDefault()

		if(!pageValid) return

		// validate url again on submit. may have expired since page load
		//if(!validateUrl()) return

		UserService.updatePassword(id, password)
		.then(() => {
			resetPage()
    })
    .catch(e => {
      let error = e.message || e.response.data
      console.log(error)
      setError(<div>Exception in setting password for user with id {id}: {error}</div>)
		})
	}

	const resetPage = () => {
		setShowSaveSuccess(true)
		setTimeout(() => {
			setShowSaveSuccess(false)
			props.history.push('/auth/login')
		}, 4000)
	}

	const onCancelClicked = () => {
		setPassword('')
		setConfirmedPassword('')
	}

	return !error ? (
		<>
			<h1 className="ml-2 d-inline">{"Reset password"}</h1>
			<div className="container">
				<form onSubmit={onSubmit}>
					<Input elementType="password" name="password" value={password} label="Password" isValid={passwordValid.isValid} show={true}
						changed={(event) => {
							setPassword(event.target.value)
							validate(event.target.value, passwordValid)
						}}
					/>
					<Input elementType="password" name="confirmedPassword" value={confirmedPassword} label="Confirm Password" isValid={confirmedPasswordValid.isValid} show={true}
						changed={(event) => {
							setConfirmedPassword(event.target.value)
							validate(event.target.value, confirmedPasswordValid)
						}}
					/>
					<div className="d-flex justify-content-between m-1">
						<input className="btn btn-primary btn-lg" type="submit" value='Save' />
						<button type="button" onClick={onCancelClicked} className="btn btn-danger btn-lg mx-1">Cancel Changes</button>
					</div>			
				</form>
				<h2 className={showSaveSuccess ? '' : 'd-none'}>Changes successfully saved</h2>
				<h3 className={showSaveSuccess ? '' : 'd-none'}><Link to="/auth/login">Login</Link></h3>
			</div>
		</>		
	) : error
}

export default withRouter(PasswordReset)