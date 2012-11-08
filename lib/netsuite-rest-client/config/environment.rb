module NetsuiteRESTConnection
  module Config
    module Environment
      extend self

      # Internal: Detects the current environment from several different sources.
      #
      # Returns the current environment or raises if the environment is not set.
      def env_name
        return Rails.env if defined?(Rails)
        return Sinatra::Base.environment.to_s if defined?(Sinatra)
        ENV["RACK_ENV"] || ENV["NSRC_ENV"] || raise(Errors::NoEnvironment.new)
      end

      # Internal: Load a yaml file into a Hash
      #
      # Returns the Hash of the data contained by the specified yaml file.
      def load_yaml(path)
        YAML.load(ERB.new(File.new(path).read).result)
      end
    end
  end
end
