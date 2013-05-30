require 'spec_helper'

describe "NetsuiteRestClient" do
  let(:nsc) do
    Netsuite::Client.new(
      '1210093', 'mike@theclymb.com', 'fall2009', 3,
      #'12345', 'bob@example.com', 'password', 3,
      :rest_script_id => 18, :rest_deploy_id => 1)
  end

  it 'can create a blank record' do
    res = nsc.initialize_record('Vendor')
    res.should_not be_empty
    res.should be_kind_of(Hash)
    res[:recordtype].should == 'Vendor'
  end

  it "should get a record" do
    res = nsc.get_record('Vendor', '920')
    res.should_not be_empty
    res.should be_kind_of(Hash)
    res[:entityid].should == "Spy Optic, Inc."
    res[:id].should == '920'
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
