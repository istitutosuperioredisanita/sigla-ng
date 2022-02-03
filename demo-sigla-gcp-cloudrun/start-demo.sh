#!/bin/bash

gcloud config set project $project_id
terraform apply -var="project_id=$project_id"
chmod +x init-db.sh
./init-db.sh
chmod +x push-docker-images.sh
./push-docker-iamges.sh

envsubst <  sigla-thorntail.yaml > sigla-thorntail-sub.yaml

gcloud run services add-iam-policy-binding sigla-thorntail --member="allUsers"  --role="roles/run.invoker" --region=europe-west4

export sigla_thorntail_url=$(gcloud run services describe sigla-thorntail --platform managed --region europe-west4 --format 'value(status.url)' --project $project_id)

envsubst <  sigla-ng.yaml > sigla-ng-sub.yaml

gcloud run services replace sigla-ng-sub.yaml

gcloud run services add-iam-policy-binding sigla-ng --member="allUsers"  --role="roles/run.invoker" --region=europe-west4

export sigla_ng_url=$(gcloud run services describe sigla-ng --platform managed --region europe-west4 --format 'value(status.url)' --project $project_id)

envsubst <  sigla-thorntail-final.yaml > sigla-thorntail-final-sub.yaml

gcloud run service replace sigla-thorntail-final-sub.yaml
