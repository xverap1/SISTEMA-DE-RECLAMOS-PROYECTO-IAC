# =============================================================================
# IAM Role para Lambda Reclamos
# =============================================================================
resource "aws_iam_role" "lambda_reclamos_role" {
  name = "${local.project_name}-lambda-reclamos-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "lambda_reclamos_policy" {
  name = "${local.project_name}-lambda-reclamos-policy"
  role = aws_iam_role.lambda_reclamos_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:::*"
      },
      {
        # Permiso para conectarse a RDS dentro de la VPC
        Effect   = "Allow"
        Action   = ["ec2:CreateNetworkInterface", "ec2:DescribeNetworkInterfaces", "ec2:DeleteNetworkInterface"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["sqs:SendMessage"]
        Resource = aws_sqs_queue.procesamiento_queue.arn
      },
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = [aws_sns_topic.reclamos_notifications.arn]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_reclamos_vpc" {
  role       = aws_iam_role.lambda_reclamos_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# =============================================================================
# IAM Role para Lambda Procesamiento
# =============================================================================
resource "aws_iam_role" "lambda_procesamiento_role" {
  name = "${local.project_name}-lambda-procesamiento-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "lambda_procesamiento_policy" {
  name = "${local.project_name}-lambda-procesamiento-policy"
  role = aws_iam_role.lambda_procesamiento_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:::*"
      },
      {
        Effect   = "Allow"
        Action   = ["ec2:CreateNetworkInterface", "ec2:DescribeNetworkInterfaces", "ec2:DeleteNetworkInterface"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource = aws_sqs_queue.procesamiento_queue.arn
      },
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = [aws_sns_topic.reclamos_notifications.arn]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_procesamiento_vpc" {
  role       = aws_iam_role.lambda_procesamiento_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# =============================================================================
# IAM Role para Lambda Reportes
# =============================================================================
resource "aws_iam_role" "lambda_reportes_role" {
  name = "${local.project_name}-lambda-reportes-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "lambda_reportes_policy" {
  name = "${local.project_name}-lambda-reportes-policy"
  role = aws_iam_role.lambda_reportes_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:::*"
      },
      {
        Effect   = "Allow"
        Action   = ["ec2:CreateNetworkInterface", "ec2:DescribeNetworkInterfaces", "ec2:DeleteNetworkInterface"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = [aws_sns_topic.reportes_notifications.arn]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_reportes_vpc" {
  role       = aws_iam_role.lambda_reportes_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# =============================================================================
# IAM Role para Lambda Control Plazos
# =============================================================================
resource "aws_iam_role" "lambda_control_plazos_role" {
  name = "${local.project_name}-lambda-control-plazos-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "lambda_control_plazos_policy" {
  name = "${local.project_name}-lambda-control-plazos-policy"
  role = aws_iam_role.lambda_control_plazos_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:::*"
      },
      {
        Effect   = "Allow"
        Action   = ["ec2:CreateNetworkInterface", "ec2:DescribeNetworkInterfaces", "ec2:DeleteNetworkInterface"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = [aws_sns_topic.control_plazos_alerts.arn, aws_sns_topic.urgent_notifications.arn]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_control_plazos_vpc" {
  role       = aws_iam_role.lambda_control_plazos_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# =============================================================================
# IAM Role para Lambda Notificaciones
# =============================================================================
resource "aws_iam_role" "lambda_notificaciones_role" {
  name = "${local.project_name}-lambda-notificaciones-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "lambda_notificaciones_policy" {
  name = "${local.project_name}-lambda-notificaciones-policy"
  role = aws_iam_role.lambda_notificaciones_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:::*"
      },
      {
        Effect   = "Allow"
        Action   = ["ec2:CreateNetworkInterface", "ec2:DescribeNetworkInterfaces", "ec2:DeleteNetworkInterface"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail", "ses:SendTemplatedEmail"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_notificaciones_vpc" {
  role       = aws_iam_role.lambda_notificaciones_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# =============================================================================
# IAM Policy para API Gateway CloudWatch Logs
# =============================================================================
resource "aws_iam_role_policy" "api_gateway_logs_policy" {
  name = "${local.project_name}-api-gateway-logs-policy"
  role = aws_iam_role.api_gateway_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "logs:CreateLogGroup", "logs:CreateLogStream",
        "logs:DescribeLogGroups", "logs:DescribeLogStreams",
        "logs:PutLogEvents", "logs:GetLogEvents", "logs:FilterLogEvents"
      ]
      Resource = ["arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/apigateway/${local.project_name}*"]
    }]
  })
}

# =============================================================================
# IAM Roles para Cognito Identity Pool
# =============================================================================
resource "aws_iam_role" "authenticated_role" {
  name = "${local.project_name}-cognito-authenticated-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = "cognito-identity.amazonaws.com" }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals             = { "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id }
        "ForAnyValue:StringLike" = { "cognito-identity.amazonaws.com:amr" = "authenticated" }
      }
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "authenticated_policy" {
  name = "${local.project_name}-cognito-authenticated-policy"
  role = aws_iam_role.authenticated_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["execute-api:Invoke"]
      Resource = [
        "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*/*/GET/*",
        "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*/*/POST/*",
        "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*/*/PUT/*"
      ]
    }]
  })
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id
  roles = {
    "authenticated" = aws_iam_role.authenticated_role.arn
  }
}