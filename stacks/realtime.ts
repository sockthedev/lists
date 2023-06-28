import * as iam from "aws-cdk-lib/aws-iam"
import * as iot from "aws-cdk-lib/aws-iot"
import * as custom_resources from "aws-cdk-lib/custom-resources"
import type { StackContext } from "sst/constructs"
import { use } from "sst/constructs"
import { Function } from "sst/constructs"

import { Auth } from "./auth.ts"
import { Secrets } from "./secrets.ts"

export function Realtime(ctx: StackContext) {
  const auth = use(Auth)
  const secrets = use(Secrets)
  const authorizerFn = new Function(ctx.stack, "authorizer-fn", {
    handler: "packages/functions/src/auth-iot.handler",
    bind: [auth, ...Object.values(secrets.database)],
    permissions: ["iot"],
    environment: {
      ACCOUNT: ctx.app.account,
    },
  })

  const authorizer = new iot.CfnAuthorizer(ctx.stack, "authorizer", {
    status: "ACTIVE",
    authorizerName: ctx.app.logicalPrefixedName("authorizer"),
    authorizerFunctionArn: authorizerFn.functionArn,
    signingDisabled: true,
  })

  authorizerFn.addPermission("IOTPermission", {
    principal: new iam.ServicePrincipal("iot.amazonaws.com"),
    sourceArn: authorizer.attrArn,
    action: "lambda:InvokeFunction",
  })

  const role = new iam.Role(ctx.stack, "LambdaRole", {
    assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
  })
  role.addManagedPolicy(
    iam.ManagedPolicy.fromAwsManagedPolicyName(
      "service-role/AWSLambdaBasicExecutionRole",
    ),
  )
  role.addToPolicy(
    new iam.PolicyStatement({
      resources: ["*"],
      actions: ["iot:DescribeEndpoint"],
    }),
  )

  const awsSdkCall: custom_resources.AwsSdkCall = {
    service: "Iot",
    action: "describeEndpoint",
    parameters: {
      endpointType: "iot:Data-ATS",
    },
    region: ctx.stack.region,
    physicalResourceId: custom_resources.PhysicalResourceId.of(
      "IoTEndpointDescription",
    ),
  }

  const resource = new custom_resources.AwsCustomResource(
    ctx.stack,
    "Resource",
    {
      onCreate: awsSdkCall,
      onUpdate: awsSdkCall,
      policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
        resources: custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
      role,
    },
  )

  return {
    endpointAddress: resource.getResponseField("endpointAddress"),
  }
}
