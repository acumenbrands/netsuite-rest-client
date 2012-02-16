/*
 * This RESTlet dispatches requests from a client, providing a single gate for all operations and exception handling
*/

function formatException(exception) {
	/*
	 * Description: Format an exception to send to the client
	 * Params:
	 *              exception: An exception object
	 *
	 * Return:      A serialized exception object
	*/
	var serializedException = [exception.name.toString(), exception.message];

	try {
		return(serializedException.concat([exception.getStackTrace()]));
	}
	catch(stack_fetch_error) {
		return(serializedException.concat([[stack_fetch_error.message]]));
	}
}

function getHandler(request) {

}

function putHandler(request) {

}

function postHandler(request) {

}

function deleteHandler(request) {
	
}