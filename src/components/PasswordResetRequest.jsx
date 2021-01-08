import React, {useState} from 'react'

import UserService from '../services/UserService'
import Input from './ui/Input'
import validate from '../utils/validate.js'
import AuthenticationService from '../services/AuthenticationService'

const PasswordResetRequest = () => {
	const [error,setError] = useState(null)
	const [email,setEmail] = useState('Work in Progress, hence no submit button. SMTP needs to be built.')
	const [retryMessage,setRetryMessage] = useState(null)
	let id = null

	// ----------------------- VALIDATION RULES -----------------------
  const [emailValid] = useState({
    isValid: true,
    rules: {
      required: true,
      isEmail: true
    }
  })
	// ----------------------- VALIDATION RULES, END -----------------------

	const verifyUser = () => {
		UserService.getUserByEmail(email)
		.then(response => {
			// TODO: generate url hash and send
			id = response.data.id
		})
		.catch(e => {
			setError(<div>Exception fetching email: {e}</div>)
			id = null
		})
	}

	const onSubmit = async (event) => {
		event.preventDefaults()

		await verifyUser()
		if(id) {
			AuthenticationService.sendReset(email, id)
		} else {
			setEmail('')
			setRetryMessage(<div>Email does not exist. Retry if you like. Or your could be a quitter. Go ahead and give up. Run home and cry to mama!</div>)
		}
		
	}

	return !error ? (
		<>
			<h1>Enter your email address</h1>
			<h3>We'll send you a password reset link</h3>
			<div className="container">
				<form onSubmit={onSubmit}>
					<Input elementType="input" name="email" value={email} label="Email" isValid={emailValid.isValid} show={true}
						changed={(event) => {
							setEmail(event.target.value)
							validate(event.target.value, emailValid)
						}}
					/>
				</form>
				<div>{retryMessage}</div>
			</div>
		</>
	) : error
}

export default PasswordResetRequest