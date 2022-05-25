import Config

config :lando, :topologies,
  local: [
    strategy: Cluster.Strategy.Gossip
  ]
