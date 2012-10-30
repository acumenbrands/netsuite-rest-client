require 'uri'
require 'json'
require 'rest-client'
require 'active_model'

require_relative 'netsuite-rest-client/errors_require'
require_relative 'netsuite-rest-client/config_require'
require_relative 'netsuite-rest-client/records_require'
require_relative 'netsuite-rest-client/client_require'
require_relative 'netsuite-rest-client/version'

if defined?(Rails)
  require_relative 'netsuite-rest-client/railtie'
end

module NetsuiteRESTClient
  extend self
  extend Client

  # Public: Accepts a block setting options on the NetsuiteRESTClient::Config singleton.
  #
  # block - A block that mutates available options on the NetsuiteRESTClient::Config singleton.
  #
  # Yields the NetsuiteRESTClient::Config singleton.
  #
  # Examples
  #
  #  NetsuiteRESTClient.configure do |config|
  #    config.request_timeout = 30000
  #  end
  #
  # Returns the NetsuiteRESTClient::Config singleton.
  def configure
    block_given? ? yield(Config) : Config
  end
end
