module NetsuiteRESTClient
  module Config
    module Options
      def defaults
        @defaults ||= {}
      end

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

      def reset
        settings.replace(defaults)
      end

      def settings
        @settings ||= {}
      end
    end
  end
end
