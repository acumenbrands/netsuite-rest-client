module NetsuiteRESTConnection
  module Config
    module Validators
      module Option
        extend self

        def validate(option)
          unless Config.settings.keys.include?(option.to_sym)
            raise Errors::InvalidConfigOption.new(option)
          end
        end
      end
    end
  end
end
