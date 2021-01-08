const validate = (value, rule) => {
	let isValid = true    

	if(rule.rules.required) {
		isValid = value.trim() !== ''
	}
	if(rule.rules.minLength) {
		isValid = value.length >= rule.rules.minLength && isValid
	}
	if(rule.rules.maxLength) {
		isValid = value.length <= rule.rules.maxLength && isValid
	}
	if(rule.rules.isEmail) {
		isValid = (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)) && isValid
	}
	if(rule.rules.isNumber) {
		isValid = Number.isInteger(parseInt(value)) && isValid
	}
	if(rule.rules.matches) {
		isValid = value === rule.rules.matches && isValid
	}

	return isValid;
}

export default validate