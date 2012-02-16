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
	return([exception.name.toString(), exception.message]);
}

function createRecord(recordType, recordData) {
	/*
	 * Description: Creates a record with given field values, can ignore validations if requested
	 * Params:
	 *              recordType:      String matching a record type
	 *              recordData:      String/value pairs to populate record field data
	 *
	 * Return:      Internal id of comitted record if successful, exception if not
	*/
	try {
		return(nlapiCreateRecord(recordType, recordData));
	}
	catch(exception) {
		return(formatException(exception));
	}
}

function loadRecord(recordType, internalId) {
	/*
	 * Description: Performs record loads and handles exceptions in the event of no record found
	 * Params:
	 *              recordType: String matching a record type
	 *              internalId: String matching the internal id of a record
	 *
	 * Return:      Netsuite record with given type and id or exception
	*/
	try {
      return(nlapiLoadRecord(recordType, internalId));
	}
	catch(exception) {
	  return(formatException(exception));
	}
}

function submitRecord(record, doSourcing, ignoreMandatory) {
    /*
     * Description: Updates a record with given field values, can ignore validations if requested
     * Params:
     *              record:          Netsuite API record object
     *              doSourcing:      Boolean value to set sourcing (the hell is this?)
     *              ignoreMandatory: Boolean value to set ignoring of validations for mandatory fields
     *
     * Return:      Internal id of the comitted record if successful, exception if not
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
	 * Return:      True if successful, exception if not
	*/
	try {
		nlapiDeleteRecord(recordType, internalId);
		return(true);
	}
	catch(exception) {
		return(formatException(exception));
	}
}

function fetchRecords(request) {
	/*
	 * Description: Retrieves a single record based on query fields
	 * Params:
	 *              request.record_type: String matching a record type
	 *              request.internal_id: String matching the internal id of a record
	 *
	 * Return:      Record of given type or null if not found
	*/
    var recordType = request.record_type;
    var internalId = request.internal_id;

    return([loadRecord(recordType, internalId)]);
}

function newRecords(request) {
	/*
	 * Description: Creates a record with given field values, can ignore validations if requested
	 * Params:
	 *              request.record_type:      String matching a record type
	 *              request.record_data:      String/value pairs to populate record field data
	 *              request.do_sourcing:      Boolean value to set sourcing (the hell is this?)
	 *              request.ignore_mandatory: Boolean value to set ignoring of validations for mandatory fields
	 *
	 * Return:      Internal id of comitted record if successful, exception if not
	*/
    var recordType      = request.record_type;
    var recordData      = request.record_data;
    var doSourcing      = request.do_sourcing;
    var ignoreMandatory = request.ignore_mandatory;

    var newRecord       = createRecord(recordType, recordData);

    return([submitRecord(newRecord, doSourcing, ignoreMandatory)]);
}

function updateRecords(request) {
	/*
	 * Description: Updates a record with given field values, can ignore validations if requested
	 * Params:
	 *              request.record_type:      String matching a record type
	 *              request.internal_id:      String matching the internal id of a record
	 *              request.do_sourcing:      Boolean value to set sourcing (the hell is this?)
	 *              request.ignore_mandatory: Boolean value to set ignoring of validations for mandatory fields
	 *
	 * Return:      Internal id of the comitted record if successful, false if not
	*/
    var recordType      = request.record_type;
    var internalId      = request.internal_id;
    var doSourcing      = request.do_sourcing;
    var ignoreMandatory = request.ignoreMandatory;

    var record          = loadRecord(recordType, internalId);

    if(record) {
      return([submitRecord(record, doSourcing, ignoreMandatory)]);
    }
    return(false);
}

function destroyRecords(request) {
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

    return([deleteRecord(recordType, internalId)]);
}