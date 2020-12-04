import React from 'react'

const input = (props) => {
	let inputElement = null
	const errorClasses = "alert alert-danger"

	switch (props.elementType) {
		case ('input'):
			inputElement = (
				<fieldset className='form-group'>
					<label>{props.label}</label>
					<input className={'form-control ' + (props.isValid ? '' : errorClasses)} type="text" value={props.value} onChange={props.changed} />
					{/* <p>{props.invalidMessage}</p> */}
				</fieldset>
			)
			break

		case ('password'):
			inputElement = (
				<fieldset className='form-group'>
					<label>{props.label}</label>
					<input className={'form-control ' + (props.isValid ? '' : errorClasses)} type="password" value={props.value} onChange={props.changed} />
				</fieldset>
			)
			break

		case ('textarea'):
			inputElement = (
				<fieldset className="form-group">
					<label>{props.label}</label>
					<textarea className={'form-control ' + (props.isValid ? '' : errorClasses)} value={props.value} onChange={props.changed} />
				</fieldset>
			)
			break

		case ('select'):
			inputElement = (
				<fieldset className="form-group">
					<label>{props.label}</label>
					<select value={props.value} className="form-control" onChange={props.changed} >
						{props.options.map(option => (
							<option key={option.value} value={option.value}>{option.value}</option>
						))

						}
					</select>
				</fieldset>
			)
			break

		case ('button'):
			inputElement = (
			<fieldset className="form-group">
					<label>{props.label}</label>
					<button className="form-control" type="button" />
				</fieldset>
			)
			break

		case ('checkbox'):
			inputElement = (
				<fieldset className="form-check">					
					<input checked={props.checked} className="form-check-input" type="checkbox" value={props.value} onChange={props.changed} />
					<label className="form-check-label">{props.label}</label>
				</fieldset>
			)
			break

		default:
			inputElement = (
				<fieldset className="form-group">
					<label>{props.label}</label>
					<input className={'form-control ' + (props.isValid ? '' : errorClasses)} type="text" value={props.value} onChange={props.changed} />
				</fieldset>
			)
	}

	if(!props.show) { return null }
	return inputElement
}

export default input