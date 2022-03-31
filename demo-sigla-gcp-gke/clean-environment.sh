#!/bin/bash

#destroy all resources created by Terraform
cd terraform
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_artifact_registry_repository.docker_registry -target google_sql_database_instance.instance -target google_container_cluster.primary
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_compute_router_nat.nat
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_compute_router.router
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_compute_global_address.private-ip-address
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_service_networking_connection.private-vpc-connection
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_service_account.default
echo "Waiting for VPC linked objects deletion going effective..."
sleep 2m
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_compute_subnetwork.subnet
terraform apply -destroy -var="project_id=$project_id" -auto-approve -target google_compute_network.vpc_network
terraform apply -destroy -var="project_id=$project_id" -auto-approve
cd ..

