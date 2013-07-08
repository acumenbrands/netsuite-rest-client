function afterSubmit(type) {
  var recordId = nlapiGetRecordId();
  var recordType = nlapiGetRecordType();
  var response = nlapiRequestURL('{URL}?id=' + recordId + '&recordType=' + recordType +'&type=' + type, null, null, null);
}

