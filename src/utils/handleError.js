export const handleError = (error, typeString) => {
	console.log(error.response ? error.response.data.message : error.message)
	return <div>Exception in {typeString}: {error.response ? error.response.data.message : error.message}</div>
}