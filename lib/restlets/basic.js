/*
 * This RESTlet will cover the basic REST operations for Netsuite.
*/

function getRecord(request) {
    var recordType = request.record_type;
    var internalId = request.internal_id;

    return(nlapiLoadRecord(recordType, internalId));
}
