#!/bin/bash

#destroy all resources created by Terraform
cd terraform
terraform apply -destroy -var="project_id=$project_id"
cd ..

