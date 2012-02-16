/*
 * This RESTlet GET function will return a set of results either encompassing the entire
 * result set of a saved search, or will accept bounding IDs to limit the search in the
 * event that the request takes longer than the 5 minute limit Netsuite imposes upon requests.
 *
 * The saved search results *must* be sorted by id.
*/

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

    try {
        do {
            var tempItems = nlapiSearchRecord(recordType, searchId, searchFilters, null);
            if(tempItems) {
                lastId = tempItems[tempItems.length - 1].getId();
                accumulatedResults = accumulatedResults.concat(tempItems);
            }
        } while(tempItems && tempItems.length == 1000 && accumulatedResults.length < batchSize);

        return([accumulatedResults, lastId]);
    }
    catch(exception) {
        return([exception.message]);
    }
}