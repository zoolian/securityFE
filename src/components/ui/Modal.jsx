import React, {Component} from 'react'

class Modal extends Component {
  constructor(props) {
    super(props)
  }

  // performance testing
  componentDidUpdate() {
    console.log('Modal didUpdate')
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.show !== this.props.show) || (nextProps.header !== this.props.header)
  }

  render() {
    const { show, header, content } = this.props
    return (
      <div className='modal'
        data-show={show ? 'true' : 'false'} tabIndex="-1" role="dialog"
        style={{ transform: show ? 'translateY(0)' : 'translateY(-100vh)', display: 'block' }}
      >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
          <h5 className="modal-title">Details for {header}</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => this.props.toggle('')}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {content}
          </div>
        </div>
      </div>
      
    </div>
    )
  }
  
}

export default Modal