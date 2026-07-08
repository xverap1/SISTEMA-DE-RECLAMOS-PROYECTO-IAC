# =============================================================================
# Lambda Functions - Sistema de Reclamos
# BD: RDS MariaDB (conexion via variables de entorno)
# =============================================================================

# Lambda Function: Reclamos
resource "aws_lambda_function" "lambda_reclamos" {
  filename      = "lambda_reclamos.zip"
  function_name = "${local.project_name}-reclamos"
  role          = aws_iam_role.lambda_reclamos_role.arn
  handler       = "index.handler"
  runtime       = "python3.9"
  timeout       = 30

  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST     = aws_db_instance.main.address
      DB_PORT     = tostring(aws_db_instance.main.port)
      DB_NAME     = aws_db_instance.main.db_name
      DB_USER     = var.db_username
      SQS_QUEUE_URL            = aws_sqs_queue.procesamiento_queue.url
      SNS_TOPIC_NOTIFICATIONS  = aws_sns_topic.reclamos_notifications.arn
    }
  }

  tags       = local.common_tags
  depends_on = [aws_iam_role_policy.lambda_reclamos_policy]
}

# Lambda Function: Procesamiento
resource "aws_lambda_function" "lambda_procesamiento" {
  filename      = "lambda_procesamiento.zip"
  function_name = "${local.project_name}-procesamiento"
  role          = aws_iam_role.lambda_procesamiento_role.arn
  handler       = "index.handler"
  runtime       = "python3.9"
  timeout       = 60

  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST  = aws_db_instance.main.address
      DB_PORT  = tostring(aws_db_instance.main.port)
      DB_NAME  = aws_db_instance.main.db_name
      DB_USER  = var.db_username
      SNS_TOPIC_NOTIFICATIONS = aws_sns_topic.reclamos_notifications.arn
    }
  }

  tags       = local.common_tags
  depends_on = [aws_iam_role_policy.lambda_procesamiento_policy]
}

# Lambda Function: Reportes
resource "aws_lambda_function" "lambda_reportes" {
  filename      = "lambda_reportes.zip"
  function_name = "${local.project_name}-reportes"
  role          = aws_iam_role.lambda_reportes_role.arn
  handler       = "index.handler"
  runtime       = "python3.9"
  timeout       = 60

  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST            = aws_db_instance.main.address
      DB_PORT            = tostring(aws_db_instance.main.port)
      DB_NAME            = aws_db_instance.main.db_name
      DB_USER            = var.db_username
      SNS_TOPIC_REPORTES = aws_sns_topic.reportes_notifications.arn
    }
  }

  tags       = local.common_tags
  depends_on = [aws_iam_role_policy.lambda_reportes_policy]
}

# Lambda Function: Control de Plazos
resource "aws_lambda_function" "lambda_control_plazos" {
  filename      = "lambda_control_plazos.zip"
  function_name = "${local.project_name}-control-plazos"
  role          = aws_iam_role.lambda_control_plazos_role.arn
  handler       = "index.handler"
  runtime       = "python3.9"
  timeout       = 300

  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST          = aws_db_instance.main.address
      DB_PORT          = tostring(aws_db_instance.main.port)
      DB_NAME          = aws_db_instance.main.db_name
      DB_USER          = var.db_username
      SNS_TOPIC_ALERTS = aws_sns_topic.control_plazos_alerts.arn
      SNS_TOPIC_URGENT = aws_sns_topic.urgent_notifications.arn
    }
  }

  tags       = local.common_tags
  depends_on = [aws_iam_role_policy.lambda_control_plazos_policy]
}

# Lambda Function: Notificaciones
resource "aws_lambda_function" "lambda_notificaciones" {
  filename      = "lambda_notificaciones.zip"
  function_name = "${local.project_name}-notificaciones"
  role          = aws_iam_role.lambda_notificaciones_role.arn
  handler       = "index.handler"
  runtime       = "python3.9"
  timeout       = 30

  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST        = aws_db_instance.main.address
      DB_PORT        = tostring(aws_db_instance.main.port)
      DB_NAME        = aws_db_instance.main.db_name
      DB_USER        = var.db_username
      SES_CONFIG_SET = aws_ses_configuration_set.main.name
      FROM_EMAIL     = var.notification_email
    }
  }

  tags       = local.common_tags
  depends_on = [aws_iam_role_policy.lambda_notificaciones_policy]
}

# =============================================================================
# SNS Subscriptions para Lambda Notificaciones
# =============================================================================
resource "aws_sns_topic_subscription" "lambda_notificaciones_reclamos" {
  topic_arn = aws_sns_topic.reclamos_notifications.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.lambda_notificaciones.arn
}

resource "aws_sns_topic_subscription" "lambda_notificaciones_plazos" {
  topic_arn = aws_sns_topic.control_plazos_alerts.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.lambda_notificaciones.arn
}

resource "aws_sns_topic_subscription" "lambda_notificaciones_reportes" {
  topic_arn = aws_sns_topic.reportes_notifications.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.lambda_notificaciones.arn
}

# Permisos SNS → Lambda
resource "aws_lambda_permission" "sns_invoke_notifications_reclamos" {
  statement_id  = "AllowExecutionFromSNSReclamos"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_notificaciones.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.reclamos_notifications.arn
}

resource "aws_lambda_permission" "sns_invoke_notifications_plazos" {
  statement_id  = "AllowExecutionFromSNSPlazos"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_notificaciones.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.control_plazos_alerts.arn
}

resource "aws_lambda_permission" "sns_invoke_notifications_reportes" {
  statement_id  = "AllowExecutionFromSNSReportes"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_notificaciones.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.reportes_notifications.arn
}

# Permisos API Gateway → Lambda
resource "aws_lambda_permission" "api_gateway_invoke_reclamos" {
  statement_id  = "AllowExecutionFromAPIGatewayReclamos"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_reclamos.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gateway_invoke_reportes" {
  statement_id  = "AllowExecutionFromAPIGatewayReportes"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_reportes.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# SQS trigger para Lambda Procesamiento
resource "aws_lambda_event_source_mapping" "procesamiento_trigger" {
  event_source_arn = aws_sqs_queue.procesamiento_queue.arn
  function_name    = aws_lambda_function.lambda_procesamiento.arn
  batch_size       = 5
  enabled          = true
}

# =============================================================================
# Archivos ZIP placeholder para las Lambdas
# =============================================================================
data "archive_file" "lambda_reclamos_zip" {
  type        = "zip"
  output_path = "lambda_reclamos.zip"
  source {
    content  = "def handler(event, context): return {'statusCode': 200, 'body': 'Lambda Reclamos'}"
    filename = "index.py"
  }
}

data "archive_file" "lambda_procesamiento_zip" {
  type        = "zip"
  output_path = "lambda_procesamiento.zip"
  source {
    content  = "def handler(event, context): return {'statusCode': 200, 'body': 'Lambda Procesamiento'}"
    filename = "index.py"
  }
}

data "archive_file" "lambda_reportes_zip" {
  type        = "zip"
  output_path = "lambda_reportes.zip"
  source {
    content  = "def handler(event, context): return {'statusCode': 200, 'body': 'Lambda Reportes'}"
    filename = "index.py"
  }
}

data "archive_file" "lambda_control_plazos_zip" {
  type        = "zip"
  output_path = "lambda_control_plazos.zip"
  source {
    content  = "def handler(event, context): return {'statusCode': 200, 'body': 'Lambda Control Plazos'}"
    filename = "index.py"
  }
}

data "archive_file" "lambda_notificaciones_zip" {
  type        = "zip"
  output_path = "lambda_notificaciones.zip"
  source {
    content  = "def handler(event, context): return {'statusCode': 200, 'body': 'Lambda Notificaciones'}"
    filename = "index.py"
  }
}