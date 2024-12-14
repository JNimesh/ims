#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {BackendStack} from "../lib/back-end-stack";

const app = new cdk.App();
new BackendStack(app, 'BackendStack', {
    env: {
        region: 'ap-south-1', // Replace with your desired AWS region
    },
});
