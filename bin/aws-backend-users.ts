#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AwsBackendUsersStack } from "../lib/aws-backend-users-stack";

import "dotenv/config";

const app = new cdk.App();
new AwsBackendUsersStack(app, "AwsBackendUsersStack");
