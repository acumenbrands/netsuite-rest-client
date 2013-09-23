/*
 * This RESTlet covers the basic operations for interacting with Netsuite data.
*/

/*
 * Constants
*/
var OPERATIONS = { 'CREATE':    { 'function':       'initializeRecord',
                                  'access':         'GET',
                                  'baseGovernance': 10 },
                   'LOAD':      { 'function':       'loadRecord',
                                  'access':         'POST',
                                  'baseGovernance': 10 },
                   'SAVED':     { 'function':       'getSavedSearch',
                                  'access':         'GET',
                                  'baseGovernance': 10 },
                   'SEARCH':    { 'function':       'searchRecords',
                                  'access':         'POST',
                                  'baseGovernance': 10 },
                   'UPSERT':    { 'function':       'upsertRecords',
                                  'access':         'POST',
                                  'baseGovernance': 20 },
                   'DELETE':    { 'function':       'deleteRecords',
                                  'access':         'POST',
                                  'baseGovernance': 20 },
                   'TRANSFORM': { 'function':       'transformRecords',
                                  'access':         'POST',
                                  'baseGovernance': 20 } }

/*
 * **Utility Functions**
*/
function evalOperation(method, operation, request) {
    /*
     * Description: Evalutes the function call passed in by the client
     * Params:
     *              request: Request object from the REST client
     *
     * Return:      Passes up the values produced by API wrapper functions
    */
    if(method == OPERATIONS[operation]['access']) {
        return(eval(OPERATIONS[operation]['function'] + "(request);"));
    }
    else {
        var errorMessage = "The operation [" + operation + "] cannot be accessed via the REST method " +
                           "requested. Methods allowed: [" + OPERATIONS[operation]['access'] + "]";
        throw new Error(errorMessage);
    }
}

function performSearch(recordType, batchSize, lowerBound, rawFilters, rawColumns) {
    /*
     * Description: Runs a search based on the given field->value criteria
     * Params:
     *              recordType: The type of record to be covered by the search
     *              batchSize:  Size of the batch to be returned upon completion
     *              lowerBound: Id to determine the lower bound of the batch, results
     *                          returned will all have ids greater than the value given
     *              rawFilters: Hash of fields with the values to be matched by an included operator
     *              rawColumns: Hash of the columns with joins names to be returned for each record
     *
     * Return:      A list of results with ids and columns to match the results filter
    */
    var searchFilters      = [new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lowerBound)];
    var returnColumns      = [new nlobjSearchColumn('internalid', null).setSort()];
    var accumulatedResults = [];

    for(var filter in rawFilters) {
        searchFilters[searchFilters.length]  = new nlobjSearchFilter(filter, null,
                                                                     rawFilters[filter]['operator'],
                                                                     rawFilters[filter]['value']);
        if(rawFilters[filter].hasOwnProperty('formula')) {
          fieldName    = rawFilters[filter]['formula']['field']
          valueList    = rawFilters[filter]['formula']['values']
          comparison   = rawFilters[filter]['formula']['comparison']
          joinOperator = rawFilters[filter]['formula']['join_operator']
          conditions   = [];

          formulaString  = "CASE WHEN (";
          for(index in valueList) {
            conditions.push("{" + fieldName + "} " + comparison + " '" + valueList[index] + "'");
          }
          formulaString += conditions.join(' ' + joinOperator + ' ');
          formulaString += ") THEN 1 ELSE 0 END"

          // return([[formulaString], 0]);

          searchFilters[searchFilters.length-1].setFormula(formulaString);
        }
    }

    for(var column in rawColumns) {
        returnColumns[returnColumns.length]  = new nlobjSearchColumn(column,
                                                                     rawColumns[column]);
    }

    do {
        var tempItems = nlapiSearchRecord(recordType, null, searchFilters, returnColumns);
        if(tempItems) {
            lowerBound         = tempItems[tempItems.length - 1].getId();
            accumulatedResults = accumulatedResults.concat(tempItems);
        }
    } while(tempItems && tempItems.length == 1000 && accumulatedResults.length < batchSize);

    return([accumulatedResults, lowerBound]);
}

function populateLineItems(record, lineItemHash) {
    for(var lineItemFieldName in lineItemHash) {
        // remove any extra line items on the record that don't match an incoming lineitem
        while (lineItemHash[lineItemFieldName].length < record.getLineItemCount(lineItemFieldName)) {
          record.removeLineItem(lineItemFieldName, 1);
        }
        for(var index = 0; index < lineItemHash[lineItemFieldName].length; index++) {
            // insert any new lineitems necessary for incoming lines
            if (record.getLineItemCount(lineItemFieldName) < lineItemHash[lineItemFieldName].length) {
                record.insertLineItem(lineItemFieldName, index+1);
            }
            record.selectLineItem(lineItemFieldName, index+1);
            for(lineItemField in lineItemHash[lineItemFieldName][index]) {
                record.setCurrentLineItemValue(lineItemFieldName, lineItemField,
                                        lineItemHash[lineItemFieldName][index][lineItemField]);
            }
            record.commitLineItem(lineItemFieldName);
        }
    }
}

// eg: slist = { apply: { doc: 1323, amount: 10, apply: true } }
//     hash  = { paymentmethod: 2, customer: 1777, sublist_fields: slist }
//     updateSublist('customerrefund', hash)
function updateSublist(recordType, hash) {
    var record = nlapiCreateRecord(recordType, {'recordmode': 'dynamic'});

    for(var k in hash) {
	if(k == 'sublist_fields')
	    continue;
	record.setFieldValue(k, hash[k]);
    }

    for(var slistType in hash['sublist_fields']) {
	var cnt       = record.getLineItemCount(slistType);
	var docIdHash = group_by(hash['sublist_fields'][slistType], 'doc');

	for(var i = 1; i <= cnt; ++i) {
	    record.selectLineItem(slistType, i);
	    var recId = record.getCurrentLineItemValue(slistType, 'doc');
	    var h     = docIdHash[recId];
	    if(h != undefined) {
		for(var k in h)
		    record.setCurrentLineItemValue(slistType, k, h[k]);
		record.commitLineItem(slistType);
	    }
	}
    }
    return [nlapiSubmitRecord(record)];
}

function governanceCheck(operation, iterations) {
    /*
     * Description: Determins if a given execution of this method will exceed the governance limit
     * Params:
     *              function:   Function object
     *              iterations: Integer count of the number of iterations of governed nlapi calls
     *                          the execution will make
     *
     * Return:      True if under the limite, false if not
    */
    var governanceLimit = nlapiGetContext().getRemainingUsage();

    if(OPERATIONS['operation']['baseGovernance']*iterations > governanceLimit) {
        return(false);
    }
    return(true);
}

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
        return(serializedException.concat(exception.getStackTrace()));
    }
    catch(stack_fetch_error) {
        return(serializedException.concat([stack_fetch_error.message]));
    }
}

/*
 * Netsuite API Call Wrapper Functions
*/
function initializeRecord(request) {
    /*
     * Description: Retrieves an initialized object with the given parameters
     * Params:
     *              request.recordType:      String matching a record type
     *
     * Return:      An instantiated object of the given type
    */
    var recordType = request.record_type;

    return(nlapiCreateRecord(recordType));
}

function loadRecord(request) {
    /*
     * Description: Retrieves a single record based on query fields
     * Params:
     *              request['record_type']:      String matching a record type
     *              request['internal_id_list']: Array of Strings matching the internal ids of multiple records
     *
     * Return:      Record of given type with given id
    */
    var recordType     = request['record_type'];
    var internalIdList = request['internal_id_list'];
    var recordList     = [];

    for(var index = 0; index < internalIdList.length; index++) {
        recordId = internalIdList[index];

        try {
            recordList.push(nlapiLoadRecord(recordType, recordId));
        }
        catch(load_exception) {
            recordList.push(formatException(load_exception));
        }
    }

    return(recordList);
}

function searchRecords(request) {
    /*
     * Description: Runs a search based on the given field->value criteria
     * Params:
     *              request['record_type']:    The type of record to be covered by the search
     *              request['search_filters']: List of fields with the values to be matched
     *              request['return_columns']: List of the columns names to be returned for each record
     *              request['batch_size']:     Size of the batch to be returned upon completion
     *              request['start_id']:       Id to determine the lower bound of the batch, results
     *                                         returned will all have ids greater than the value given
     *
     * Return:      A list of results with ids and columns to match the results filter
    */
    var recordType         = request['record_type'];
    var batchSize          = request['batch_size'];
    var lowerBound         = request['start_id'];
    var rawFilters         = request['search_filters'];
    var rawColumns         = request['return_columns'];

    return(performSearch(recordType, batchSize, lowerBound, rawFilters, rawColumns));
}

function upsertRecords(request) {
    /*
     * Description: Updates a record with given field values, can ignore validations if requested
     * Params:
     *              request['record_type']:      String matching a valid record type
     *              request['record_data']:      Raw Record data
     *              request['update_only']:      Boolean value that, if true, only allows updates to occur,
     *                                           no new records will be created
     *              request['do_sourcing']:      Boolean value to set sourcing mode
     *              request['ignore_mandatory']: Boolean value to set ignoring of validations for mandatory fields
     *
     * Return:      Internal ids of the comitted records and errors for uncommitted records
    */
    var recordType      = request['record_type'];
    var recordData      = request['record_data'];
    var doSourcing      = request['do_sourcing'];
    var ignoreMandatory = request['ignore_mandatory'];
    var staticSublist   = request['static_sublist'];
    var writeResults    = [];

    for(var index = 0; index < recordData.length; index++) {
        attributes = recordData[index];
        record     = null;

        try {
	    if(staticSublist == 'T')
		return updateSublist(recordType, recordData[index]);

            if(attributes['id'] != undefined) {
                record = nlapiLoadRecord(recordType, attributes['id']);
            } else {
                record = nlapiCreateRecord(recordType);
            }
            for(var field in attributes) {
                record.setFieldValue(field, attributes[field]);
                if(field=='sublist_fields') { populateLineItems(record, attributes[field]); }
            }
            writeResults = writeResults.concat([[nlapiSubmitRecord(record, doSourcing, ignoreMandatory), attributes]]);
        }
        catch(write_exception) {
            writeResults = writeResults.concat([[formatException(write_exception), attributes]]);
        }
    }

    return(writeResults);
}

function deleteRecords(request) {
    /*
     * Description: Deletes a record of given type with the given ids
     * Params:
     *              request['record_type']:  String matching a record type
     *              request['internal_ids']: Array of record ids
     *
     * Return:      An array of ids pairs with false, if no exception, and a formatted exception
     *              in the event of an error with deletion
    */
    var recordType  = request['record_type'];
    var internalIds = request['internal_ids'];
    var results     = [];

    for(var index = 0; index < internalIds.length; index++) {
        itemId = internalIds[index];

        try {
            nlapiDeleteRecord(recordType, itemId);
            results = results.concat([itemId, false]);
        }
        catch(exception) {
            results = results.concat([itemId, formatException(exception)]);
        }
    }

    return(results);
}

function transformRecords(request) {
    /*
     * Description: Transforms records from their original, given type to the requested type.
     *
     * Params:
     *              request['initial_record_type']:    String of the initial record type to lookup
     *              request['result_record_type']:     String of the record type post-transformation
     *              request['internal_id']:            Internal ID of the record to be transformed
     *              request['field_changes']:          A hash of field names as keys with their values
     *              request['sublist_changes']:        A hash of sublist names with assigned arrays of hashes;
     *                                                 hashes within the list correspond by internal id to
     *                                                 referenced line items. Line items referenced will be
     *                                                 altered according to field values given, unreferenced
     *                                                 items will be removed from the list in the transformed
     *                                                 record.
     *
     * Return:      Array of original record ids paired with the internal id of the transformed
     *              record or an error for a failed transformation
    */
    var initialRecordType = request['initial_record_type'];
    var resultRecordType  = request['result_record_type'];
    var internalId        = request['internal_id'];
    var fieldChanges      = request['field_changes'];
    var sublistChanges    = request['sublist_changes'];

    newRecord = nlapiTransformRecord(initialRecordType, internalId, resultRecordType);

    // Alter field values on transformed record
    for(var field in fieldChanges) { newRecord.setFieldValue(field, fieldChanges[field]); }

    for(var sublistName in sublistChanges) {
        matchField      = sublistChanges[sublistName]['match_field'];
        sublistItems    = sublistChanges[sublistName]['line_items'];
        indexesToDelete = [];

        // Alter line item values to match hash values, remove items that are not referenced
        for(var lineItemIndex = 1; lineItemIndex < (newRecord.getLineItemCount(sublistName) + 1); lineItemIndex++) {

            for(var sublistItemDataIndex = 0; sublistItemDataIndex < sublistItems.length; sublistItemDataIndex++) {
                sublistItemData = sublistItems[sublistItemDataIndex];

                if(newRecord.getLineItemValue(sublistName, matchField, lineItemIndex) == sublistItemData[matchField]) {
                    found = true;

                    for(var sublistItemField in sublistItemData) {
                        if(sublistItemField == matchField) { continue; }
                        newRecord.setLineItemValue(sublistName, sublistItemField, lineItemIndex,
                                                   sublistItemData[sublistItemField]);
                    }
                }
            }
            if(!found) { indexesToDelete = indexesToDelete.concat([lineItemIndex]); }
        }

        deletionCount = 0;
        for(var index = 0; index < indexesToDelete.length; index++) {
            deletionIndex = indexesToDelete[index];
            newRecord.removeLineItem(sublistName, (deletionIndex - deletionCount));
            deletionCount++;
        }
    }

    return([nlapiSubmitRecord(newRecord, false, false), [internalId, fieldChanges, sublistChanges]]);
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
    var lowerBound         = request.start_id;
    var accumulatedResults = [];
    var searchFilters      = [new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lowerBound)];
    var returnColumns      = [new nlobjSearchColumn('internalid', null).setSort()];

    do {
        var tempItems = nlapiSearchRecord(recordType, searchId, searchFilters, returnColumns);
        if(tempItems) {
            lowerBound = tempItems[tempItems.length - 1].getId();
            searchFilters      = [new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lowerBound)];
            accumulatedResults = accumulatedResults.concat(tempItems);
        }
    } while(tempItems && tempItems.length == 1000 && accumulatedResults.length < batchSize);

    return([accumulatedResults, lowerBound]);
}

/*
 * Handler Functions
*/
function getHandler(request) {
    /*
     * Description: Method to handle requests over GET
     * Params:
     *              request: Request object from the REST client
     *
     * Return:      JSON response
    */
    try {
        return([true].concat([evalOperation('GET', request.operation, request)]));
    }
    catch(exception) {
        return([false].concat([formatException(exception)]));
    }
}

function postHandler(request) {
    /*
     * Description: Method to handle requests over POST
     * Params:
     *              request: Request object from the REST client
     *
     * Return:      JSON response
    */
    try {
        return([true].concat([evalOperation('POST', request['operation'], request)]));
    }
    catch(exception) {
        return([false].concat([formatException(exception)]));
    }
}

//----------------------------------------------------------------------------
// Helper Functions
//-----------------

// Eg: group_by([{ id: 19, name: 'foo'}, { id: 20, name: 'bar'}], 'id')
//     => { 19 => { id: 19, name: 'foo' }, 20 => { id: 20, name: 'bar' } }
//group_by(hash['sublist_fields'][slistType], 'doc');
function group_by(hashArr, key) {
    var res = {};
    for(var i in hashArr) {
	var h = hashArr[i];
	res[h[key]] = h;
    }
    return res;
}
