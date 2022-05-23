defmodule Lando.Endpoint do
  require Logger

  def child_spec(opts) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [opts]},
      type: :supervisor
    }
  end

  def start_link(_opts) do
    config = Application.get_env(:lando, __MODULE__)
    port = String.to_integer(config[:port] || "4000")

    children = [
      {Plug.Cowboy, ref: Lando.Endpoint, scheme: :http, plug: Lando.Router, port: port}
    ]

    case Supervisor.start_link(children, strategy: :one_for_one) do
      {:ok, _} = ok ->
        Logger.info("Running Lando.Endpoint at #{bound_address(Lando.Endpoint)}")
        ok

      {:error, _} = error ->
        error
    end
  end

  defp bound_address(ref) do
    {addr, port} = :ranch.get_addr(ref)
    "#{:inet.ntoa(addr)}:#{port}"
  end
end
