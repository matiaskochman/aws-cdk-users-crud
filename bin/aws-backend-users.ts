#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AwsBackendUsersStack } from "../lib/aws-backend-users-stack";

const app = new cdk.App();
new AwsBackendUsersStack(app, "AwsBackendUsersStack");
