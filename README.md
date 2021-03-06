# Lando

An example of an Elixir application that can be deployed to AWS using
[CDK](https://aws.amazon.com/cdk/).

While it's a simple enough Elixir application, the bulk of the code is related
to setting up the infrastructure in running it. The infrastructure should be
applicable to most web apps, and involves:

- Building a Docker image containing the application
- Pushing the Docker image to a repository on AWS
- Creating the cluster/service/tasks to run the container
- Creating a load balancer that routes requests to the container
- Setting a secret from AWS Systems Manager on the running container as an environment variable

If you decide to run multiple tasks for the app service (by setting desiredCount
to >1 for the service) then through a configured
[libcluster](https://github.com/bitwalker/libcluster) topology, each of the
tasks will connect to each other's node. Thanks to
[https://github.com/felipeloha/elixir-ecs](https://github.com/felipeloha/elixir-ecs)
for showing the way to do this.

It's not clear whether using nested stacks is preferrable over separate stacks
which can be deployed independently, as with nested stacks you have to deploy
your entire infrastructure with each change. Definitely something else to look
into.

## Running locally

You can run the application locally either on your host (with Elixir and Erlang
installed) or via Docker:

```bash
mix run --no-halt
docker build -t lando . && docker run -p 4000:4000 lando
```

You can also spin up multiple instances using docker-compose and see the local
libcluster in action:

```bash
docker-compose up
```

## Deploy to AWS

Deploying should be easy enough provided you have access to an AWS account and
AWS CLI installed.

```bash
cd .infra

 # install dependencies
yarn

# to demonstrate setting secrets
aws ssm put-parameter --name "/lando/dev/secret" --type "SecureString" --value "My secret"

# release cookie for connecting multiple task nodes
aws ssm put-parameter --name "/lando/dev/cookie" --type "SecureString" --value "cookie-monster"

# deploy CloudFormation stack
yarn cdk deploy
```
