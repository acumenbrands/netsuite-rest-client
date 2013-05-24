require 'spec_helper'

describe "NetsuiteRestClient" do
 let(:nsc) {
   Netsuite::Client.new(ENV['NETSUITE_ACCOUNT_ID'],
                        ENV['NETSUITE_LOGIN'],
                        ENV['NETSUITE_PASSWORD'],
                        ENV['NETSUITE_ROLE_ID'])
 }

  it "should get a saved search" do
    res = nsc.get_saved_search('InventoryItem', '678')
    res.should_not be_empty
    res.should be_kind_of(Array)
    res.first.should be_kind_of(Hash)
    puts "returned result of #{res.count} rows"
  end

  describe "#stringify" do
    it "handles booleans" do
    nsc.stringify(true).should == "T"
    nsc.stringify(false).should == "F"
    end
  end

  describe "#collapse_internal_ids" do
    it "handles regular hashes" do
      data = {:some_key => :some_value }
      data = nsc.collapse_internal_ids(data)
      data.should == {:some_key => :some_value }
    end

    it "handles simple hashes" do
      data = {:item=>{:name=>"400000000039", :internalid=>"414"}}
      data = nsc.collapse_internal_ids(data)
      data.should == {:item => "414"}
    end

    it "handles slightly more complex hashes" do
      data = {:key1 => :val1, :someother_key => :someother_value, :item=>{:name=>"400000000039", :internalid=>"414"}}
      data = nsc.collapse_internal_ids(data)
      data.should == {:key1 => :val1, :someother_key => :someother_value, :item => "414"}
    end

    it "handles slightly more complex hashes again" do
      data = {:someother_key => :someother_value, :item => [{:item=>{:name=>"400000000039", :internalid=>"414"}}] }
      data = nsc.collapse_internal_ids(data)
      data.should == {:someother_key => :someother_value, :item => [{:item => "414"}]}
    end
  end

end
