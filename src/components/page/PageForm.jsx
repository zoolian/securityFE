import React, { useState, useEffect, useContext } from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'redux'

import PageService from '../../services/PageService'
import RoleService from '../../services/RoleService'
import Modal from '../ui/Modal'
import withNetHandler from '../hoc/withNetErrHandler'
import Input from '../ui/Input'
import useStateWithPromise from '../hoc/useStateWithPromise'
import validate from '../../utils/validate.js'
import AuthenticationService from '../../services/AuthenticationService';
import { PAGE_FORM_ID as PAGE_ID } from '../../Constants' // page id for authorized access to this form
import { Context } from '../../store/Store'

const PageForm = (props) => {
  const [page, setPage] = useStateWithPromise({
    id: props.match.params.id || null,                    // page id for which site page you'll be making changes to
		name: '',
		description: '',
    roles: [],
    enabled: true
  })
  const [allRoles, setAllRoles] = useStateWithPromise([])
  const [modalHeader, setModalHeader] = useState('')
  const [modalContent, setModalContent] = useState('')
  const [pageValid, setPageValid] = useState(true)
  const [state] = useContext(Context) // this is the logged in user state
  const authService = new AuthenticationService
  const [error, setError] = useState(false)
  let auth = false
  
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


  const loadPage = async(data) => {
		const { name, enabled, description, roles } = data
    await setPage({...page,
      name,
      description,
      enabled,
      roles
    })
  }

  const loadAllRoles = async(data) => {
    await setAllRoles(data)
  }

  const loadRoles = () => {
    RoleService.getRolesAll()
    .then(response => {
      loadAllRoles(response.data)
    })
    .catch(e => { // CONSIDER: forward to error page, or return error div
      let fetchError = e.message || e.response.data
      console.log(fetchError)
      setError(<h3>{fetchError}</h3>)
    })
  }

  const fetchPage = () => { 
    PageService.getPageById(page.id)
    .then(response => {
      loadPage(response.data)
    })
    .catch(e => { // CONSIDER: forward to error page, or return error div
      let fetchError = e.message || e.response.data
      console.log(fetchError)
      setError(<h3>{fetchError}</h3>)
    })    
  }

  useEffect(() => {
    if(!authService.loginStatus()) {
      props.history.push("/auth/login")
      return
    }

    if(!authService.validate(PAGE_ID)) {
      setError(<div>Token expired</div>)
      return
    }
    loadRoles()
  },[])

  useEffect(() => {
    if(state.roles.length && !auth) {
      PageService.getPageById(PAGE_ID)
      .then(response => {
        state.roles.map(userRole => {
          if(response.data.roles.some(pageRole => { return pageRole.id === userRole.id })) {
            if(page.id != -1) fetchPage()
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

  useEffect(() => {
    let initialRoles = [...allRoles]
    // if the array exists but the hover property has not been set, and page has been populated, then we're ready to init allRoles
    if(allRoles.length && allRoles[0].hover === undefined && ( page.name.length || page.id == -1 )) {
      allRoles.map((role, index) => {
        if(page.name.length) {
          initialRoles[index].checked = page.roles.some(pageRole => { return pageRole.id === role.id })
        } else initialRoles[index].checked = false
        
        initialRoles[index].hover = false
      })
      setAllRoles(initialRoles)
    }    
  },[allRoles, page])

  // page object persistence with screen state/the entire list needs to be on the screen, but the page should not have the whole list
  // construct array of roles from what was checked.
  const setPageRoles = (roles) => {    
    let newPageRoles = []
    
    roles.map((role) => {
      role.checked && newPageRoles.push({ id: role.id })
    })
    setPage({...page, roles: newPageRoles})
  }

  const alterRole = (alterations, index) => {
    let newRoles = [...allRoles]
    let newRole = {}
    newRole = { ...newRoles[index], ...alterations }
    newRoles[index] = newRole
    setAllRoles(newRoles)
    return newRoles
  }

  const onRoleHover = (hover, index) => {
    alterRole({hover}, index)
  }

  const onRoleChecked = (checked, index) => {
    setPageRoles(alterRole({checked}, index))
  }

  const toggleModal = (header, description) => {
    setModalContent(modalContent.length ? '' : description)
    setModalHeader(modalHeader.length ? '' : header)
  }

  const deletePageClicked = () => { // FIX ME: verify logged in
    PageService.deletePage(page.id)
    .then(response => {
      console.log(`Piss off ghost ${page.id}! He's frickin gone.`, response)
      props.loadPosts();
    })
  }

  const onSubmit = (event) => {
		event.preventDefault()
		
    if(!pageValid) return

    PageService.createOrUpdatePage(page.id, page)
    .then((response) => {
      props.history.push("/page-manager")
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

   return !error ? (
    <>
      <div>
        <h1 className="ml-2 d-inline">{page.id ? `Permissions for the ${page.name} page` : 'New page'}</h1>
        {page.id ? <small className="m-2 float-right d-inline">ID: {page.id}</small> : ''}
      </div>
      <Modal show={modalContent.length ? true : false} content={modalContent} header={modalHeader} toggle={toggleModal} />

      <div className="container">
        <form onSubmit={onSubmit}>
          <Input elementType="input" name="name" value={page.name} label="Name" isValid={nameValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setPage, page, { name: event.target.value }, nameValid, setNameValid)
            }}
          />

					<Input elementType="input" name="description" value={page.description} label="Description" isValid={descriptionValid.isValid} show={true}
            changed={(event) => {
              inputChange(event, setPage, page, { description: event.target.value }, descriptionValid, setDescriptionValid)
            }}
          />

          <Input elementType="checkbox" name="enabled" value={page.enabled} checked={page.enabled} label="Enabled" show={true}
            changed={() => {
              setPage({...page, enabled: !page.enabled})
            }}
          />
          
          <fieldset>
            <legend>Roles with access to this page</legend>
              {allRoles && allRoles.length > 0 ? (
                allRoles.map((role, index) => (
                  <label key={index} >
                    <input type="checkbox" name={role.id} value={allRoles[index].checked} checked={allRoles[index].checked}
                      onChange={() => onRoleChecked(!allRoles[index].checked, index)}/>
                  {role.name}</label>
                ))
              ) : (<p onClick={() => console.log(allRoles)}>Loading...</p>)
              }
          </fieldset>
          <input className="btn btn-primary" type="submit" value="Save"/>
        </form>
      </div>
    </>
  ) : error
}

export default compose(withRouter, withNetHandler)(PageForm, PageService.getInstance())

