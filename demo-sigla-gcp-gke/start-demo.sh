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
echo $password

#init database
gcloud sql users create sigla --instance=pdb-team-digi-sigla-001 --password=$password
gcloud sql databases create sigladb --instance=pdb-team-digi-sigla-001

#docker images
./push-docker-images.sh

#give cluster permission reading images and logs
mapfile -t service_accounts < <(gcloud iam service-accounts list | grep EMAIL: | grep -E -o "\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}\b")

for sa in "${service_accounts[@]}"
do
  for role in artifactregistry.reader logging.logWriter monitoring.metricWriter monitoring.viewer stackdriver.resourceMetadata.writer
  do
    gcloud projects add-iam-policy-binding $project_id --member="serviceAccount:$sa"  --role="roles/$role"
  done
done

#login to cluster
gcloud container clusters get-credentials gke-team-digi-sigla-poc-001 --region europe-west4 --project $project_id

#retrieve database private ip
export db_private_ip=$(gcloud sql instances describe pdb-team-digi-sigla-001 | grep '\-\sipAddress:' | grep -E -o '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)')

#create secret for db credentials
kubectl create secret generic db-credential --from-literal="password=$password"

#deploy first configuration of sigla thorntail
envsubst <  gke-sigla-thorntail.yaml > gke-sigla-thorntail-sub.yaml

kubectl apply -f gke-sigla-thorntail-sub.yaml

#Retrieve and set sigla-thorntail ip
max_attempts=5
timeout=4
attempt=0
while [[ $attempt < $max_attempts ]]
do
  export sigla_thorntail_ip=$(kubectl get services -l app=sigla-thorntail -o jsonpath="{.items[0].status.loadBalancer.ingress[0].ip}")
  if [[ $sigla_thorntail_ip != "" ]]
  then
    echo "sigla-thontail ip:" $sigla_thorntail_ip
    break
  fi
  echo "Service ip for sigla-thorntail is not available yet! Retrying in $timeout.." 1>&2
  sleep $timeout
  attempt=$(( attempt + 1 ))
  timeout=$(( timeout * 2 ))
done
if [[ $sigla_thorntail_ip == "" ]]
then
  echo "Service ip for sigla-thorntail is not available yet!" 1>&2
fi

envsubst <  gke-sigla-ng.yaml > gke-sigla-ng-sub.yaml

kubectl apply -f gke-sigla-ng-sub.yaml

#Retrieve and set sigla-ng ip
max_attempts=5
timeout=4
attempt=0
while [[ $attempt < $max_attempts ]]
do
  export sigla_ng_ip=$(kubectl get services -l app=sigla-ng -o jsonpath="{.items[0].status.loadBalancer.ingress[0].ip}")
  if [[ $sigla_ng_ip != "" ]]
  then
    echo "sigla-ng ip:" $sigla_ng_ip
    break
  fi
  echo "Service ip for sigla-ng is not available yet! Retrying in $timeout.." 1>&2
  sleep $timeout
  attempt=$(( attempt + 1 ))
  timeout=$(( timeout * 2 ))
done
if [[ $sigla_ng_ip == "" ]]
then
  echo "Service ip for sigla-ng is not available yet!" 1>&2
fi

envsubst <  gke-sigla-thorntail-final.yaml > gke-sigla-thorntail-final-sub.yaml

kubectl apply -f gke-sigla-thorntail-final-sub.yaml