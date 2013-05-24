# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "netsuite-rest-client"
  s.version = "1.0.0"

  s.authors = ["Jim Kane"]
  s.date = "2012-01-25"
  s.description = "RESTlet-based client for Netsuite"
  s.email = "jkane@acumenholdings.com"
  s.extra_rdoc_files = ["LICENSE.txt", "README.rdoc"]
  s.files = [".document", ".rspec", "Gemfile", "Gemfile.lock", "LICENSE.txt", "README.rdoc", "Rakefile", "VERSION", "lib/netsuite-rest-client.rb", "lib/restlets/rest.js", "netsuite-rest-client.gemspec", "spec/netsuite-rest-client_spec.rb", "spec/spec_helper.rb"]
  s.homepage = "http://github.com/jkaneacumen/netsuite-rest-client"
  s.licenses = ["MIT"]
  s.require_paths = ["lib"]
  s.rubygems_version = "1.8.23"
  s.summary = "RESTlet-based client for Netsuite"
  s.specification_version = 3

  s.add_runtime_dependency(%q<rest-client>, [">= 0"])
  s.add_runtime_dependency(%q<json>, [">= 0"])
  s.add_development_dependency(%q<rspec>, [">= 0"])
  s.add_development_dependency(%q<bundler>, [">= 0"])
  s.add_development_dependency(%q<rake>, [">= 0"])
end
