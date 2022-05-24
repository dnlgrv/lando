#!/usr/bin/env node
import "source-map-support";
import * as cdk from "aws-cdk-lib";
import { LandoStack } from "../lib/lando-stack";

const app = new cdk.App();

new LandoStack(app, "LandoStack", {});

app.synth();
