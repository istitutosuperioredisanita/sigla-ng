#!/bin/bash

cd terraform
terraform init
terraform apply -var="project_id=$project_id"
cd ..

#read password from prompt
while true; do
  read -s -p "Password: " password
  echo
  read -s -p "Password (confirm): " password2
  echo
  [ "$password" = "$password2" ] && break
  echo "Please try again"
done

#Create a secret in GCP secret manager
gcloud secrets create db-password
echo -n $password | gcloud secrets versions add db-password --data-file=-

#init database
gcloud sql users create sigla --instance=pdb-team-digi-sigla-001 --password=$password
gcloud sql databases create sigladb --instance=pdb-team-digi-sigla-001

#Docker images
./push-docker-images.sh

#give cloudrun accounts permissions reading secrets
mapfile -t service_accounts < <(gcloud iam service-accounts list | grep EMAIL: | grep -E -o "\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}\b")

for sa in "${service_accounts[@]}"
do
    gcloud projects add-iam-policy-binding $project_id --member="serviceAccount:$sa"  --role="roles/secretmanager.secretAccessor"
done

#get database private ip address
export db_private_ip=$(gcloud sql instances describe pdb-team-digi-sigla-001 | grep '\-\sipAddress:' | grep -E -o '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)')

#deploy sigla service
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