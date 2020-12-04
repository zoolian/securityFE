import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik'

import UserService from '../../services/UserService'
import RoleService from '../../services/RoleService';
import Modal from '../ui/Modal'
import withNetHandler from '../hoc/withNetErrHandler'

class UserForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.match.params.id || null,
      username: '',
      firstName: '',
      lastName: '',
      roles: [],
      enabled: true,
      allRoles: [],
      fetchError: null,
      modalHeader: '',
      modalContent: ''
    }
  }

  componentDidMount() {
    const {id} = this.state
    if(!id || id == -1) {
      this.setState({id: null})
      return
    }

    if(!this.state.username || !this.state.fetchError)  // Is this necessary?
    {
      UserService.getUserById(id)
      .then(response => {
        const { username, enabled, roles } = response.data
        const { firstName, lastName, email, age } = response.data.person
        
        this.setState({
          username,
          firstName,
          lastName,
          email,
          age,
          enabled,
          roles
        })
      })
      .then(() => {
        RoleService.getRolesAll()
        .then(response => {
          const { roles } = response.data
          this.setState({
            allRoles: response.data
          })
        })
        .then(() => { // for each user role that exists, set an enabled property when the user has it enabled so that we can show a list of checkbox options that represents the user's current roles
          if(this.state.allRoles) {
            this.state.allRoles.map((role, index) => {
              if( this.state.roles.some(r => r.id === role.id) ) {   
                this.onRoleEnabled(true, index)
              }
              this.onRoleHover(false, index)
            })
          }
        })
        .catch(e => { // FIX ME: forward to error page, or return error div
          if(e.message) { // (e.message === "Network Error")
            this.setState({ 
              fetchError: <div>{e.message}</div>
            })
          } else { 
            console.log(e.response)
            this.setState({ 
              fetchError: <div>{e.response.data.message}</div>
            })
          }
        })
      })
      .catch(e => { // FIX ME: forward to error page, or return error div
        if(e.message) { // (e.message === "Network Error")
          this.setState({ 
            fetchError: <div>{e.message}</div>
          })
        } else { 
          console.log(e.response)
          this.setState({ 
            fetchError: <div>{e.response.data.message}</div>
          })
        }
      })
    }
  }

  alterRole = (alterations, index) => {
    let newRoles = [...this.state.allRoles]
    let newRole = {}
    newRole = { ...newRoles[index], ...alterations }
    newRoles[index] = newRole
    this.setState({ allRoles: newRoles })
  }

  onRoleHover = (isHover, index) => {
    this.alterRole({isHover}, index)
  }

  onRoleEnabled = (enabled, index) => {
    this.alterRole({enabled}, index)
  }

  toggleModal = (header, description) => {
    this.setState((prevState) => {
      return { modalContent: prevState.modalContent.length ? '' : description,
        modalHeader: prevState.modalHeader.length ? '' : header
    }
    })
  }

  deleteUserClicked = () => { // FIX ME: verify logged in
    UserService.deleteUser(this.state.id)
    .then(response => {
      console.log(`Piss off post ${this.state.id}! He's frickin gone.`, response)
      this.props.loadPosts();
    })
  }

  onSubmit = (values) => {
    // if(!AuthenticationService.loginStatus()) {  // don't grab this from state. login status could have expired
    //   this.props.history.push("/login")
    //   return
    // }
    
    const { history } = this.props
    const user = {
      id: this.state.id,
      username: values.username,
      person: {
        // carry around this id
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        age: values.age
      },
      enabled: values.enabled,
      roles: values.roles
    }

    if(values.id > 0) {
      UserService.updateUser(this.state.id, user)
      .then((response) => {
        history.push("/user-manager")
      }, (error) => {
        console.log(error)
      })
    } else {
      UserService.createUser(user)
      .then((response) => {
        history.push("/user-manager")
      }, (error) => {
        console.log(error)
      })
    }
  }

  validate = (values) => {
    let errors = {}

    if(!values.username) {
      errors.username = 'Username required'
    } else if(values.username.length < 4) {
      errors.username = "More than 3 characters, please."
    }

    if(!values.firstName) {
      errors.firstName = 'required'
    }

    if(!values.lastName) {
      errors.lastName = 'required'
    }

    return errors;
  }

  // toggleRole = (event) => {
  //   this.setState({
  //     roles: this.prevState.roles.splice(index, 1)
  //   })
  // }

  // renderRoleOptions = (arrayHelpers) => {
  //   let roleOptions = null
  //   if(roles.length) {
  //     roleOptions = (        
  //       roles.map((role, index) => (
  //         <fieldset className="form-check" key={index} onClick={() => {console.log(role.id ? true : false)}}>
  //           <label className="form-check-label">{role.role}</label>
  //           <Field className="form-check-input" type="checkbox" name={role.role} checked={role.id ? "checked" : ''} component={Checkbox} />
  //           {/* onClick={() => this.toggleRole(userId, index)} /> */}
  //         </fieldset>
  //         // <UserCard key={role.id} role={role.role} id={role.id} />
  //         ))
  //     )
  //   }
  //   return roleOptions
  // }

  render () {
    let { id, username, firstName, lastName, enabled, email, age, allRoles, modalHeader, modalContent } = this.state
    const errorClasses = 'alert alert-warning py-1 mb-1 small'
    //let roleOptions = this.renderRoleOptions(id, roles)

    if(this.state.fetchError) {
      return this.state.fetchError
    }
    

    
    // FIX ME: add list of check boxes for roles
    return (
      <Fragment>
        <div>
          <h1 className="ml-2 d-inline">{id ? `${username}` : 'New user'}</h1>
          {id ? <small className="m-2 float-right d-inline">ID: {id}</small> : ''}
        </div>
        <Modal show={modalContent.length ? true : false} content={modalContent} header={modalHeader} toggle={this.toggleModal} />

        <div className="container">
        <Formik
          initialValues={{ id, username, firstName, lastName, enabled, email, age, allRoles }}
          onSubmit={this.onSubmit}
          validate={this.validate}
          enableReinitialize={true}
        >
          {(values) => (
            <Form>
              <fieldset className="form-group">
                <label>Username:</label>
                <Field className="form-control" type="text" name="username"/>
                <ErrorMessage name="username" component="div" className={errorClasses}/>
              </fieldset>
              <fieldset className="form-group">
                <label>First name:</label>
                <Field className="form-control" type="text" name="firstName"/>
                <ErrorMessage name="firstName" component="div" className={errorClasses}/>
              </fieldset>
              <fieldset className="form-group">
                <label>Last Name:</label>
                <Field className="form-control" type="text" name="lastName"/>
                <ErrorMessage name="lastName" component="div" className={errorClasses}/>
              </fieldset>
              <fieldset className="form-group">
                <label>Email:</label>
                <Field className="form-control" type="text" name="email"/>
                <ErrorMessage name="email" component="div" className={errorClasses}/>
              </fieldset>
              <fieldset className="form-group">
                <label>Age:</label>
                <Field className="form-control" type="text" name="age"/>
              </fieldset>
              <fieldset className="form-check">
                <label className="form-check-label" onClick={() => {console.log(values)}}>Enabled</label>
                <Field className="form-check-input" type="checkbox" name="enabled" checked={values.enabled} component={Checkbox} />
              </fieldset>
              <FieldArray
                name="allRoles" 
                render={arrayHelpers => (
                  <div>
                    {values.values.allRoles && values.values.allRoles.length > 0 ? (
                      values.values.allRoles.map((role, index) => (
                        <fieldset className="form-check" key={index} >
                          <label className="form-check-label"
                            onMouseEnter={() => this.onRoleHover(true, index)}
                            onMouseLeave={() => this.onRoleHover(false, index)}
                            onClick={() => this.toggleModal(role.role, role.description)}>
                            {role.role}
                          </label>
                          <Field className="form-check-input" type="checkbox" name={`role.${index}.enabled`}  component={RoleCheckbox}  /> 
                          {/* onChange={event => values.setFieldValue(`${role.enabled}`, event.target.checked)} checked={role.id}/> */}
                          {/* onClick={() => this.toggleRole(userId, index)} /> */}
                        </fieldset>
                        // <UserCard key={role.id} role={role.role} id={role.id} />
                        ))
                    ) : (<div onClick={() => {console.log(values)}}>qwer</div>)

                    }
                  </div>
                )}
              
              />
              <button className="btn btn-success d-inline" type="submit">Submit</button>
              <button className="btn btn-warning d-inline float-right" onClick={() => { if (window.confirm('Delete user? You can\'t change your mind!!')) this.deleteUserClicked(id) } }>Delete</button>
            </Form>
          )}
        </Formik>
        
        {/* <button className="btn btn-primary" onClick={} >Edit Roles</button> */}
        </div>
      </Fragment>
    )
  }
}

function Checkbox({ field, type, checked }) {
  return (
    <label>
      {/* remove {...field} to see changes not propagated */}
      <input {...field} type={type}  />
    </label>
  );
}

function RoleCheckbox({ field, type, checked }) {
  return (
    <label>
      {/* remove {...field} to see changes not propagated */}
      <input {...field} type={type}  onClick={() => console.log(field)}/>
    </label>
  );
}
//onChange={() => this.props.form.setFieldValue('checked', values.values.allRoles[index].enabled)}

UserForm.propTypes = {
  loadPosts: PropTypes.func
}

//export default withRouter(UserForm)
export default compose(withRouter, withNetHandler)(UserForm, UserService.getInstance())

