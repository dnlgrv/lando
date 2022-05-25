import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as discovery from "aws-cdk-lib/aws-servicediscovery";
import { Construct } from "constructs";

import { AppStack } from "./app-stack";

interface LandoStackProps extends cdk.StackProps {
  stage: string;
}

export class LandoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LandoStackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "Vpc", { isDefault: true });

    const logGroup = new logs.LogGroup(this, "LogGroup", {
      retention: logs.RetentionDays.ONE_DAY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const logDriver = new ecs.AwsLogDriver({
      logGroup,
      streamPrefix: "lando-logs",
    });

    const repo = new ecr.Repository(this, "Repo", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      imageTagMutability: ecr.TagMutability.MUTABLE,
    });

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc,
    });

    const namespace = new discovery.PrivateDnsNamespace(this, "Namespace", {
      name: "lando-ns",
      vpc,
    });

    const discoveryService = namespace.createService("DiscoveryService", {
      dnsRecordType: discovery.DnsRecordType.A,
      dnsTtl: cdk.Duration.seconds(10),
      routingPolicy: discovery.RoutingPolicy.MULTIVALUE,
    });

    const { loadBalancer } = new AppStack(this, "App", {
      cluster,
      discoveryService,
      logDriver,
      repo,
      secrets: {
        cookie: ssm.StringParameter.fromSecureStringParameterAttributes(
          this,
          "Cookie",
          { parameterName: `/lando/${props.stage}/cookie` }
        ),
        secret: ssm.StringParameter.fromSecureStringParameterAttributes(
          this,
          "Secret",
          { parameterName: `/lando/${props.stage}/secret` }
        ),
      },
      vpc,
    });

    new cdk.CfnOutput(this, "Output", {
      value: loadBalancer.loadBalancerDnsName,
      description: "Load Balancer URL",
    });
  }
}
