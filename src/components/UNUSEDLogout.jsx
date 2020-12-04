import { useEffect } from 'react';
import { useContext } from 'react';
import { withRouter } from 'react-router-dom'

import AuthenticationService from '../services/AuthenticationService'
import {Context} from '../store/Store'

const Logout = (props) => {
	const [state, dispatch] = useContext(Context);
	
	useEffect(() => {
		dispatch({type: 'SET_TOKEN', payload: ''})
		dispatch({type: 'SET_USERNAME', payload: ''})
		dispatch({type: 'SET_ROLES', payload: []})
		dispatch({type: 'SET_LOGIN_STATUS', payload: false})
		dispatch({type: 'SET_SHOW_LOGIN_FAILED', payload: false})
	},[])

	AuthenticationService.logout()
	props.history.push("/auth/login")
	return null
}

export default withRouter(Logout)