# =============================================================================
# OUTPUTS
# Valores que se necesitan después de "terraform apply" para:
#  - Configurar el frontend Angular (environment.ts / environment.prod.ts)
#  - Cargar el secret CLOUDFRONT_DISTRIBUTION_ID en GitHub Actions
#  - Verificar rápidamente qué se creó, sin ir a buscarlo a mano en la consola
# =============================================================================

output "api_gateway_invoke_url" {
  description = "URL base del API Gateway (usar en environment.ts -> reclamosApiUrl)"
  value       = aws_api_gateway_stage.main.invoke_url
}

output "cognito_user_pool_id" {
  description = "ID del User Pool de Cognito (usar en environment.ts -> cognito.userPoolId)"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  description = "ID del Client del User Pool (usar en environment.ts -> cognito.userPoolClientId)"
  value       = aws_cognito_user_pool_client.main.id
}

output "cognito_identity_pool_id" {
  description = "ID del Identity Pool de Cognito"
  value       = aws_cognito_identity_pool.main.id
}

output "cognito_user_pool_domain" {
  description = "Dominio del User Pool de Cognito (para el flujo OAuth/Hosted UI)"
  value       = aws_cognito_user_pool_domain.main.domain
}

output "cloudfront_distribution_id" {
  description = "ID de la distribución de CloudFront (usar en el secret CLOUDFRONT_DISTRIBUTION_ID de GitHub)"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "Dominio público de CloudFront (la URL final donde va a vivir el frontend)"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "frontend_bucket_name" {
  description = "Nombre del bucket S3 del frontend (usar en el secret FRONTEND_BUCKET_NAME de GitHub)"
  value       = aws_s3_bucket.frontend.bucket
}

# Nota: rds_endpoint, rds_port y rds_database_name YA existen como outputs
# en rds.tf (líneas 99-113 aprox), no hace falta repetirlos aquí.
