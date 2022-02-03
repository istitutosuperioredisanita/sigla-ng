#!/bin/bash

gcloud sql users set-password postgres --instance=pdb-team-digi-sigla-001 --password=mysecretpassword

gcloud sql users create sigla --instance=pdb-team-digi-sigla-001 --password=siglapw

gcloud sql databases create sigladb --instance=pdb-team-digi-sigla-001
