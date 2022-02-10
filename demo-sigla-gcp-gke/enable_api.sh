#!/bin/bash

for api in container.googleapis.com artifactregistry.googleapis.com cloudapis.googleapis.com compute.googleapis.com containerregistry.googleapis.com run.googleapis.com servicemanagement.googleapis.com servicenetworking.googleapis.com sql-component.googleapis.com sqladmin.googleapis.com vpcaccess.googleapis.com
do
	gcloud services enable $api
done
