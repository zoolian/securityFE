import React, { Component} from 'react';
import { withRouter } from 'react-router-dom'

import RoleService from '../../services/RoleService';
import RoleCard from './RoleCard'
import Spinner from '../ui/Spinner'

class RoleManager extends Component {

  constructor(props) {
    super(props)

    this.state = {
      roles: <div><h3>Please Wait</h3></div>,
      showDisabled: false
    }
  }

  componentDidMount() {
    this.loadRoles()
  }

  loadRoles = () => {
    RoleService.getRolesAll()
    .then(response => {
      this.setState({
        roles: response.data
      })
    })
    .catch(e => { // FIX ME: forward to error page?
      if(e.message) {
        this.setState({ 
          roles: <div>{e.message}</div>
        })
      } else { 
        console.log(e.response)
        this.setState({ 
          roles: <div>{e.response.data.message}</div>
        })
      }
    })
  }

  onShowDisabledClicked = () => {
    this.setState({ showDisabled: !this.state.showDisabled })
  }

  addRoleClicked = () => {
    this.props.history.push('/role-form/-1')
  }

  // use Reactstrap or something similar to dynamically set btn-primary vs btn-secondary or something
  render() {
    let cards = <Spinner/>
    const currentButtonClasses = this.state.showDisabled ? "btn btn-primary" : "btn btn-secondary"
    // let classes = ['btn']
    // this.state.showDisabled ? classes.push('btn-primary') : classes.push('btn-secondary')
    //  . . . {classes.join(' ')} ... for the className

    if(this.state.roles.length) {
      cards = (        
        this.state.roles.map((role) => (
          <RoleCard key={role.id} name={role.name} enabled={role.enabled} description={role.description} showDisabled={this.state.showDisabled} id={role.id} />
          ))
      )
    }

    return (
      <div className="container-fluid">
        <h1 className="my-3">Security role list</h1>
        <div className="container-fluid">
          <div className="row">
          {cards}
          </div>
          <button onClick={this.addRoleClicked} >Add new</button>
          <div className="d-flex flex-row-reverse fixed-bottom m-5">
            <button onClick={this.onShowDisabledClicked} className={currentButtonClasses}>{this.state.showDisabled ? 'Hide disabled roles' : 'Show disabled roles' }</button>
          </div>          
        </div>
      </div>
    );
  }
}

export default withRouter(RoleManager)