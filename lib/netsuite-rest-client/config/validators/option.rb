module NetsuiteRESTConnection
  module Config
    module Validators
      module Option
        extend self

        # Internal: Determines if a given option is a valid setting.
        #
        # Returns true or raises if an option is invalid.
        def validate(option)
          unless Config.settings.keys.include?(option.to_sym)
            raise Errors::InvalidConfigOption.new(option)
          end
        end
      end
    end
  end
end
