import React from 'react'
import { Link, withRouter } from 'react-router-dom'

const UserCard = (props) => {

  // TODO:
  // const updateUserClicked = (id) => { // FIX ME: user auth service to verify session didn't timeout before allowing edit. change link field below
  //   // if(!AuthenticationService.loginStatus()) {
  //   //   this.props.history.push('/login')
  //   // }
  //   props.history.push(`/user-form/${id}`)
  // }

  let { id, username, firstName, lastName, email, roles, enabled, showDisabled } = props
  let roleList = <div><small>No permissions yet</small></div>

  if(!enabled && !showDisabled) {
    return null
  }

  if(roles.length) {
    roleList = roles.map(role => (
      <p className="ml-2" key={role.id}>{role.name}</p>
    ))
  }

  return (
    <div className="col-lg-6 col-md-12 col-12">
      <div className="card">
      <h3 className="card-title ml-4 mt-2 mb-0">{username}</h3>
        <div className="card-body p-3">
          <div className="row">
            <div className="col-7 border-right">
              <p className="card-text">{firstName}</p>
              <p className="card-text">{lastName}</p>
              <p className="card-text">{email}</p>
            </div>
            <div className="col-5">
              <h5>Roles</h5>
              {roleList}
            </div>
          </div>
          <hr/>
          <div className="mt-2">
            <Link to={`/user-form/${id}`} className="btn btn-primary">Edit</Link>
            <p className="card-text float-right text-right mt-0"><small className="text-muted">{enabled ? 'Enabled' : 'Disabled'}</small></p>
          </div>
                        
        </div>
      </div>
    </div>
  )
}

export default withRouter(UserCard)