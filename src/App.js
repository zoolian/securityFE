import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

// EXAMPLE React Suspense.  Named exports not supported with lazy component loading
// const UserForm = React.lazy(() => import('./components/user/UserForm'))
import UserForm from './components/user/UserForm'
import UserManager from './components/user/UserManager'
import RoleForm from './components/role/RoleForm'
import RoleManager from './components/role/RoleManager'
import PageManager from './components/page/PageManager'
import PageForm from './components/page/PageForm'
import Header from './components/ui/Header'
import Auth from './components/Auth'
import Profile from './components/Profile'
import Store from './store/Store'
import Home from './components/Home'
//import { USER_MANAGER_ID, ROLE_MANAGER_ID, PAGE_MANAGER_ID, USER_FORM_ID, ROLE_FORM_ID, PAGE_FORM_ID } from './Constants'

import './App.css'

class App extends Component {

  render() {
    return (
      <Store>
        <Router>
          <Header/>

          <Switch>
            <Route path="/home/:status" component={Home}/>
            <Route path="/home" component={Home} />
            {/* The component name should not be what is queried, so use the db ID. */}
            <Route path="/user-manager" component={UserManager} />
            <Route path="/role-manager" component={RoleManager} />
            <Route path="/page-manager" component={PageManager} />
            <Route path="/user-form/:id" component={UserForm} />
            <Route path="/role-form/:id" component={RoleForm} />
            <Route path="/page-form/:id" component={PageForm} />
            <Route path="/profile" component={Profile} />
            {/* <Route path="/logout" component={Logout} /> */}
            <Route path="/auth/signup" render={(props) => <Auth {...props} signUp={true} />} />
            <Route path="/auth/login/:previousPage" render={(props) => <Auth {...props} signUp={false} />} />
            <Route path="/auth/login/" render={(props) => <Auth {...props} signUp={false} />} />
            {/* <Route path="/user-form/:id" render={() => <Suspense fallback={<Spinner/>}><UserForm/></Suspense>} /> */}            
            <Redirect from="/" to="/home" />
            {/* <Route render={() => <h1>Nothing here</h1>} /> DEFAULT CATCH ALL IF YOU WANTED TO DO THIS! NOT NECESSARY*/}
          </Switch>
        </Router>
      </Store>
      
    );
  }
}

export default App;
