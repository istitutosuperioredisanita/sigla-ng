#!/bin/bash

export db_private_ip=$(gcloud sql instances describe pdb-team-digi-sigla-001 | grep '\-\sipAddress:' | grep -E -o '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)')

gcloud sql users set-password postgres --instance=pdb-team-digi-sigla-001 --password=mysecretpassword

gcloud sql users create sigla --instance=pdb-team-digi-sigla-001 --password=siglapw

gcloud sql databases create sigladb --instance=pdb-team-digi-sigla-001