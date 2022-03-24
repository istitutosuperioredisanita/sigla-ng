# Requisiti

L’utente deve possedere un **Google Cloud Project** collegato ad un **billing account**. 
Sul progetto dovranno essere attivate le seguenti API: 
* Compute Engine API
* Artifact Registry API
* Service Networking API
* Serverless VPC Access API
* Cloud SQL Admin API
* Cloud Run API

All'interno del path della demo, è presente lo script **enable_api.sh** che consentirà ad un utente **owner** del progetto di abilitare le API sopracitate da cloud shell.
Questo passaggio verrà eseguito nel flusso principale del deploy della soluzione.

# Deploy della soluzione

Accedere alla Cloud Shell di GCP e autenticarsi tramite il comando
```console
gcloud auth login
```

La soluzione dovrà essere erogata su un progetto vuoto già esistente, indicare quindi l'id del progetto e configurarlo come variabile d'ambiente
```console
export project_id=[project_id]
```
Settare il contesto col progetto GCP scelto
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
## Passagi logici del deploy
Come primo step, vengono abilitate tutte le Google Api descritte nei **Requisiti** tramite l'esecuzione dello script **enable_api.sh**.
Successivamente viene utilizzato Terraform, il tool che crea l’infrastruttura a partire da un linguaggio dichiarativo, che in questa demo rilascia le seguenti componenti:

* VPC e Subnet
* Artifact Registry
* Serverless VPC Access connector
* Cloud Router
* Cloud SQL (PostgreSQL)

Nella folder **Terraform** sono contenuti i file che descrivono l'infrastruttura e che vengono utilizzati come input dallo strumento.

Viene poi richiesto all'utente di scegliere e digitare la password che servirà all'applicazione per autenticarsi ed utilizzare il database: questa verrà salvata in maniera sicura sul **Secret Manager** del progetto GCP. L'istanza Postgres viene quindi inizializzata.

Lo script **push-docker-images.sh** esegue il pull delle ultime versioni dei container di Sigla pubblicate su **docker hub**, tagga le immagini ed esegue il push sull’**Artifact Registry** del GCP Project.

Terminati i passaggi precedenti, verrà rilasciato Sigla utilizzando i comandi **gcloud** e le configurazioni applicative in formato **YAML**, gli step sono i seguenti:

1. Recuperare l’IP privato dell’istanza Cloud SQL
2. Rilasciare sigla-ng su Cloud Run e renderlo reggiungibile tramite browser senza autenticazione
3. Recuperare l’url di sigla-ng e valorizzare le variabili d'ambiente  nella configurazione di sigla-thorntail
4. Rilasciare sigla-thorntail su Cloud Run e renderlo reggiungibile tramite browser senza autenticazione
5. Recuperare l’url di sigla-thorntail e aggiornare la configurazione di sigla-ng

## Schema architetturale

![schema](/demo-sigla-gcp-cloudrun/pics/architecture_schema_cloud_run.jpg)

# Visualizzare i log dell'applicazione
Una volta ultimato il deploy dell'intera soluzione, sarà possibile visualizzare lo standard output del container direttamente dalla console di GCP.
All'interno del progetto ospitante, nella sezione Google Cloud Run, saranno visibili i due servizi di nostro interesse: **sigla-thorntail** e **sigla-ng**.
Selezionando ciascuno di essi e navigando sul tab **logs** sarà possibile vedere lo standard output del container in tempo reale, filtrare i log o farne il dump da scaricare in locale.

![log](/demo-sigla-gcp-cloudrun/pics/screen_log_cloud_run.png)

# Update della versione di Sigla
È posibile aggiornare la versione di Sigla, contestualmente all'aggiornamento delle immagini Docker ufficiali ([sigla-thorntail](https://hub.docker.com/r/consiglionazionalericerche/sigla-main/tags), [sigla-ng](https://hub.docker.com/r/consiglionazionalericerche/sigla-ng/tags)), tramite lo script **update-service.sh**.

Lo script scarica le nuove immagini dal Docker Hub, utilizzando i tag **latest** per sigla-ng e **release** per sigla-main, e le aggiorna sull'artifact registry del progetto, successivamente rilancia i file di configurazione .yaml in modo da aggiornare i container sui servizi Cloud Run.

# Provalo su Google Cloud
[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://ssh.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https://github.com/consiglionazionaledellericerche/sigla-ng.git&cloudshell_workspace=./demo-sigla-gcp-cloudrun&cloudshell_print=guide.txt&shellonly=true)