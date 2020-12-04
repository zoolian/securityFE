import React from 'react'
import { withRouter } from 'react-router-dom'

import PageService from '../../services/PageService';

// use Reactstrap or something similar to dynamically gray cards based on props.enabled
const PageRow = (props) => {

  let { id, name, description, enabled } = props.page

  const deletePageClicked = (id) => {
    PageService.deletePage(id)
    .then(response => {
      console.log(`Piss off ghost ${id}! He's frickin gone.`)
      props.loadPages();
    })
  }

  if(!enabled && !props.showDisabled) {
    return null
  }

  return (
    <tr>
      <td>
        {id}
      </td>
      <td>
        {name}
      </td>
      <td>
        {description}
      </td>
      <td>
        <button className="btn btn-success" onClick={() => props.history.push("/page-form/" + id) } >Edit access</button>
      </td>
      <td>
        <button
          className="btn btn-danger"
          onClick={() => { if (window.confirm('Delete page? This kick is permanent.')) deletePageClicked(id) } }
        >Delete</button>
      </td>        
    </tr>
  )
}

export default withRouter(PageRow)