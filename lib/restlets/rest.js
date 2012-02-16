/*
 * This RESTlet covers the basic operations for interacting with Netsuite data. The basic
 * operations are wrapped in custom methods to perform exception handling and to expose errors
 * and debug information to the client.
 *
 * Params listed as sub-fields of the request argument will be arguments passed to the endpoint URI
*/

function formatException(exception) {
	/*
	 * Description: Format an exception to send to the client
	 * Params:
	 *              exception: An exception object
	 *
	 * Return:      A custom serialized exception object
	*/
	return([exception.name.toString(), exception.message, exception.getStackTrace()]);
}

function loadRecord(recordType, internalId) {
	/*
	 * Description: Retrieves a single record based on query fields
	 * Params:
	 *              record_type: String matching a record type
	 *              internal_id: String matching the internal id of a record
	 *
	 * Return:      Record of given type or null if not found
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
	 *              request.record_type:      String matching a record type
	 *              request.record_data:      String/value pairs to populate record field data
	 *
	 * Return:      Internal id of comitted record if successful, exception if not
	*/
    try {
		return(nlapiCreateRecord(recordType));
	}
	catch(exception) {
		return(formatException(exception));
	}
}

function upsertRecord(request) {
	/*
	 * Description: Updates a record with given field values, can ignore validations if requested
	 * Params:
	 *              request.record_type:      String matching a record type
	 *              request.internal_id:      String matching the internal id of a record
	 *              request.update_only:      Boolean value that, if true, only allows updates to occur,
	 *                                        no new records will be created
	 *              request.do_sourcing:      Boolean value to set sourcing (the hell is this?)
	 *              request.ignore_mandatory: Boolean value to set ignoring of validations for mandatory fields
	 *
	 * Return:      Internal id of the comitted record if successful, false if not
	*/
    var recordType      = request.record_type;
    var internalId      = request.internal_id;
    var updateOnly      = request.update_only;
    var doSourcing      = request.do_sourcing;
    var ignoreMandatory = request.ignoreMandatory;

    try {
      return(nlapiSubmitRecord(record, doSourcing, ignoreMandatory));
    }
    catch(exception) {
      return(formatException(exception));
    }
}

function deleteRecord(request) {
	/*
	 * Description: Deletes a record of given type with given id
	 * Params:
	 *              request.record_type: String matching a record type
	 *              request.internal_id: String matching the internal id of a record
	 *
	 * Return:      True if successful, false if not
	*/
	var recordType = request.record_type;
	var internalId = request.internal_id;

    try {
		nlapiDeleteRecord(recordType, internalId);
		return(true);
	}
	catch(exception) {
		return(formatException(exception));
	}
}

function get(request) {
	/*
	 * Description: Can return existing and record or a newly initialized record
	 * Params:
	 *              request.record_type: String matching a record type
	 *              request.internal_id: String matching the internal id of a record
	 *
	 * Return:      Netsuite record object
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

function post(request) {

}

function put(request) {

}

function delete(request) {

}