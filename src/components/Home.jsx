import React, { useContext } from 'react';
import { useState } from 'react';
import { withRouter } from 'react-router-dom'

import {Context} from '../store/Store'
import Logo from './Logo'

const Home = (props) => {
	let {status} = props.match.params
	const countdown = 4
	//const [state, dispath] = useContext(Context)
	//const [counter, setCounter] = useState(countdown)

	const mainContent = (
		<div className="container my-3 mx-4">
			<h1>Welcome to security and permissions management</h1>
			<h3>Use the menu bar for navigation</h3>
		</div>
	)

	const logoutContent = () => {
    setTimeout(() => props.history.push('/home'), countdown*1000)
    return (
      <h3 className="container my-3 mx-4">
        Successful logout. You will be redirected to the home page in 4 seconds.
      </h3>
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