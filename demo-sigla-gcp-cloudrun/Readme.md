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

