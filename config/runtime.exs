import Config

config :lando, Lando.Endpoint, port: System.get_env("PORT")
config :lando, :secret, System.get_env("SECRET", "Not set")

config :lando, :topologies,
  ecs: [
    strategy: Cluster.Strategy.DNSPoll,
    config: [
      polling_interval: 1000,
      query: System.get_env("SERVICE_DISCOVERY_ENDPOINT"),
      node_basename: System.get_env("NODE_NAME_QUERY")
    ]
  ]
