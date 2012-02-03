require 'rest-client'
require 'json'
require 'uri'

module Netsuite
  class Client
    BASE_URL = "https://rest.netsuite.com/app/site/hosting/restlet.nl"
    DEFAULT_SCRIPT_ID = 10
    DEFAULT_DEPLOY_ID = 1
    DEFAULT_BATCH_SIZE = 20000
    DEFAULT_TIMEOUT = -1

    attr_accessor :headers

    def initialize(account_id, login, password, role_id)
      super()

      auth_string = "NLAuth nlauth_account=#{account_id}," +
                    "nlauth_email=#{URI.escape(login, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]"))}," +
                    "nlauth_signature=#{password}," +
                    "nlauth_role=#{role_id}"

      @headers = { :authorization  => auth_string,
                   :content_type   => "application/json" }

      @cookies = { "NS_VER" => "2011.2.0" }
    end

    def get_saved_search(record_type, search_id, options={})
      params = { 'script'      => options[:script_id] || DEFAULT_SCRIPT_ID,
                 'deploy'      => options[:deploy_id] || DEFAULT_DEPLOY_ID,
                 'record_type' => record_type,
                 'search_id'   => search_id,
                 'start_id'    => options[:start_id] || 0,
                 'batch_size'  => options[:batch_size] || DEFAULT_BATCH_SIZE }

      results = Array.new
      while true
        puts "Fetched #{results.count} records so far, now fetching from #{params['start_id']}..."
        results_segment = JSON.parse(RestClient::Request.execute :method  => :get,
                                                                 :url     => create_url(params),
                                                                 :headers => @headers,
                                                                 :cookies => @cookies,
                                                                 :timeout => timeout)
        results += results_segment.first
        break if results_segment.first.empty? || results_segment.first.length < batch_size
        params['start_id'] = results_segment.last.to_i
      end
      results
    end

    def create_url(params)
      BASE_URL + '?' + params.map { |key, value| "#{key}=#{value}" }.join('&')
    end
  end
end
