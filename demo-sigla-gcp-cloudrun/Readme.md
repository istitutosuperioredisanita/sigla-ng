# Deploy della soluzione

Accedere alla Cloud Shell di GCP e autenticarsi tramite il comando
```js
gcloud auth login
```

La soluzione dovrà essere erogata su un progetto vuoto già esistente, indicare quindi l'id del progetto e configurarlo come variabile d'ambiente
```js
export project_id=[project_id]
```

Assicurarsi che tutti gli script siano eseguibili
```js
chmod +x *.sh
```

E infine lanciare il conado di creazione
```js
./start-demo.sh
```

## Provalo su Google Cloud
[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://ssh.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https://github.com/consiglionazionaledellericerche/sigla-ng.git&cloudshell_workspace=./demo-sigla-gcp-cloud-run&cloudshell_print=guide.txt&shellonly=true)
