import React from 'react'
import { Link, withRouter } from 'react-router-dom'

// use Reactstrap or something similar to dynamically gray cards based on props.enabled
const RoleCard = (props) => {
  let { id, name, description, enabled, showDisabled } = props

  const updateRoleClicked = (id) => { // FIX ME: role auth service to verify session didn't timeout before allowing edit. change link field below
    // if(!AuthenticationService.loginStatus()) {
    //   this.props.history.push('/login')
    // }
    props.history.push(`/role-form/${id}`)
  }

  if(!enabled && !showDisabled) {
    return null
  }

  return (      
    <div className="col-lg-6 col-md-12 col-12">
      <div className="card">
      <h3 className="card-title ml-4 mt-2 mb-0">{name}</h3>        
        <div className="card-body p-3">
          <div className="row">
            <div className="col-7 border-right">              
              <p className="card-text">{description}</p>
              <p className="card-text">Future other details</p>
            </div>          
            <div className="col-5">
              <h5>More</h5>
              <p className="ml-2">Change this</p>
              <p className="ml-2">to a list</p>
            </div>
          </div>
          <hr/>
          <div className="mt-2">
            <Link to={`/role-form/${id}`} className="btn btn-primary">Edit</Link>
            <p className="card-text float-right text-right mt-0"><small className="text-muted">{enabled ? 'Enabled' : 'Disabled'}</small></p>
          </div>
                        
        </div>
      </div>
    </div>
  )
}

export default withRouter(RoleCard)