module NetsuiteRESTConnection
  module Config
    module Environment
      extend self

      def env_name
        return Rails.env if defined?(Rails)
        return Sinatra::Base.environment.to_s if defined?(Sinatra)
        ENV["RACK_ENV"] || ENV["NSRC_ENV"] || raise(Errors::NoEnvironment.new)
      end

      def load_yaml(path)
        YAML.load(ERB.new(File.new(path).read).result)
      end
    end
  end
end
