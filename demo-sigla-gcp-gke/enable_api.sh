#!/bin/bash

for api in container.googleapis.com artifactregistry.googleapis.com bigquery.googleapis.com bigquerystorage.googleapis.com cloudapis.googleapis.com clouddebugger.googleapis.com cloudtrace.googleapis.com compute.googleapis.com containerregistry.googleapis.com datastore.googleapis.com deploymentmanager.googleapis.com logging.googleapis.com monitoring.googleapis.com oslogin.googleapis.com pubsub.googleapis.com run.googleapis.com servicemanagement.googleapis.com servicenetworking.googleapis.com serviceusage.googleapis.com sql-component.googleapis.com sqladmin.googleapis.com storage-api.googleapis.com storage-component.googleapis.com storage.googleapis.com vpcaccess.googleapis.com
do
	gcloud services enable $api
done
