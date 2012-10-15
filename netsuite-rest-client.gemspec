lib = File.expand_path('../lib/', __FILE__)
$:.unshift lib unless $:.include?(lib)

require 'netsuite-rest-client/version'

Gem::Specification.new do |spec|
  spec.name        = 'netsuite-rest-client'
  spec.version     = ::NetsuiteRESTClient::VERSION
  spec.platform    = Gem::Platform::RUBY
  spec.authors     = [ 'James Christie (JamesChristie)' ]
  spec.email       = 'developers@acumenbrands.com'
  spec.homepage    = 'https://github.com/acumenbrands/netsuite-rest-client'
  spec.summary     = 'RESTful client for using Netsuite services via a deplyed RESTlet'
  spec.description = 'TODO'

  spec.add_development_dependency "rspec"

  spec.add_runtime_dependency "activemodel"
  spec.add_runtime_dependency "rest-client"
  spec.add_runtime_dependency "json"
  spec.add_runtime_dependency "uri"

  spec.files        = Dir.glob("{lib}/**/*") + %w(README.md Rakefile)
  spec.require_path = 'lib'
end
