ARG BUILDER_IMAGE="hexpm/elixir:1.13.4-erlang-24.3.1-alpine-3.14.3"
ARG RUNNER_IMAGE="alpine:3.14.3"

FROM ${BUILDER_IMAGE} as builder

ENV MIX_ENV="prod"
WORKDIR /app

RUN mix local.hex --force && mix local.rebar --force

COPY mix.exs mix.lock ./
RUN mix deps.get --only $MIX_ENV
RUN mkdir config

COPY config/config.exs config/${MIX_ENV}.exs config/
RUN mix deps.compile

COPY lib lib
RUN mix compile

COPY config/runtime.exs config/

COPY rel rel
RUN mix release

FROM ${RUNNER_IMAGE} as runner

RUN apk add --no-cache \
  curl \
  jq \
  libstdc++ \
  ncurses \
  openssl

WORKDIR /app
RUN chown nobody /app

COPY --from=builder --chown=nobody:root /app/_build/prod/rel/lando ./

USER nobody

ENTRYPOINT ["/app/bin/lando"]
CMD ["start"]
