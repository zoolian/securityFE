import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom'

import Logo from './Logo'

const Home = (props) => {
	let {status} = props.match.params
	const countdown = status === "logout" ? 4 : 600

	const mainContent = (
		<div className="container my-3 mx-4">
			<h1>Welcome to security and permissions management</h1>
			<h3>Use the menu bar for navigation</h3>
		</div>
	)

	useEffect(() => {
		const logoutTimer = () => setTimeout(() => props.history.push('/home'), countdown*1000)
		const timerId = logoutTimer()
		return () => {
			clearTimeout(timerId)
		}
	})

	const logoutContent = () => {		
    return (
      <div className="container my-3 mx-4">
        <h3>Successful logout</h3>
				<h4>You will be redirected to the home page in {countdown} seconds</h4>
      </div>
    );
	}
	
	return (
		<>
			<Logo />
			{ status !== "logout" ?
        mainContent
        : logoutContent()
      }
			
		</>
	)
}

export default withRouter(Home)