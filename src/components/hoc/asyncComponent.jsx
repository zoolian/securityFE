import React, { Component } from 'react'

const asyncComponent = (importComponent) => {
	return class extends Component {
		state = {
			component: null
		}

		// upon mounting, only then run the async function that graps the component you wanted when requested
		componentDidMount() {
			importComponent()
			.then(importedComponent => {
				this.setState({ component: importedComponent.default })
			})
		}
		
		// return null until the requested component has been loaded
		render() {
			const RenderingComponent = this.state.component
			return RenderingComponent ? <RenderingComponent {...this.props} /> : null
		}

	}
}

export default asyncComponent