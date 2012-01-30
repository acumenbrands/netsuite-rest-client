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

      @headers = { :authorization  => auth_string,
                   :content_type   => "application/json" }

      @cookies = { "NS_VER" => "2011.2.0" }
    end

    def get_saved_search(record_type, search_id, script_id, deploy_id, batch_size=20000, initial_id=0, timeout=-1)
      params = { "script"      => 10,
                 "deploy"      => 1,
                 "record_type" => record_type,
                 "search_id"   => search_id }

      $stderr.puts "Executing request via URL #{create_url(params)} and headers #{@headers}"

      results = Array.new
      lower_bound = initial_id
      upper_bound = initial_id + batch_size
      while true
        params['lower_bound'] = lower_bound
        params['upper_bound'] = upper_bound
        results_segment = JSON.parse(RestClient::Request.execute :method  => :get,
                                                                 :url     => create_url(params),
                                                                 :headers => @headers,
                                                                 :cookies => @cookies,
                                                                 :timeout => timeout)
        results += results_segment
        break if results_segment.empty? || results_segment.length < batch_size
      end
    end

    def create_url(params)
      BASE_URL + '?' + params.map { |key, value| "#{key}=#{value}" }.join('&')
    end
  end
end
