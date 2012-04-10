require 'rest-client'
require 'json'
require 'uri'

BASE_URL                  = "https://rest.netsuite.com/app/site/hosting/restlet.nl"
DEFAULT_SCRIPT_ID         = 11
DEFAULT_DEPLOY_ID         = 1
DEFAULT_SEARCH_BATCH_SIZE = 1000
DEFAULT_RETRY_LIMIT       = 5
DEFAULT_REQUEST_TIMEOUT   = -1
DEFAULT_UPSERT_BATCH_SIZE = 40
DEFAULT_DELETE_BATCH_SIZE = 60

module Netsuite
  class Client

    attr_accessor :headers, :request_timeout, :rest_script_id,
                  :search_script_id, :rest_deploy_id, :search_deploy_id

    def initialize(account_id, login, password, role_id, options={})
      super()

      auth_string       = "NLAuth nlauth_account=#{account_id}," +
                          "nlauth_email=#{URI.escape(login, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]"))}," +
                          "nlauth_signature=#{password}," +
                          "nlauth_role=#{role_id}"

      @headers          = { :authorization  => auth_string,
                            :content_type   => "application/json" }

      @cookies          = { "NS_VER" => "2011.2.0" }

      @timeout          = options[:timeout] || DEFAULT_REQUEST_TIMEOUT

      @script_id   = options[:rest_script_id] || DEFAULT_SCRIPT_ID
      @deploy_id   = options[:rest_deploy_id] || DEFAULT_DEPLOY_ID

      @search_batch_size = options[:search_batch_size] || DEFAULT_SEARCH_BATCH_SIZE

      @retry_limit = options[:retry_limit] || DEFAULT_RETRY_LIMIT
    end

    def initialize_record(record_type)
      params = { 'script'      => @script_id,
                 'deploy'      => @deploy_id,
                 'operation'   => 'CREATE',
                 'record_type' => record_type }

      parse_json_result_from_rest(:get, params)
    end

    def get_record(record_type, internal_id)
      params = { 'script'      => @script_id,
                 'deploy'      => @deploy_id,
                 'operation'   => 'LOAD',
                 'record_type' => record_type,
                 'internal_id' => internal_id }

      parse_json_result_from_rest(:get, params)
    end

    def search_records(record_type, search_filters, return_columns, options={})
      results = Array.new
      params = { 'script' => @script_id,
                 'deploy' => @deploy_id }

      payload = { 'operation'      => 'SEARCH',
                  'record_type'    => record_type,
                  'start_id'       => 0,
                  'batch_size'     => options[:search_batch_size] || @search_batch_size,
                  'search_filters' => search_filters,
                  'return_columns' => return_columns }

      while true
        results_segment = nil
        (0..@retry_limit).each do |attempt|
          results_segment = parse_json_result_from_rest(:post, params, payload=>payload)
          break if !results_segment.nil? && results_segment.first.class == Array
        end
        raise results_segment.first.to_s if results_segment.first.class != Array
        results += results_segment.first
        break if results_segment.first.empty? || results_segment.first.length < payload['batch_size'].to_i
        puts "Fetched #{results.count} records so far, querying from #{results_segment.last}..." if options[:verbose]
        payload['start_id'] = results_segment.last.to_i
      end

      results
    end

    def upsert(record_type, record_data, options={})
      params  = { 'script'      => @script_id,
                  'deploy'      => @deploy_id }
      results = Array.new

      record_data.each_slice(options[:batch_size] || DEFAULT_UPSERT_BATCH_SIZE) do |record_data_chunk|
        payload = { 'operation'        => 'UPSERT',
                    'record_type'      => record_type,
                    'record_data'      => record_data_chunk,
                    'do_sourcing'      => options[:do_sourcing] || true,
                    'ignore_mandatory' => options[:ignore_mandatory] || false }

        results += parse_json_result_from_rest(:post, params, :payload=>payload)
      end

      results
    end

    def delete(record_type, internal_ids, options={})
      params  = { 'script'      => @script_id,
                  'deploy'      => @deploy_id }
      results = Array.new

      internal_ids.each_slice(options[:batch_size] || DEFAULT_DELETE_BATCH_SIZE) do |internal_ids_chunk|
        payload = { 'operation'    => 'DELETE',
                    'record_type'  => record_type,
                    'internal_ids' => internal_ids_chunk }

        results += parse_json_result_from_rest(:post, params, :payload=>payload)
      end

      results
    end

    def get_saved_search(record_type, search_id, options={})
      results = Array.new
      params = { 'script'      => @script_id,
                 'deploy'      => @deploy_id,
                 'operation'   => 'SAVED',
                 'record_type' => record_type,
                 'search_id'   => search_id,
                 'start_id'    => 0,
                 'batch_size'  => options[:search_batch_size] || @search_batch_size }

      while true
        results_segment = nil
        (0..@retry_limit).each do |attempt|
          results_segment = parse_json_result_from_rest(:get, params)
          break if !results_segment.nil? && results_segment.first.class == Array
        end
        raise results_segment.first.to_s if results_segment.first.class != Array
        results += results_segment.first
        break if results_segment.first.empty? || results_segment.first.length < params['batch_size'].to_i
        puts "Fetched #{results.count} records so far, querying from #{results_segment.last}..." if options[:verbose]
        params['start_id'] = results_segment.last.to_i
      end

      results
    end

    def parse_json_result_from_rest(method, params, options={})
      rest_params = { :method  => method,
                      :url     => create_url(params),
                      :headers => @headers,
                      :cookies => @cookies,
                      :timeout => @timeout }

      if options[:payload]
        rest_params[:payload]      = options[:payload].to_json
        rest_params[:content_type] = :json
        rest_params[:accept]       = :json
      end

      reply = RestClient::Request.execute(rest_params) { |response, request, result, &block|
        case response.code
        when 200
          response
        else
          raise "Error with Netsuite response: #{response}"
        end
      }
      
      begin
        JSON.parse(reply)
      rescue Exception => e
        raise "Unable to parse reply from Netsuite: #{reply}"
      end
    end

    def create_url(params)
      BASE_URL + '?' + params.map { |key, value| "#{key}=#{value}" }.join('&')
    end
  end
end
