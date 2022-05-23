defmodule LandoTest do
  use ExUnit.Case
  doctest Lando

  test "greets the world" do
    assert Lando.hello() == :world
  end
end
