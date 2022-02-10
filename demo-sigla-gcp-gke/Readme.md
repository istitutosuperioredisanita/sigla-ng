# Deploy della soluzione

Accedere alla Cloud Shell di GCP e autenticarsi tramite il comando
```console
gcloud auth login
```

La soluzione dovrà essere erogata su un progetto vuoto già esistente, indicare quindi l'id del progetto e configurarlo come variabile d'ambiente
```console
export project_id=[project_id]
```
Configurare la cloud shell per utilizzare il contesto del progetto corretto:
```console
gcloud config set project $project_id
```

Assicurarsi che tutti gli script siano eseguibili
```console
chmod +x *.sh
```

E infine lanciare il comando di creazione
```console
./start-demo.sh
```

In caso gli ip dei services creati per esporre i POD non siani risultati disponibili durante l'esecuzione di "start-demo.sh", è presente un script di retry
```console
./retry_gke_deploy.sh
```

## Provalo su Google Cloud
[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://ssh.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https://github.com/consiglionazionaledellericerche/sigla-ng.git&cloudshell_workspace=./demo-sigla-gcp-gke&cloudshell_print=guide.txt&shellonly=true)
