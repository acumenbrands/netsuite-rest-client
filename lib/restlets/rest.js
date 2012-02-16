/*
 * This RESTlet covers the basic operations for interacting with Netsuite data.
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

function loadRecord(recordType, internalId) {
	/*
	 * Description: Retrieves a single record based on query fields
	 * Params:
	 *              recordType: String matching a record type
	 *              internalId: String matching the internal id of a record
	 *
	 * Return:      Record of given type with given id
	*/
    try {
      return(nlapiLoadRecord(recordType, internalId));
	}
	catch(exception) {
	  return(formatException(exception));
	}
}

function initializeRecord(recordType) {
	/*
	 * Description: Retrieves an initialized object with the given parameters
	 * Params:
	 *              request.recordType:      String matching a record type
	 *
	 * Return:      An instantiated object of the given type
	*/
    try {
		return(nlapiCreateRecord(recordType));
	}
	catch(exception) {
		return(formatException(exception));
	}
}

function upsertRecord(record, doSourcing, ignoreMandatory, updateOnly) {
	/*
	 * Description: Updates a record with given field values, can ignore validations if requested
	 * Params:
	 *              recordType:      String matching a record type
	 *              internalId:      String matching the internal id of a record
	 *              updateOnly:      Boolean value that, if true, only allows updates to occur,
	 *                                        no new records will be created
	 *              doSourcing:      Boolean value to set sourcing (the hell is this?)
	 *              ignoreMandatory: Boolean value to set ignoring of validations for mandatory fields
	 *
	 * Return:      Internal id of the comitted record
	*/
    try {
      return(nlapiSubmitRecord(record, doSourcing, ignoreMandatory));
    }
    catch(exception) {
      return(formatException(exception));
    }
}

function deleteRecord(recordType, internalId) {
	/*
	 * Description: Deletes a record of given type with given id
	 * Params:
	 *              recordType: String matching a record type
	 *              internalId: String matching the internal id of a record
	 *
	 * Return:      True if successful
	*/
	try {
		nlapiDeleteRecord(recordType, internalId);
		return(true);
	}
	catch(exception) {
		return(formatException(exception));
	}
}

function getHandler(request) {
	/*
	 * Description: Can return existing and record or a newly initialized record
	 * Params:
	 *              request.record_type: String matching a record type
	 *              request.internal_id: String matching the internal id of a record
	 *
	 * Return:      Serialized Netsuite record object
    */
    var recordType = request.record_type;
    var internalId = request.internal_id;

    if(internalId) {
        return(loadRecord(recordType, internalId));
    }
    else {
        return(initializeRecord(recordType));
    }
}

function postHandler(request) {
    return(true);
}

function putHandler(request) {
    return(true);
}

function deleteHandler(request) {
    return(true);
}