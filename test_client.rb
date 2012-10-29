require './lib/netsuite-rest-client'

def client
  Netsuite::Client.new('971586', 'jchristie@acumenholdings.com', 'f1tmK1wnf', '1017')
end
