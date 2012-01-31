/*
 * This RESTlet GET function will return a set of results either encompassing the entire
 * result set of a saved search, or will accept bounding IDs to limit the search in the
 * event that the request takes longer than the 5 minute limit Netsuite imposes upon requests.
 *
 * The saved search results *must* be sorted by id.
*/

function getSavedSearch(request)
{
    var accumulatedResults = [];
    var searchId           = request.search_id;
    var recordType         = request.record_type;
    var batchSize          = request.batch_size
    var lastId             = request.start_id

    do{
        var tempItems = nlapiSearchRecord(recordType, searchId,
        [
            new nlobjSearchFilter('internalidnumber', null, 'greaterthanorequalto', lastId)
        ], null);
        if(tempItems)
        {
            lastId = tempItems[tempItems.length - 1].getId();
            accumulatedResults = accumulatedResults.concat(tempItems);
        }
    }while(tempItems && accumulatedResults.length < batchSize);

    return([accumulatedResults, lastId]);
}

D-81722-S0BLFZ
