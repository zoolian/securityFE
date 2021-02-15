export const ignoreEnter = (event) => {
	event.preventDefault()
	if(event.charCode === 13) {
		return null
	}
}