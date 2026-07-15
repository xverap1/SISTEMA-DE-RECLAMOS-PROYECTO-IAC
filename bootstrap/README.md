# Bootstrap del backend remoto (correr UNA sola vez, a mano, desde tu laptop)

```bash
cd bootstrap
terraform init
terraform apply -var="state_bucket_name=sistema-reclamos-tfstate-TUALIAS123"
```

(usa un nombre de bucket único en el mundo, ej: agrega tu usuario o un random)

Luego, en GitHub → Settings → Secrets and variables → Actions, crea estos secrets:

- `TF_STATE_BUCKET` = el nombre que usaste arriba
- `TF_LOCK_TABLE` = `sistema-reclamos-tf-locks` (o el que hayas puesto)
- `AWS_REGION` = la región que uses (ej: `us-east-1`)

Con eso, `cd.yml` y `cd-temporal.yml` ya quedan apuntando al backend remoto y el estado
se comparte entre todos los jobs/runners (incluyendo apply → destroy de cd-temporal.yml).
