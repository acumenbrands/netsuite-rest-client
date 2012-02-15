/*
 * This RESTlet will cover the basic REST operations for Netsuite.
*/

function getRecord(request) {
    var recordType = request.record_type;
    var recordId   = request.record_id;

    return(nlapiLoadRecord(recordType, id));
}
