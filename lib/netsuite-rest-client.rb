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

  def configure
    block_given? ? yield(Config) : Config
  end
end
