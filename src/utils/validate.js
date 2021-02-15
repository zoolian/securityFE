const validate = (value, rule) => {
	if(value === null || value === '' || !rule) return false
	let isValid = true
	const currencyRegex = new RegExp("^\\$?(?!0.00)(([0-9]{1,3},([0-9]{3},)*)[0-9]{3}|[0-9]{1,3})(\\.[0-9]{2})?$")
	//("(?=.*?\\d)^\\$?(([1-9]\\d{0,2}(,\\d{3})*)|\\d+)?(\\.\\d{1,2})?$")

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
	if(rule.rules.isCurrency) {		
		isValid = value.match(currencyRegex) && isValid
	}
	if(rule.rules.maxWords) {
		const words = value.split(' ')
		isValid = words.length <= rule.rules.maxWords && !value.includes(',') && isValid
	}

	//setPageValid(isValid)
	return isValid;
}

export default validate