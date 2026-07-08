# CloudWatch Log Groups para Lambda Functions
resource "aws_cloudwatch_log_group" "lambda_reclamos_logs" {
  name              = "/aws/lambda/${local.project_name}-lambda-reclamos"
  retention_in_days = 14
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "lambda_procesamiento_logs" {
  name              = "/aws/lambda/${local.project_name}-lambda-procesamiento"
  retention_in_days = 14
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "lambda_reportes_logs" {
  name              = "/aws/lambda/${local.project_name}-lambda-reportes"
  retention_in_days = 14
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "lambda_control_plazos_logs" {
  name              = "/aws/lambda/${local.project_name}-lambda-control-plazos"
  retention_in_days = 14
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "lambda_notificaciones_logs" {
  name              = "/aws/lambda/${local.project_name}-lambda-notificaciones"
  retention_in_days = 14
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/aws/apigateway/${local.project_name}"
  retention_in_days = 14
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "rds_logs" {
  name              = "/aws/rds/${local.project_name}-mariadb"
  retention_in_days = 14
  tags              = local.common_tags
}

# Alarm - Lambda Reclamos errores
resource "aws_cloudwatch_metric_alarm" "lambda_reclamos_errors" {
  alarm_name          = "${local.project_name}-lambda-reclamos-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "Lambda Reclamos error rate"
  alarm_actions       = [aws_sns_topic.urgent_notifications.arn]
  dimensions          = { FunctionName = "${local.project_name}-lambda-reclamos" }
  tags                = local.common_tags
}

# Alarm - Lambda Reclamos duracion
resource "aws_cloudwatch_metric_alarm" "lambda_reclamos_duration" {
  alarm_name          = "${local.project_name}-lambda-reclamos-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Average"
  threshold           = "10000"
  alarm_description   = "Lambda Reclamos duration is too high"
  alarm_actions       = [aws_sns_topic.urgent_notifications.arn]
  dimensions          = { FunctionName = "${local.project_name}-lambda-reclamos" }
  tags                = local.common_tags
}

# Alarm - Lambda Procesamiento errores
resource "aws_cloudwatch_metric_alarm" "lambda_procesamiento_errors" {
  alarm_name          = "${local.project_name}-lambda-procesamiento-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "3"
  alarm_description   = "Lambda Procesamiento error rate"
  alarm_actions       = [aws_sns_topic.urgent_notifications.arn]
  dimensions          = { FunctionName = "${local.project_name}-lambda-procesamiento" }
  tags                = local.common_tags
}

# Alarm - RDS conexiones (reemplaza la de DynamoDB throttles)
resource "aws_cloudwatch_metric_alarm" "rds_connections" {
  alarm_name          = "${local.project_name}-rds-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "RDS MariaDB conexiones altas"
  alarm_actions       = [aws_sns_topic.urgent_notifications.arn]
  dimensions          = { DBInstanceIdentifier = aws_db_instance.main.identifier }
  tags                = local.common_tags
}

# Alarm - RDS CPU
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${local.project_name}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "RDS MariaDB CPU alto"
  alarm_actions       = [aws_sns_topic.urgent_notifications.arn]
  dimensions          = { DBInstanceIdentifier = aws_db_instance.main.identifier }
  tags                = local.common_tags
}

# Alarm - API Gateway 4XX
resource "aws_cloudwatch_metric_alarm" "api_gateway_4xx_errors" {
  alarm_name          = "${local.project_name}-api-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "API Gateway 4XX error rate is high"
  alarm_actions       = [aws_sns_topic.urgent_notifications.arn]
  tags                = local.common_tags
}

# Alarm - API Gateway 5XX
resource "aws_cloudwatch_metric_alarm" "api_gateway_5xx_errors" {
  alarm_name          = "${local.project_name}-api-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "API Gateway 5XX error detected"
  alarm_actions       = [aws_sns_topic.urgent_notifications.arn]
  tags                = local.common_tags
}

# Dashboard (sin referencias a DynamoDB)
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${local.project_name}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "${local.project_name}-lambda-reclamos"],
            [".", "Errors", ".", "."],
            [".", "Duration", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Lambda Reclamos Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", aws_db_instance.main.identifier],
            [".", "CPUUtilization", ".", "."],
            [".", "FreeStorageSpace", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "RDS MariaDB Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", "ApiName", "${local.project_name}-api"],
            [".", "Latency", ".", "."],
            [".", "4XXError", ".", "."],
            [".", "5XXError", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "API Gateway Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/SNS", "NumberOfMessagesPublished", "TopicName", aws_sns_topic.reclamos_notifications.name],
            [".", "NumberOfNotificationsFailed", ".", "."],
            [".", "NumberOfNotificationsDelivered", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "SNS Notifications Metrics"
          period  = 300
        }
      }
    ]
  })
}

# EventBridge cron para Lambda Control Plazos
resource "aws_cloudwatch_event_rule" "control_plazos_schedule" {
  name                = "${local.project_name}-control-plazos-schedule"
  description         = "Trigger Lambda Control Plazos daily at 8 AM"
  schedule_expression = "cron(0 8 * * ? *)"
  tags                = local.common_tags
}

resource "aws_cloudwatch_event_target" "lambda_control_plazos_target" {
  rule      = aws_cloudwatch_event_rule.control_plazos_schedule.name
  target_id = "LambdaControlPlazosTarget"
  arn       = aws_lambda_function.lambda_control_plazos.arn
}

resource "aws_lambda_permission" "allow_eventbridge_control_plazos" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_control_plazos.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.control_plazos_schedule.arn
}

# CloudWatch Insights Queries
resource "aws_cloudwatch_query_definition" "lambda_errors" {
  name = "${local.project_name}/lambda-errors"

  log_group_names = [
    aws_cloudwatch_log_group.lambda_reclamos_logs.name,
    aws_cloudwatch_log_group.lambda_procesamiento_logs.name,
    aws_cloudwatch_log_group.lambda_reportes_logs.name,
    aws_cloudwatch_log_group.lambda_control_plazos_logs.name,
    aws_cloudwatch_log_group.lambda_notificaciones_logs.name
  ]

  query_string = "fields @timestamp, @message, @logStream | filter @message like /ERROR/ | sort @timestamp desc | limit 100"
}

resource "aws_cloudwatch_query_definition" "api_gateway_slow_requests" {
  name            = "${local.project_name}/api-slow-requests"
  log_group_names = [aws_cloudwatch_log_group.api_gateway_logs.name]
  query_string    = "fields @timestamp, @message | filter @message like /responseTime/ | filter responseTime > 1000 | sort @timestamp desc | limit 50"
}