require 'uri'
require 'json'
require 'rest-client'

require 'netsuite-rest-client/client'
require 'netsuite-rest-client/config'
require 'netsuite-rest-client/operations'
require 'netsuite-rest-client/records'
require 'netsuite-rest-client/version'

if defined?(Rails)
  require 'netsuite-rest-client/railtie'
end

I18n.load_path << File.join(File.dirname(__FILE__), "config", "locales", "en.yml")

module NetsuiteRESTClient
  extend Loggable
  extend self

  def configure
    block_given? ? yield(Config) : Config
  end

  delegate(*(Config.public_instance_methods(false) +
    ActiveModel::Observing::ClassMethods.public_instance_methods(false) <<
    { to: Config }))
end
