/* function getSavedSearch(request)
{
    var recordtype = request.record_type;
    var search_id  = request.search_id;
    var searchResults = nlapiSearchRecord(recordtype, search_id, null, null);
    return(searchResults);
} */

function getSavedSearch(request)
{
    var accum = [];
    var lastId = 0;
    var search_id = request.search_id;
    var recordtype = request.record_type;

    do{
        var tempItems = nlapiSearchRecord(recordtype, search_id,
        [
            new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId)
        ], null);
        if(tempItems)
        {
            lastId = tempItems[tempItems.length -1].getId();
            accum = accum.concat(tempItems);
        }
    }while(tempItems && tempItems.length == 1000);

    return(accum);
}
