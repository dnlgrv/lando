import Config

config :lando, Lando.Endpoint, port: System.get_env("PORT")
config :lando, :secret, System.get_env("SECRET", "Not set")
