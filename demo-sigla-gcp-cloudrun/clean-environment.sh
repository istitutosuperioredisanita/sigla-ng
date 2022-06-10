#!/bin/bash

#delete cloud run services
gcloud run services delete sigla-ng --region europe-west4 --quiet
gcloud run services delete sigla-thorntail --region europe-west4 --quiet
echo "Waiting for Cloud Run Services deletion going effective..."
sleep 3m

#delete cloud secret db-password
gcloud secrets delete db-password --quiet

#destroy all resources created by Terraform
cd terraform
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_sql_database_instance.instance
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_vpc_access_connector.connector
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_artifact_registry_repository.docker_registry
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_compute_global_address.private-ip-address
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_compute_router.router
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_service_networking_connection.private-vpc-connection
echo "Waiting for VPC Access connector deletion going effective..."
sleep 1m
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_compute_subnetwork.subnet
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_compute_network.vpc_network
terraform apply -destroy -var="project_id=$project_id" -auto-approve
cd ..

