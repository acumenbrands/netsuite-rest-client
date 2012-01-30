require 'rest-client'
require 'json'

module Netsuite
  class Client
    BASE_URL = "https://rest.netsuite.com/app/site/hosting/restlet.nl"

    attr_accessor :headers

    def initialize(account_id, login, password, role_id)
      super()

      auth_string = "NLAuth nlauth_account=#{account_id}," +
                    "nlauth_email=#{login}," +
                    "nlauth_signature=#{password}," +
                    "nlauth_role=#{role_id}"
      @headers = { :authorization => auth_string,
                   :content_type   => "application/json" }
      @cookies = { "NS_VER" => "2011.2.0" }
    end

    def get_saved_search(record_type, search_id, batch_size=20000, options={})
      url = BASE_URL  + "?script=10&deploy=1&record_type=#{record_type}&search_id=#{search_id}"
      params = {
                 "script" => 10,
                 "deploy" => 1,
                 "record_type" => record_type,
                 "search_id" => search_id,
               }

      $stderr.puts "Executing request via URL #{url} and headers #{@headers}"

      results_json = RestClient::Request.execute :method => :get,
                                                 :url => url,
                                                 :headers => @headers,
                                                 :cookies => @cookies,
                                                 :timeout => -1

      JSON.parse(results_json)
    end
  end
end
