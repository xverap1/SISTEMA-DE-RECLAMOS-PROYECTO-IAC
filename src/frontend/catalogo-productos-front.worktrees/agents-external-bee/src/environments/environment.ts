// Configuración para desarrollo local (ng serve).
// El backend Spring Boot corre en localhost:8080 y las Lambdas se pueden
// invocar localmente con AWS SAM/serverless-offline, o apuntar directo al
// API Gateway ya desplegado en AWS (reemplazando reclamosApiUrl abajo).
export const environment = {
  production: false,

  // Backend Spring Boot: productos, auth (admin/personal), auditoría, reportes
  backendUrl: 'http://localhost:8080/api/v1',

  // API Gateway de la arquitectura serverless (Lambdas): reclamos ciudadanos.
  // Reemplazar por la salida `terraform output api_gateway_invoke_url` si
  // quieres probar contra el ambiente real de AWS en vez de un mock local.
  reclamosApiUrl: 'http://localhost:3001',

  // Cognito User Pool (autenticación de ciudadanos para el módulo de reclamos).
  // Salen de `terraform output cognito_user_pool_id` / `cognito_user_pool_client_id`.
  cognito: {
    region: 'us-east-2',
    userPoolId: 'us-east-2_XXXXXXXXX',
    clientId: 'REEMPLAZAR_CON_COGNITO_USER_POOL_CLIENT_ID',
  },
};
