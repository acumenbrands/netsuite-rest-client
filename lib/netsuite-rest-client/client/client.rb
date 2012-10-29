module NetsuiteRESTClient
  module Client
    extend self

    extend Components::Header
    extend Components::Operations::Initialize
    extend Components::Operations::Get
    extend Components::Operations::Update
    extend Components::Operations::Upsert
    extend Components::Operations::Delete
    extend Components::Operations::Transform
    extend Components::Operations::Search

    # def parse_json_result_from_rest(method, params, options={})
    #   rest_params = { :method  => method,
    #                   :url     => create_url(params),
    #                   :headers => @headers,
    #                   :cookies => @cookies,
    #                   :timeout => @timeout }

    #   if options[:payload]
    #     rest_params[:payload]      = stringify(options[:payload]).to_json
    #     rest_params[:content_type] = :json
    #     rest_params[:accept]       = :json
    #   end

    #   reply = nil
    #   retryable(@retry_limit, Exception) do
    #     reply = RestClient::Request.execute(rest_params) { |response, request, result, &block|
    #       case response.code
    #       when 200
    #         response
    #       else
    #         raise "Error with Netsuite response: #{response}"
    #       end
    #     }
    #   end

    #   begin
    #     parsed = JSON.parse(reply, :symbolize_names=>true)
    #   rescue Exception => e
    #     raise "Unable to parse reply from Netsuite: #{reply}"
    #   end

    #   if !parsed.first || parsed.flatten.include?("UNEXPECTED_ERROR")
    #     raise "Error processing request: #{parsed.last.to_s}"
    #   else
    #     parsed.last
    #   end
    # end

    # def stringify(data)
    #   if data.class == Array
    #     data.map { |value_item| stringify(value_item) }
    #   elsif data.class == Hash
    #     data.inject({}) do |hash, (key, value)|
    #       hash[key.to_s] = stringify(value)
    #       hash
    #     end
    #   else
    #     data.to_s
    #   end
    # end

    # def create_url(params)
    #   BASE_URL + '?' + params.map { |key, value| "#{key}=#{value}" }.join('&')
    # end

    # def retryable(tries, exception, &block)
    #   begin
    #     return yield
    #   rescue *exception
    #     retry if (tries -= 1) > 0
    #   end

    #   yield
    # end
  end
end
