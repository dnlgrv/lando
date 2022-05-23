defmodule Lando.Router do
  use Plug.Router

  plug(:match)
  plug(:dispatch)

  @template EEx.compile_file(Path.join([File.cwd!(), "lib/lando/templates/index.html.eex"]))

  get "/" do
    {result, _bindings} = Code.eval_quoted(@template)
    send_resp(conn, 200, result)
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
