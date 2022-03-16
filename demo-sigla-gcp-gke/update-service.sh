#!/bin/bash

#Docker images
./push-docker-images.sh

export db_private_ip=$(gcloud sql instances describe pdb-team-digi-sigla-001 | grep '\-\sipAddress:' | grep -E -o '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)')

#update sigla gke service

gcloud container clusters get-credentials gke-team-digi-sigla-poc-001 --region europe-west4 --project $project_id

#Retrieve and set sigla-ng ip
export sigla_ng_ip=$(kubectl get services -l app=sigla-ng -o jsonpath="{.items[0].status.loadBalancer.ingress[0].ip}")

envsubst <  gke-sigla-thorntail.yaml > gke-sigla-thorntail-sub.yaml

kubectl apply -f gke-sigla-thorntail-sub.yaml

#Retrieve and set sigla-thorntail ip
export sigla_thorntail_ip=$(kubectl get services -l app=sigla-thorntail -o jsonpath="{.items[0].status.loadBalancer.ingress[0].ip}")
  
envsubst <  gke-sigla-ng.yaml > gke-sigla-ng-sub.yaml

kubectl apply -f gke-sigla-ng-sub.yaml