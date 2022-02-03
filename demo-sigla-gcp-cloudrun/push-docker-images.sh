#!/bin/bash

gcloud auth configure-docker europe-west4-docker.pkg.dev

#sigla-thorntail
docker pull consiglionazionalericerche/sigla-main:release
docker tag consiglionazionalericerche/sigla-main:release europe-west4-docker.pkg.dev/$project_id/ar-team-digi-sigla-poc-001/sigla-main:release
docker push europe-west4-docker.pkg.dev/$project_id/ar-team-digi-sigla-poc-001/sigla-main:release

#sigla-ng
docker pull consiglionazionalericerche/sigla-ng:latest
docker tag consiglionazionalericerche/sigla-ng:latest europe-west4-docker.pkg.dev/$project_id/ar-team-digi-sigla-poc-001/sigla-ng:latest
docker push europe-west4-docker.pkg.dev/$project_id/ar-team-digi-sigla-poc-001/sigla-ng:latest