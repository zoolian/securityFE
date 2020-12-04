import React from 'react'
import { withRouter, Link } from 'react-router-dom'

import PageService from '../../services/PageService';

// use Reactstrap or something similar to dynamically gray cards based on props.enabled
const PageRow = (props) => {

  let { id, name, description, roles, enabled } = props.page
  let roleList = <div><small>No permissions yet</small></div>

  if(!enabled && !props.showDisabled) {
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
      <div>
        <h3 className="card-title ml-4 mt-2 mb-0">{name}</h3>   
        <p className="float-right mr-2"><small className="text-muted">id: {id}</small></p>     
      </div>      
        <div className="card-body p-3">
          <div className="row">
            <div className="col-7 border-right">              
              <p className="card-text">{description}</p>
            </div>          
            <div className="col-5">
              <h5>Roles with access</h5>
              {roleList}
            </div>
          </div>
          <hr/>
          <div className="mt-2">
            <Link to={`/page-form/${id}`} className="btn btn-primary">Edit</Link>
            <p className="card-text float-right mt-0"><small className="text-muted">{enabled ? 'Enabled' : 'Disabled'}</small></p>
          </div>
                        
        </div>
      </div>
    </div>
  )
}

export default withRouter(PageRow)