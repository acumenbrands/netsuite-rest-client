require 'rest-client'
require 'json'

module Netsuite
  class Client
    BASE_URL = "https://rest.netsuite.com/app/site/hosting/restlet.nl"

    attr_accessor :headers

    def initialize(account_id, login, password, role_id)
      super()
      auth_string = "NLAuth nlauth_account=#{account_id}," +
                    "nlauth_email=#{login}," +
                    "nlauth_signature=#{password}," +
                    "nlauth_role=#{role_id}"
      @headers = { :authorization => auth_string,
                   :content_type   => "application/json",
                   #:accept         => "*/*"
                }
      #@cookies = "NS_VER=2011.2.0; JSESSIONID=fWXFT7PBHm8HvxR59DGbTTkk7CBkQlyb6fHTypQY41ZYzJyCDygQQvhXTLKpLvwPpkZk2TNvh0gy9pTLqtgxqW4tw1pGT7G1NGhckQZ01YqQTVS1GvZ32JycJczrGZQF!-93580996"
      @cookies = { "NS_VER" => "2011.2.0",
                   #"JSESSIONID" => "tWp7T7JccNgQBwFwk0ymdQVpQK9nhtB1BHRr1HPGDHhn2TvnTJykpLkcQ44fyg7bJmjQxL2LzqMyX1PPS25n5z10GFlXTPKyh4FqGhTG7XFj4S2TQxsHVjLvJPsBQvhJ!-93580996"
                 }
    end

    def get_saved_search(record_type, search_id)
      url = BASE_URL  + "?script=10&deploy=1&record_type=#{record_type}&search_id=#{search_id}"
      params = {
                 "script" => 10,
                 "deploy" => 1,
                 "record_type" => record_type,
                 "search_id" => search_id,
               }
      $stderr.puts "Executing request via URL #{url} and headers #{@headers}"
      results_json = RestClient::Request.execute :method => :get, :url => url, :headers => @headers, :cookies => @cookies
      JSON.parse(results_json)
    end
  end
end
