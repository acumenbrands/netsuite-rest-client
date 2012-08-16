require 'rest-client'
require 'json'
require 'uri'

BASE_URL                  = "https://rest.netsuite.com/app/site/hosting/restlet.nl"
DEFAULT_SCRIPT_ID         = 12
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
                  'search_filters' => search_filters,
                  'return_columns' => return_columns }

      batch_size = options[:search_batch_size] || @search_batch_size
      if batch_size.to_i % 1000 == 0
        payload['batch_size'] = batch_size
      else
        warn "Batch size is not a multiple of 1000, defaulting to #{DEFAULT_SEARCH_BATCH_SIZE}!"
        payload['batch_size'] = DEFAULT_SEARCH_BATCH_SIZE
      end

      begin
        results_segment, payload['start_id'] = *parse_json_result_from_rest(:post, params, :payload=>payload)
        results += results_segment unless results_segment.empty?
        puts "Fetched #{results.count} records so far, querying from #{payload['start_id']}..." if options[:verbose]
      end while (results_segment.length == payload['batch_size'].to_i)

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

      internal_ids = internal_ids.map { |id| id.to_s }

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
      params  = { 'script'      => @script_id,
                  'deploy'      => @deploy_id,
                  'operation'   => 'SAVED',
                  'record_type' => record_type,
                  'search_id'   => search_id,
                  'start_id'    => 0 }

      batch_size = options[:search_batch_size] || @search_batch_size
      if batch_size.to_i % 1000 == 0
        params['batch_size'] = batch_size
      else
        warn "Batch size is not a multiple of 1000, defaulting to #{DEFAULT_SEARCH_BATCH_SIZE}!"
        params['batch_size'] = DEFAULT_SEARCH_BATCH_SIZE
      end

      begin
        results_segment, params['start_id'] = *parse_json_result_from_rest(:get, params)
        results_segment.class == Array ? results += results_segment : raise("Search error: #{results_segment}")
        puts "Fetched #{results.count} records so far, querying from #{params['start_id']}..." if options[:verbose]
      end while (results_segment.length == params['batch_size'].to_i)

      results
    end

    def parse_json_result_from_rest(method, params, options={})
      rest_params = { :method  => method,
                      :url     => create_url(params),
                      :headers => @headers,
                      :cookies => @cookies,
                      :timeout => @timeout }

      if options[:payload]
        rest_params[:payload]      = stringify(options[:payload]).to_json
        rest_params[:content_type] = :json
        rest_params[:accept]       = :json
      end

      reply = nil
      retryable(@retry_limit, Exception) do
        reply = RestClient::Request.execute(rest_params) { |response, request, result, &block|
          case response.code
          when 200
            response
          else
            raise "Error with Netsuite response: #{response}"
          end
        }
      end

      begin
        parsed = JSON.parse(reply, :symbolize_names=>true)
      rescue Exception => e
        raise "Unable to parse reply from Netsuite: #{reply}"
      end

      if parsed.first
        parsed.last[0]
      else
        raise "Error processing request: #{parsed.last[0].to_s}"
      end
    end

    def stringify(data)
      if data.class == Array
        data.map { |value_item| stringify(value_item) }
      elsif data.class == Hash
        data.inject({}) do |hash, (key, value)|
          hash[key.to_s] = stringify(value)
          hash
        end
      else
        data.to_s
      end
    end

    def create_url(params)
      BASE_URL + '?' + params.map { |key, value| "#{key}=#{value}" }.join('&')
    end

    def retryable(tries, exception, &block)
      begin
        return yield
      rescue *exception
        retry if (tries -= 1) > 0
      end

      yield
    end
  end
end
