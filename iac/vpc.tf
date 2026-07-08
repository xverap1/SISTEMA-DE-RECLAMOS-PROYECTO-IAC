resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-vpc"
  })
}

# =============================================================================
# SUBNETS PRIVADAS
# Las Lambdas, SQS, SNS y DynamoDB viven en subnets privadas
# Se crean en 2 zonas de disponibilidad para alta disponibilidad
# =============================================================================

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-subnet-private-a"
    Type = "private"
  })
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}b"

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-subnet-private-b"
    Type = "private"
  })
}

# =============================================================================
# INTERNET GATEWAY + NAT GATEWAY
# Las Lambdas dentro de la VPC necesitan salida a internet
# para comunicarse con SES, SNS, SQS y otros servicios AWS
# =============================================================================

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-igw"
  })
}

# IP estática para el NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-nat-eip"
  })

  depends_on = [aws_internet_gateway.main]
}

# Subnet pública donde vive el NAT Gateway
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.10.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-subnet-public-a"
    Type = "public"
  })
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-nat-gw"
  })

  depends_on = [aws_internet_gateway.main]
}

# =============================================================================
# TABLAS DE RUTEO
# Subnet pública → Internet Gateway
# Subnets privadas → NAT Gateway (salida a internet sin entrada directa)
# =============================================================================

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-rt-public"
  })
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-rt-private"
  })
}

resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_b" {
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private.id
}

# =============================================================================
# SECURITY GROUPS
# Cada grupo controla el tráfico de entrada/salida para cada componente
# =============================================================================

# Security Group para las Lambdas
# Solo permiten salida (hacia DynamoDB, SQS, SNS, SES)
resource "aws_security_group" "lambda" {
  name        = "${local.project_name}-sg-lambda"
  description = "Security group para las funciones Lambda del sistema de reclamos"
  vpc_id      = aws_vpc.main.id

  # Sin reglas de entrada (las Lambdas son invocadas por API Gateway / SQS / SNS,
  # no reciben conexiones directas dentro de la VPC)
  ingress {
    description = "Trafico interno desde otras Lambdas dentro de la VPC"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  # Salida libre hacia AWS (DynamoDB, SQS, SNS, SES, CloudWatch)
  egress {
    description = "Salida a internet y servicios AWS via NAT Gateway"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-sg-lambda"
  })
}

# =============================================================================
# VPC ENDPOINTS
# Permiten que las Lambdas se comuniquen con DynamoDB y S3
# sin salir a internet, de forma más rápida y segura
# =============================================================================

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.aws_region}.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id]

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-endpoint-dynamodb"
  })
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id]

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-endpoint-s3"
  })
}
