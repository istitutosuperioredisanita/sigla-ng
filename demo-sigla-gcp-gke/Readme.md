# Modello di deploy
![schema](/demo-sigla-gcp-gke/pics/architecture_schema_gke.jpg)

# Requisiti
L’utente deve possedere un **Google Cloud Project** collegato ad un **billing account**. 
Sul progetto dovranno essere attivate le seguenti API: 
* Compute Engine API
* Artifact Registry API
* Service Networking API
* Serverless VPC Access API
* Cloud SQL Admin API

All'interno del path della demo, è presente lo script **enable_api.sh** che consentirà ad un utente **owner** (o **editor** più **Kubernetes Admin Engine**) del progetto di abilitare le API sopracitate da cloud shell.
Questo passaggio verrà eseguito nel flusso principale del deploy della soluzione.

È posibile verificare che l'utente in uso abbia i permessi utili al deploy dell'intera soluzione eseguendo il comando ```./check-permissions.sh``` all'interno della directory della demo.

Per una corretta esecuzione degli script, la cloud shell deve essere istanziata in modalità **non-ephemeral** (impostata già di default). A tal proposito, quando si sceglie di eseguire la demo direttamente dal pulsante **[Provalo su Google Cloud](#provalo-su-google-cloud)** assicurarsi di scegliere l’opzione **☑ Trust Repo** all’apertura della Cloud Shell. In caso contrario la shell verrà istanziata in modalità [**ephemeral**](https://cloud.google.com/shell/docs/using-cloud-shell#choosing_ephemeral_mode).

## Provalo su Google Cloud
[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://ssh.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https://github.com/consiglionazionaledellericerche/sigla-ng.git&cloudshell_workspace=./demo-sigla-gcp-gke&cloudshell_print=guide.txt&shellonly=true)

# Deployment
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

## Passagi logici del deployment
Come primo step, vengono abilitate tutte le Google Api descritte nei **Requisiti** tramite l'esecuzione dello script **enable_api.sh**.
Successivamente viene utilizzato Terraform, il tool che crea l’infrastruttura a partire da un linguaggio dichiarativo, che in questa demo rilascia le seguenti componenti:

* VPC e Subnet
* Artifact Registry
* Cloud Router
* Cloud SQL (PostgreSQL)
* Google Kubernetes Engine Cluster

Nella folder **Terraform** sono contenuti i file che descrivono l'infrastruttura e che vengono utilizzati come input dallo strumento: nel file **main.tf**, dentro il blocco ```resource "google_sql_database_instance" "instance"```, è presente il flag ```deletion_protection```. Questo parametro, se omesso, è implicitamente valorizzato a ```true``` e impedisce di eliminare il database tramite Terraform. Trattandosi di una demo, il flag è esplicitamente valorizzato a ```false```, ma nel caso in cui si voglia riutilizzare gli script, è sufficiente commentare, o eliminare, l'intera riga ```deletion_protection = false```.

Viene poi richiesto all'utente di scegliere e digitare la password che servirà all'applicazione per autenticarsi ed utilizzare il database: questa verrà salvata in maniera sicura come **secret** sul cluster GKE rilasciato. L'istanza Postgres viene quindi inizializzata.

Lo script **push-docker-images.sh** esegue il pull delle ultime versioni dei container di Sigla pubblicate su **docker hub**, tagga le immagini ed esegue il push sull’**Artifact Registry** del GCP Project.

Terminati i passaggi precedenti, verrà rilasciato Sigla utilizzando i comandi **kubectl** e le configurazioni applicative in formato **YAML**, gli step sono i seguenti:

1. Recuperare l’IP privato dell’istanza Cloud SQL
2. Rilasciare sigla-ng sul cluster GKE e renderlo reggiungibile tramite un **service public IP**
3. Recuperare l'IP pubblico di sigla-ng e valorizzare le variabili d'ambiente  nella configurazione di sigla-thorntail
4. Rilasciare sigla-thorntail sul cluster GKE e renderlo reggiungibile tramite un service public IP
5. Recuperare l’IP pubblico di sigla-thorntail e aggiornare la configurazione di sigla-ng

# Troubleshooting e management
## Visualizzare i log dell'applicazione
Una volta ultimato il deploy dell'intera soluzione, sarà possibile visualizzare lo standard output del container direttamente dalla console di GCP.
All'interno del progetto ospitante, nella sezione Google Kubernetes Engine, selezionare il cluster Kubernetes che esegue Sigla (se le istruzioni sono state eseguite as-is, il nome sarà **gke-team-digi-sigla-poc-001**) e scegliere il tab **Workloads** sulla sinistra. 
Filtrando sul **namespace** dell'applicazione (se le istruzioni sono state eseguite as-is, sarà **default**) saranno visibili i due pod di nostro interesse: **sigla-thorntail** e **sigla-ng**.
Selezionando ciascuno di essi e navigando sul tab **logs** sarà possibile vedere lo standard output del container in tempo reale, filtrare i log o farne il dump da scaricare in locale.

![log](/demo-sigla-gcp-gke/pics/screen_log_gke.png)

## Update della versione di Sigla
È posibile aggiornare la versione di Sigla, contestualmente all'aggiornamento delle immagini Docker ufficiali ([sigla-thorntail](https://hub.docker.com/r/consiglionazionalericerche/sigla-main/tags), [sigla-ng](https://hub.docker.com/r/consiglionazionalericerche/sigla-ng/tags)), tramite lo script **update-service.sh**.

Lo script scarica le ultime versioni delle immagini dal Docker Hub, utilizzando i tag **latest** per sigla-ng e **release** per sigla-main, e le aggiorna sull'artifact registry del progetto, successivamente rilancia i file di configurazione .yaml in modo da aggiornare i container sul cluster GKE.

## Eliminazione risorse
Una volta ultimata la demo, è possibile eliminare tutte le risorse create tramite l'esecuzione dello script **clean-environment.sh**.