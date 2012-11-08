module NetsuiteRESTClient
  module Client
    module Components
      module Header
        # Internal: Generates the auth string required to consue Netsuite services.
        #
        # Returns the String of authentication information.
        def authentication_string
        end

        # Internal: Populates the cookies section of the request body.
        #
        # Returns the Hash of cookie data.
        def cookies
        end

        # Internal: Constructs the entire header for a request.
        #
        # Returns the Hash of complete header data.
        def build_header
        end
        # extend self

        # auth_string       = "NLAuth nlauth_account=#{account_id}," +
        #                     "nlauth_email=#{URI.escape(login, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]"))}," +
        #                     "nlauth_signature=#{password}," +
        #                     "nlauth_role=#{role_id}"

        # @headers          = { :authorization  => auth_string,
        #                       :content_type   => "application/json" }

        # @cookies          = { "NS_VER" => "2011.2.0" }

        # @timeout          = options[:timeout] || DEFAULT_REQUEST_TIMEOUT

        # @script_id   = options[:rest_script_id] || DEFAULT_SCRIPT_ID
        # @deploy_id   = options[:rest_deploy_id] || DEFAULT_DEPLOY_ID

        # @search_batch_size = options[:search_batch_size] || DEFAULT_SEARCH_BATCH_SIZE

        # @retry_limit = options[:retry_limit] || DEFAULT_RETRY_LIMIT
      end
    end
  end
end
