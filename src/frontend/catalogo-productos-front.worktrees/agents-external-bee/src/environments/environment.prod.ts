// Configuración para producción (build con --configuration production).
// Todos estos valores deben completarse con las salidas reales de
// `terraform apply` (ver iac/outputs.tf) antes de desplegar el frontend
// a S3/CloudFront. Nunca deben quedar apuntando a "localhost".
export const environment = {
  production: true,

  // TODO: reemplazar por la URL real del backend Spring Boot (si se despliega),
  // o eliminar este backend si el módulo de productos no se usa en producción.
  backendUrl: 'https://REEMPLAZAR-backend.tudominio.com/api/v1',

  // terraform output api_gateway_invoke_url
  reclamosApiUrl: 'https://REEMPLAZAR.execute-api.us-east-2.amazonaws.com/dev',

  cognito: {
    region: 'us-east-2',
    // terraform output cognito_user_pool_id
    userPoolId: 'REEMPLAZAR_COGNITO_USER_POOL_ID',
    // terraform output cognito_user_pool_client_id
    clientId: 'REEMPLAZAR_COGNITO_USER_POOL_CLIENT_ID',
  },
};
