#!/bin/bash

cd terraform
terraform init
terraform apply -var="project_id=$project_id"
cd ..

chmod +x init-db.sh
./init-db.sh
chmod +x push-docker-images.sh
./push-docker-images.sh

export db_private_ip=$(gcloud sql instances describe pdb-team-digi-sigla-001 | grep '\-\sipAddress:' | grep -E -o '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)')

envsubst <  sigla-thorntail.yaml > sigla-thorntail-sub.yaml

gcloud run services replace sigla-thorntail-sub.yaml

gcloud run services add-iam-policy-binding sigla-thorntail --member="allUsers"  --role="roles/run.invoker" --region=europe-west4

export sigla_thorntail_url=$(gcloud run services describe sigla-thorntail --platform managed --region europe-west4 --format 'value(status.url)' --project $project_id)

envsubst <  sigla-ng.yaml > sigla-ng-sub.yaml

gcloud run services replace sigla-ng-sub.yaml

gcloud run services add-iam-policy-binding sigla-ng --member="allUsers"  --role="roles/run.invoker" --region=europe-west4

export sigla_ng_url=$(gcloud run services describe sigla-ng --platform managed --region europe-west4 --format 'value(status.url)' --project $project_id)

envsubst <  sigla-thorntail-final.yaml > sigla-thorntail-final-sub.yaml

gcloud run services replace sigla-thorntail-final-sub.yaml
