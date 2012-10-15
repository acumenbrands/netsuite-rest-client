module NetsuiteRESTClient
  module Records
    module Common
      module Core
        def initialize(attributes={})
          @internal_id = attributes.delete(:internalid) || attributes.delete(:@internalid)
          @external_id = attributes.delete(:externalid) || attributes.delete(:@externalid)
          populate_fields(attributes)
        end

        def populate_fields
          attribute_list = attributes.select do |attribute, value|
            self.class.fields.include?(attribute)
          end

          attribute_list.each do |attribute, value|
            send("#{attribute}=", value)
          end

          self.klass = attributes[:class] if attributes[:class]
        end

        def attributes
          @attributes ||= {}
        end

        def attributes=(attributes)
          @attributes = attributes
        end
      end
    end
  end
end
