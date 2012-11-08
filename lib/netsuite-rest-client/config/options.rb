module NetsuiteRESTClient
  module Config
    module Options

      # Internal: Get method for the configuration defaults.
      #
      # Returns the Hash of defaults or an empty Hash.
      def defaults
        @defaults ||= {}
      end

      # Internal: Defines accessor and mutator methods for an option.
      #
      # Returns nil.
      def option(name, options = {})
        defaults[name] = settings[name] = options[:default]

        class_eval <<-RUBY
          def #{name}
            settings[#{name.inspect}]
          end

          def #{name}=(value)
            settings[#{name.inspect}] = value
          end

          def #{name}?
            #{name}
          end
        RUBY
      end

      # Internal: Resets all configurations settings to the defaults.
      #
      # Returns the Hash of defaults.
      def reset
        settings.replace(defaults)
      end

      # Internal: Accessor method for the Hash of current settings.
      #
      # Returns the Hash of current configuration settings.
      def settings
        @settings ||= {}
      end
    end
  end
end
