import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

type Secret = ssm.IStringParameter;

interface AppSecrets {
  secret: Secret;
}

interface AppStackProps extends cdk.NestedStackProps {
  cluster: ecs.Cluster;
  logDriver: ecs.LogDriver;
  repo: ecr.Repository;
  secrets: AppSecrets;
  vpc: ec2.IVpc;
}

interface ServiceProps {
  cluster: ecs.Cluster;
  logDriver: ecs.LogDriver;
  repo: ecr.Repository;
  secret: Secret;
}

export class AppStack extends cdk.NestedStack {
  loadBalancer: elb.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    this.loadBalancer = new elb.ApplicationLoadBalancer(this, "LoadBalancer", {
      vpc: props.vpc,
      internetFacing: true,
    });

    const listener = this.loadBalancer.addListener("Listener", { port: 80 });
    const service = this._createService("Service", {
      cluster: props.cluster,
      logDriver: props.logDriver,
      repo: props.repo,
      secret: props.secrets.secret,
    });

    listener.addTargets("Target", {
      port: 80,
      targets: [service],
    });
  }

  _createService(id: string, props: ServiceProps): ecs.FargateService {
    const taskDef = new ecs.FargateTaskDefinition(this, "TaskDef", {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    props.secret.grantRead(taskDef.taskRole);

    const container = taskDef.addContainer("app", {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, "..", "..")),
      logging: props.logDriver,
      secrets: {
        SECRET: ecs.Secret.fromSsmParameter(props.secret),
      },
    });
    container.addPortMappings({ containerPort: 4000 });

    return new ecs.FargateService(this, id, {
      cluster: props.cluster,
      assignPublicIp: true,
      taskDefinition: taskDef,
      enableExecuteCommand: true,
    });
  }
}
