// BUG REPORT: after delete we went to login page. Why did loginStatus not return user in that circumstance?

import React, { useEffect, useContext, useState } from 'react';
import { Route, Link, withRouter } from 'react-router-dom';
import AuthenticationService from '../services/AuthenticationService';
import PageService from '../services/PageService';
import UserService from '../services/UserService';

import { Context } from '../store/Store'
import Spinner from './ui/Spinner';

const AuthenticatedRoute = (props) => {
	const [state, dispatch] = useContext(Context)
	const [page, setPage] = useState({
		id: '',
		name: '',
		description: '',
		roles: [],
		enabled: true
	})
	let user = AuthenticationService.loginStatus()	// first verify logged in at all
	let authorized = false
	let pageContents = <Spinner/>
	const deniedPage = (
		<div>
			<p>Access Denied. <button onClick={() => {props.history.push("/")}}>go back</button></p>
		</div>
	)
	// verify that state.roles.some(role => role.id === props.component.matchTable.id)
	// return Route if match
	
	useEffect(() => {
		if(!state.loginStatus) {
			AuthenticationService.validateJWT()
			.then(response => {	// CONSIDER: dispath token would go here
				UserService.getUserByUsername(user)
				.then(response => {
						pageContents = <Route {...props}/>
						dispatch({type: 'SET_USERNAME', payload: response.data.username})
						dispatch({type: 'SET_ROLES', payload: response.data.roles})
						dispatch({type: 'SET_LOGIN_STATUS', payload: true})
				})
				.catch(e => {
					console.log(e)
					pageContents = <div>{e}</div>
				})

				PageService.getPageById(props.pageId)
				.then(response => {
					setPage(response.data)
				})
				.catch(e => {
					console.log(e)
					pageContents = <div>{e}</div>
				})
			})
			.catch(e => {
				console.log(e)
				pageContents = <div>{e}</div>
				dispatch({type: 'SET_LOGIN_STATUS', payload: false})
				dispatch({type: 'SET_SHOW_LOGIN_FAILED', payload: false})
			})
		}
	},[])

	useEffect(() => {
    // if page and state have been populated. we have to kill it with loginStatus because state changes are HALF WAY DONE AND THIS USEEFFECT KICKS FOR ALL OF THEM!
    if(page.roles.length && state.roles.length && !authorized) {
			page.roles.map(pageRole => {
				state.roles.some(userRole => {
					authorized = userRole.id === pageRole.id	// there exists a
					
				})
			})
			pageContents = <Route {...props}/>
		}
		console.log(authorized, state.loginStatus, pageContents)
  },[page, state])

	if(!user) {
		props.history.push('/auth/login')
		return null
	}
	
	// if(authorized && state.loginStatus) {
	// 	console.log(authorized, state.loginStatus, pageContents)
	// 	pageContents = <Route {...props}/>
	// } else pageContents = deniedPage
	
	return authorized && state.loginStatus ? <Route {...props}/> : deniedPage
}

export default withRouter(AuthenticatedRoute)