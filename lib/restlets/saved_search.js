/* function getSavedSearch(request)
{
    var recordtype = request.record_type;
    var search_id  = request.search_id;
    var searchResults = nlapiSearchRecord(recordtype, search_id, null, null);
    return(searchResults);
} */

function getSavedSearch(request)
{
    var accumulatedResults = [];
    var lastId = 0;
    var searchId = request.search_id;
    var recordType = request.record_type;

    do{
        var tempItems = nlapiSearchRecord(recordType, searchId,
        [
            new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId)
        ], null);
        if(tempItems)
        {
            lastId = tempItems[tempItems.length -1].getId();
            accumulatedResults = accumulatedResults.concat(tempItems);
        }
    }while(tempItems && tempItems.length == 1000);

    return(accumulatedResults);
}
