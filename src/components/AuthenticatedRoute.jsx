// BUG REPORT: after delete we went to login page. Why did loginStatus not return user in that circumstance?

import React, { useEffect, useContext, useState } from 'react';
import { Route, Link, withRouter } from 'react-router-dom';
import AuthenticationService from '../services/AuthenticationService';
import PageService from '../services/PageService';
import UserService from '../services/UserService';

import { Context } from '../store/Store'

const AuthenticatedRoute = (props) => {
	const [state, dispatch] = useContext(Context)
	const [page, setPage] = useState({
		id: '',
		name: '',
		description: '',
		roles: [],
		enabled: true
	})
	//const [authorized, setAuthorized] = useState(false)
	const [authorized, setAuthorized] = useState({}) // [pageId, pageId, etc]
	const authService = new AuthenticationService
	let user = authService.loginStatus()	// first verify logged in at all
	let deniedPage = (
		<div>
			<p>Access Denied. <button onClick={() => {props.history.push("/")}}>go back</button></p>
		</div>
	)

	// if(props.pageId !== page.id) {
	// 	setPage({ ...page, id: props.pageId, name: '' })
	// }
	
	useEffect(() => {
		//if(!page.name) {
			authService.validateJWT()
			.then(response => {	// CONSIDER: dispath token would go here
				UserService.getUserByUsername(user)
				.then(response => {
					dispatch({ type: 'SET_USERNAME', payload: response.data.username })
					dispatch({ type: 'SET_ROLES', payload: response.data.roles })
					dispatch({ type: 'SET_LOGIN_STATUS', payload: true })
				})
				.catch(e => {
					console.log(e)
					deniedPage = <div>{e}</div>
				})
				PageService.getPageById(props.pageId)
				.then(response => {
					setPage(response.data)
				})
				.catch(e => {
					console.log(e)
					deniedPage = <div>{e}</div>
				})
			})
			.catch(e => {
				console.log(e)
				deniedPage = <div>{e}</div>
				dispatch({type: 'SET_LOGIN_STATUS', payload: false})
				dispatch({type: 'SET_SHOW_LOGIN_FAILED', payload: false})
			})
		//}
	},[])

	// useEffect(() => {
	// 	if(props.pageId !== page.id) {
	// 		PageService.getPageById(props.pageId)
	// 		.then(response => {
	// 			setPage(response.data)
	// 		})
	// 		.catch(e => {
	// 			console.log(e)
	// 			deniedPage = <div>{e}</div>
	// 		})
	// 	}
	// },[page])

	useEffect(() => {
    // if page and state have been populated. we have to kill it with authorized because state changes are HALF WAY DONE AND THIS USEEFFECT KICKS FOR ALL OF THEM!
    if(page.roles.length && state.roles.length && !authorized[props.pageId]) {
			page.roles.map(pageRole => {
				state.roles.some(userRole => {
					setAuthorized({...authorized, [page.id]: userRole.id === pageRole.id})	// create array of authorization because only one instance of local state for AuthenticatedRoute is created for the whole app
				})
			})
		}
	},[page, state])
	
	// useEffect(() => {
	// 	if(authorized) { deniedPage = <Route {...props}/>}
	// },[authorized])

	if(!user) {
		props.history.push('/auth/login')
		return null
	}
	console.log("autho", authorized, page)
	return authorized[props.pageId] ? <Route {...props}/> : deniedPage
}

export default withRouter(AuthenticatedRoute)