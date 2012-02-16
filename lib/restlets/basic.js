/*
 * This RESTlet will cover the basic operations for interacting with Netsuite data
*/

function loadRecord(recordType, internalId) {
	/*
	 * Description: Performs record loads and handles exceptions in the event of no record found
	 * Params:
	 *         recordType: String matching a record type
	 *         internalId: String matching the internal id of a record
	 * Return:      Netsuite record with given type and id or null if none found
	*/
	return(nlapiLoadRecord(recordType, internalId));
}

function getRecord(request) {
	/*
	 * Description: Retrieves a single record based on query fields
	 * Params:
	 *         request.record_type: String matching a record type
	 *         request.internal_id: String matching the internal id of a record
	 * Return:      Record of given type or null if not found
	*/
    var recordType = request.record_type;
    var internalId = request.internal_id;

    return(loadRecord(recordType, internalId));
}

function createRecord(request) {
	/*
	 * Description: Creates a record with given field values, can ignore validations if requested
	 * Params:
	 *         request.record_type:      String matching a record type
	 *         request.record_data:      String/value pairs to populate record field data
	 *         request.do_sourcing:      Boolean value to set sourcing (the hell is this?)
	 *         request.ignore_mandatory: Boolean value to set ignoring of validations for mandatory fields
	 * Return:      Internal id of comitted record if successful, false if not
	*/
    var recordType      = request.record_type;
    var recordData      = request.record_data;
    var doSourcing      = request.do_sourcing;
    var ignoreMandatory = request.ignore_mandatory;

    var newRecord       = nlapiCreateRecord(recordType, recordData);

    return(nlapiSubmitRecord(newRecord, doSourcing, ignoreMandatory));
}

function updateRecord(request) {
	/*
	 * Description: Updates a record with given field values, can ignore validations if requested
	 * Params:
	 *         request.record_type:      String matching a record type
	 *         request.internal_id:      String matching the internal id of a record
	 *         request.do_sourcing:      Boolean value to set sourcing (the hell is this?)
	 *         request.ignore_mandatory: Boolean value to set ignoring of validations for mandatory fields
	 * Return:      Internal id of the comitted record if successful, false if not
	*/
    var recordType      = request.record_type;
    var internalId      = request.internal_id;
    var doSourcing      = request.do_sourcing;
    var ignoreMandatory = request.ignoreMandatory;

    var record          = loadRecord(recordType, internalId);

    if(record) {
      return(nlapiSubmitRecord(record, doSourcing, ignoreMandatory));
    }
    return(false);
}

function deleteRecord(request) {
	/*
	 * Description: Deletes a record of given type with given id
	 * Params:
	 *         request.record_type: String matching a record type
	 *         request.internal_id: String matching the internal id of a record
	 * Return:      True if successful, false if not
	*/
	var recordType = request.record_type;
	var internalId = request.internal_id;

    nlapiDeleteRecord(recordType, internalId);

	if(loadRecord(recordType, internalId) {
		return(false);
	}
	return(true);
}