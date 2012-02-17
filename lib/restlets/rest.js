/*
 * This RESTlet covers the operations for interacting with Netsuite data.
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
    return(nlapiLoadRecord(recordType, internalId));
}

function initializeRecord(recordType) {
	/*
	 * Description: Retrieves an initialized object with the given parameters
	 * Params:
	 *              request.recordType:      String matching a record type
	 *
	 * Return:      An instantiated object of the given type
	*/
    return(nlapiCreateRecord(recordType));
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
    return(nlapiSubmitRecord(record, doSourcing, ignoreMandatory));
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
	nlapiDeleteRecord(recordType, internalId);
}

function getSavedSearch(request) {
    /*
     * Description: Retrieves results from a given saved search of the defined batch size rounded up to the next
     *              one thousand records
     * Params:
     *              request.search_id:   Id of the saved search to run
     *              request.record_type: String of the record type to fetch
     *              request.batch_size:  Size of the batch to be returned upon completion
     *              request.start_id:    Id to determine the lower bound of the batch, results
     *                                   returned will all have ids greater than the value given
     *
     * Return:      List of result rows with internal ids from the given start_id up through a count of the given
     *              batch size or next highest multiple of one thousand from the given batch size if the given size
     *              is not a multiple of one thousand
    */
    var searchId           = request.search_id;
    var recordType         = request.record_type;
    var batchSize          = request.batch_size;
    var lastId             = request.start_id;
    var accumulatedResults = [];

    var searchFilters      = [new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId)];

    do {
        var tempItems = nlapiSearchRecord(recordType, searchId, searchFilters, null);
        if(tempItems) {
            lastId = tempItems[tempItems.length - 1].getId();
            accumulatedResults = accumulatedResults.concat(tempItems);
        }
    } while(tempItems && tempItems.length == 1000 && accumulatedResults.length < batchSize);

    return([accumulatedResults, lastId]);
}

function getHandler(request) {
	/*
	 * Description: Returns an existing record or a newly initialized record
	 * Params:
	 *              request.record_type: String matching a record type
	 *              request.internal_id: String matching the internal id of a record
	 *
	 * Return:      Serialized Netsuite record object
    */
    var recordType = request.record_type;
    var internalId = request.internal_id;

    try {
        if(internalId) {
            return(loadRecord(recordType, internalId));
        }
        else {
            return(initializeRecord(recordType));
        }
    }
    catch(exception) {
    	return(formatException(exception));
    }
}

function postHandler(request) {
	try {
        return(true);
	}
	catch(exception) {
		return(formatException(exception));
	}
}

function putHandler(request) {
    try {
        return(true);
	}
	catch(exception) {
		return(formatException(exception));
	}
}

function deleteHandler(request) {
    /*
     * Description: Executes a delete request for the given record type with the given id
     * Params:
     *              request.record_type: String matching a record type
     *              request.internal_id: String matching an internal id of a record
     *
     * Return:      True if successful, exception if not
    */
    var recordType = request.record_type;
    var internalId = request.internal_id;

    try {
        return(deleteRecord(recordType, InternalId));
	}
	catch(exception) {
		return(formatException(exception));
	}
}