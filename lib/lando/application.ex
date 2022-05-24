defmodule Lando.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    topologies = [
      local: [
        strategy: Cluster.Strategy.Gossip
      ]
    ]

    children = [
      Lando.Endpoint,
      {Cluster.Supervisor, [topologies, [name: Lando.ClusterSupervisor]]}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Lando.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
