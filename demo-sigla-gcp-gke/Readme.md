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

In caso gli ip dei services creati per esporre i POD non siano risultati disponibili durante l'esecuzione di "start-demo.sh", è presente un script di retry
```console
./retry_gke_deploy.sh
```

# Visualizzare i log dell'applicazione
Una volta ultimato il deploy dell'intera soluzione, sarà possibile visualizzare lo standard output del container direttamente dalla console di GCP.
All'interno del progetto ospitante, nella sezione Google Kubernetes Engine, selezionare il cluster Kubernetes che esegue Sigla (se le istruzioni sono state eseguite as-is, il nome sarà **gke-team-digi-sigla-poc-001**) e scegliere il tab **Workloads** sulla sinistra. 
Filtrando sul **namespace** dell'applicazione (se le istruzioni sono state eseguite as-is, sarà **default**) saranno visibili i due pod di nostro interesse: **sigla-thorntail** e **sigla-ng**.
Selezionando ciascuno di essi e navigando sul tab **logs** sarà possibile vedere lo standard output del container in tempo reale, filtrare i log o farne il dump da scaricare in locale.

![log](/demo-sigla-gcp-gke/pics/log_gke.png)

# Update della versione di Sigla
È posibile aggiornare la versione di Sigla, contestualmente all'aggiornamento delle immagini Docker ufficiali ([sigla-thorntail](https://hub.docker.com/r/consiglionazionalericerche/sigla-main/tags), [sigla-ng](https://hub.docker.com/r/consiglionazionalericerche/sigla-ng/tags)), tramite lo script **update-service.sh**.

Lo script scarica le ultime versioni delle immagini dal Docker Hub, utilizzando i tag **latest** per sigla-ng e **release** per sigla-main, e le aggiorna sull'artifact registry del progetto, successivamente rilancia i file di configurazione .yaml in modo da aggiornare i container sul cluster GKE.

## Provalo su Google Cloud
[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://ssh.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https://github.com/consiglionazionaledellericerche/sigla-ng.git&cloudshell_workspace=./demo-sigla-gcp-gke&cloudshell_print=guide.txt&shellonly=true)