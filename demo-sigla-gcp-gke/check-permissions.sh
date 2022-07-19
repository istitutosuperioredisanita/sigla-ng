#!/bin/bash

#Check if the user running the script has Owner role

USR=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
echo "This is the currect active user: $USR. Checking permissions..."
if gcloud projects get-iam-policy "${project_id}" --flatten=bindings --filter=bindings.role:roles/owner --format='value(bindings.members)' | grep -q "${USR}"
then
        echo "The user has Project Owner role, continuing deploy"
elif gcloud projects get-iam-policy "${project_id}" --flatten=bindings --filter=bindings.role:roles/editor --format='value(bindings.members)' | grep -q "${USR}" && gcloud projects get-iam-policy "${project_id}" --flatten=bindings --filter=bindings.role:roles/container.clusterAdmin --format='value(bindings.members)' | grep -q "${USR}"
then
        echo "The user has Project Editor and Kubernetes Admin Engine role, continuing deploy"
else
        echo "Stopping deploy. Fix permissions by adding the current user either Project Owner or Project Editor and Kubernetes Engine Admin role, then run the script again"
        exit 1
fi