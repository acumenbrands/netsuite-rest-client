module NetsuiteRESTClient
  module Records
    class InventoryItem
      include Records::Common::Core
      include Records::Common::Fields
      include Records::Common::Associations
      include Records::Common::Sublists

      def populate_attributes(attributes={})
      end
    end
  end
end
