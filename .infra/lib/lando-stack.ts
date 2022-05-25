import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

import { AppStack } from "./app-stack";

export class LandoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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

    const { loadBalancer } = new AppStack(this, "App", {
      cluster,
      logDriver,
      repo,
      vpc,
    });

    new cdk.CfnOutput(this, "Output", {
      value: loadBalancer.loadBalancerDnsName,
      description: "Load Balancer URL",
    });
  }
}
