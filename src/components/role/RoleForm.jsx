import React, { useState, useEffect, useContext } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { compose } from 'redux'

import RoleService from '../../services/RoleService'
import PageService from '../../services/PageService'
import Modal from '../ui/Modal'
import withNetHandler from '../hoc/withNetErrHandler'
import Input from '../ui/Input'
import useStateWithPromise from '../hoc/useStateWithPromise'
import validate from '../../utils/validate.js'
import AuthenticationService from '../../services/AuthenticationService';
import { ROLE_FORM_ID as PAGE_ID } from '../../Constants'
import { Context } from '../../store/Store'

const RoleForm = (props) => {
  const [role, setRole] = useStateWithPromise({
    id: props.match.params.id || null,
		name: '',
		description: '',
    access: [],
    enabled: true
  })
  const [modalHeader, setModalHeader] = useState('')
  const [modalContent, setModalContent] = useState('')
  const [pageValid, setPageValid] = useState(true)
  const [state] = useContext(Context) // this is the logged in user state
  const authService = new AuthenticationService()
  const [error, setError] = useState(false)
    
  // ----------------------- VALIDATION RULES -----------------------
  const [nameValid, setNameValid] = useState({
    isValid: true,
    rules: {
      required: true,
      minLength: 3
    }
	})
	const [descriptionValid, setDescriptionValid] = useState({
    isValid: true,
    rules: {
      required: true,
      minLength: 5
    }
  })
  // ----------------------- VALIDATION RULES, END -----------------------

  useEffect(() => {
    if(authService.loginStatus()) {
			authService.validateLocalLogin()
    }
  },[])

  useEffect(() => {
    if(!authService.loginStatus()) {
      props.history.push("/auth/login/role-form")
      return null
    }

    if(state.validationResult) {
      authService.logout()
      setError(<h3>{state.validationResult}</h3>)
      setTimeout(() => props.history.push("/auth/login"), 3000)      
    }
  },[state.validationResult])

  useEffect(() => {
		if(state.id) {
			authService.validatePageAccess(PAGE_ID, state.id)
			.then(response => {
				setError(response.data ? false : <h3>Access Denied</h3>)
				if(response.data && role.id !=="new") fetchRole()
			})
			.catch(e => {
				console.log(e.response.data.message)
				setError(<div>Exception in access validation: {e.response.data.message}</div>)
			})
		}
  },[state.id])

  const loadRole = async(data) => {
		const { name, enabled, description, access } = data
		console.log()
    await setRole({...role,
      name,
      description,
      enabled,
      access
    })
  }

  const fetchRole = () => {
    RoleService.getRoleById(role.id)
    .then(response => {
      loadRole(response.data)
    })
    .catch(e => { // CONSIDER: forward to error page, or return error div
      let fetchError = e.message || e.response.data
      console.log(fetchError)
      setError(<h3>{fetchError}</h3>)
    })
  }

  useEffect(() => {
    let auth = false

    if(state.roles.length && !auth) {
      PageService.getPageById(PAGE_ID)
      .then(response => {
        state.roles.forEach(userRole => {
          if(response.data.roles.some(pageRole => { return pageRole.id === userRole.id })) {
            if(role.id !== "new") fetchRole()
            auth = true
          }
          setError(auth ? false : <h3>Access Denied</h3>)
        })
      })
      .catch(e => {
        console.log(e)
        setError(<div>Access Denied</div>)
      })
    }    
  },[state])

  const toggleModal = (header, description) => {
    setModalContent(modalContent.length ? '' : description)
    setModalHeader(modalHeader.length ? '' : header)
  }

  // TODO
  // const deleteRoleClicked = () => { // FIX ME: verify logged in
  //   RoleService.deleteRole(role.id)
  //   .then(response => {
  //     console.log(`Piss off ghost ${role.id}! He's frickin gone.`, response)
  //     props.history.push("/role-manager")
  //   })
  // }

  const onSubmit = (event) => {
		event.preventDefault()
		
    if(!pageValid) return

    RoleService.createOrUpdateRole(role.id, role)
    .then(() => {
      props.history.push("/role-manager")
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
  let accessPages = null
  if(role.access !== undefined) {
    accessPages = role.access.map(a => (
      <tr>
        <td>{a.name}</td>
        <td><Link	className="btn btn-warning" to={"/page/" + a}	>Edit permissions</Link></td>
      </tr>
    ))
  }

  return !error ? (
    <>
      <div>
        <h1 className="ml-2 d-inline">{role.id !== "new" ? `${role.name}` : 'New role'}</h1>
        {role.id ? <small className="m-2 float-right d-inline">ID: {role.id}</small> : ''}
      </div>
      <Modal show={modalContent.length ? true : false} content={modalContent} header={modalHeader} toggle={toggleModal} />

      <div className="container">
        <form onSubmit={onSubmit}>
          <Input elementType="input" name="name" value={role.name} label="Name" isValid={nameValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setRole, role, { name: event.target.value }, nameValid, setNameValid)
            }}
          />

					<Input elementType="input" name="description" value={role.description} label="Description" isValid={descriptionValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setRole, role, { description: event.target.value }, descriptionValid, setDescriptionValid)
            }}
          />

          <Input elementType="checkbox" name="enabled" value={role.enabled} checked={role.enabled} label="Enabled" show={true}
            changed={() => {
              setRole({...role, enabled: !role.enabled})
            }}
          />
          
          <fieldset className="container mt-4">
            <legend>Access to these site pages</legend>
							<table className="table table-bordered">
								<thead>
									<tr>
										<th scope="col">
											Page
										</th>
										<th scope="col">
                      Add a Query on the pages to show a list here
										</th>
									</tr>
								</thead>
								<tbody>
									{accessPages}
								</tbody>
							</table>
          </fieldset>
          <input className="btn btn-primary" type="submit" value="Save"/>
        </form>
      </div>
    </>
  ) : error
}

export default compose(withRouter, withNetHandler)(RoleForm, RoleService.getInstance())

