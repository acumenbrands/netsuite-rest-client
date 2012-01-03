require File.expand_path(File.dirname(__FILE__) + '/spec_helper')

describe "NetsuiteRestClient" do
  it "should get a saved search" do
    nsc = Netsuite::Client.new(ENV['NETSUITE_ACCOUNT_ID'], ENV['NETSUITE_LOGIN'], ENV['NETSUITE_PASSWORD'], ENV['NETSUITE_ROLE_ID'])
    res = nsc.get_saved_search('InventoryItem', '678')
    res.should_not be_empty
    res.should be_kind_of(Array)
    res.first.should be_kind_of(Hash)
    puts "returned result of #{res.count} rows"
  end
end
