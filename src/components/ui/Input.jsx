import React from 'react'

const onEnter = (event, executeFunc) => {
	if(event && executeFunc && event.charCode === 13) {
		executeFunc()
	}
}

const input = (props) => {
	let inputElement = null
	const errorClasses = "alert alert-danger"

	switch (props.elementType) {
		case ('input'):
			inputElement = (
				<fieldset className='form-group'>
					<label>{props.label}</label>
					<input className={'form-control ' + (props.isValid ? '' : errorClasses)} type="text" value={props.value} onChange={props.changed} autoComplete={props.autoComplete} onKeyPress={(event) => onEnter(event, props.onEnter)}/>
					{/* <p>{props.invalidMessage}</p> */}
				</fieldset>
			)
			break

		case ('password'):
			inputElement = (
				<fieldset className='form-group'>
					<label>{props.label}</label>
					<input className={'form-control ' + (props.isValid ? '' : errorClasses)} type="password" value={props.value} onChange={props.changed}  autoComplete={props.autoComplete}/>
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

		// requires "name" and "id" fields
		case ('select'):
			inputElement = (
				<fieldset className="form-group">
					<label>{props.label}</label>
					<select value={props.value} className="form-control" onChange={props.changed} >
						{props.options.map(option => (
								<option key={option.id} value={option.id}>{option.name}</option>
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