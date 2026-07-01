variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "notification_email" {
  description = "Email for notifications"
  type        = string
  default     = "admin@example.com"
}

# =============================================================================
# Variables para RDS MariaDB
# NUNCA escribir los valores aquí — pasarlos por variable de entorno o tfvars
# =============================================================================

variable "db_username" {
  description = "Usuario administrador de la base de datos MariaDB"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "db_password" {
  description = "Contraseña del usuario administrador de MariaDB"
  type        = string
  sensitive   = true   # Terraform no mostrará este valor en los logs
}