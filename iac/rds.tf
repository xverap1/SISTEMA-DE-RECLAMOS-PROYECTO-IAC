# =============================================================================
# RDS - MariaDB para el backend Java (gestor-reclamos-back)
# Reemplaza la BD local MariaDB que el proyecto usaba antes
# El backend NO cambia — solo cambia la URL de conexión
# =============================================================================

# Subnet Group — le dice a RDS en qué subnets privadas vivir
# Usa las mismas subnets privadas que ya creamos en vpc.tf
resource "aws_db_subnet_group" "main" {
  name        = "${local.project_name}-db-subnet-group"
  description = "Subnet group para RDS MariaDB del sistema de reclamos"
  subnet_ids  = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-db-subnet-group"
  })
}

# Security Group para RDS
# Solo acepta conexiones desde las Lambdas y el backend Java (dentro de la VPC)
resource "aws_security_group" "rds" {
  name        = "${local.project_name}-sg-rds"
  description = "Security group para RDS MariaDB"
  vpc_id      = aws_vpc.main.id

  # Solo permite entrada en puerto 3306 (MariaDB) desde dentro de la VPC
  ingress {
    description = "MariaDB desde dentro de la VPC"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  # Sin salida directa — RDS no inicia conexiones
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-sg-rds"
  })
}

# Instancia RDS MariaDB
resource "aws_db_instance" "main" {
  identifier = "${local.project_name}-mariadb"

  # Motor — mismo que tenían localmente
  engine         = "mariadb"
  engine_version = "10.11"         # versión LTS de MariaDB en RDS
  instance_class = "db.t3.micro"   # la más barata, suficiente para dev/curso

  # Almacenamiento
  allocated_storage     = 20       # GB mínimo
  max_allocated_storage = 100      # autoescala hasta 100 GB si hace falta
  storage_type          = "gp2"
  storage_encrypted     = true

  # Base de datos inicial — la misma que tenían: gestor-productos
  db_name  = "gestorproductos"     # RDS no permite guiones en el nombre
  username = var.db_username
  password = var.db_password
  port     = 3306

  # Red — dentro de la VPC, en subnets privadas
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false   # NO exponer a internet

  # Backups automáticos
  backup_retention_period = 7      # guarda backups 7 días
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Actualizaciones automáticas de parches menores
  auto_minor_version_upgrade = true

  # En dev no necesitamos Multi-AZ (ahorra costos)
  multi_az = false

  # Protección contra borrado accidental
  deletion_protection = false      # en producción cambiar a true
  skip_final_snapshot = true       # en producción cambiar a false

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-mariadb"
  })
}

# =============================================================================
# OUTPUT — muestra el endpoint al terminar el terraform apply
# Este endpoint es lo que va en el application.properties del backend Java
# =============================================================================

output "rds_endpoint" {
  description = "Endpoint de conexión para el backend Java (application.properties)"
  value       = aws_db_instance.main.endpoint
}

output "rds_port" {
  description = "Puerto de MariaDB"
  value       = aws_db_instance.main.port
}

output "rds_database_name" {
  description = "Nombre de la base de datos"
  value       = aws_db_instance.main.db_name
}