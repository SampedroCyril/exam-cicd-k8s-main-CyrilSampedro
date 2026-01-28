# Exam CI/CD + Kubernetes — API REST (Node.js)

Url du REPO : https://github.com/SampedroCyril/exam-cicd-k8s-main-CyrilSampedro

## Architecture

Le projet est une API REST Node.js (Express) conteneurisée avec Docker, déployée via une chaîne CI/CD GitHub Actions vers DockerHub, puis exécutée sur Kubernetes (Minikube pour les tests).

Composants :
- **API Node.js** : endpoints dont `/health` (retourne `status` + `version`).
- **Docker** :
  - Build reproductible via `npm ci` + `package-lock.json`
  - Lancement configurable via la variable d’environnement `APP_PORT`
  - L’application écoute sur `0.0.0.0`
- **CI/CD (GitHub Actions)** :
  - Job `build_test` : installation + tests
  - Job `push` : build + push de l’image sur DockerHub
  - Job `health` : pull + run du container + test automatique de `GET /health`
  - Pipeline bloquant (si un job échoue, les suivants ne tournent pas)
  - Tag d’image basé sur le commit (SHA court)
- **Kubernetes (`k8s/`)** :
  - `ConfigMap` : configuration (`APP_PORT`, `APP_VERSION`)
  - `Deployment` : 2 replicas minimum + RollingUpdate sans interruption
  - `Service` : exposition interne en ClusterIP
  - `ReadinessProbe` + `LivenessProbe` sur `/health`

---

## Choix techniques

### Docker
- **Reproductibilité** : utilisation de `npm ci` (basé sur `package-lock.json`).
- **Image légère** : séparation build/test et runtime, runtime installé en prod-only (`--omit=dev`).
- **Port dynamique** : l’API lit `APP_PORT` (ex: 3000) et écoute sur `0.0.0.0` pour être accessible dans un container / cluster.

### CI/CD
- **Bloquant** : enchaînement par dépendances (`needs`) pour stopper le pipeline au premier échec.
- **Traçabilité** : tag de l’image Docker basé sur le SHA du commit (ex: `9b1f250`).
- **Vérification automatique** : un container est lancé dans le job `health` puis `curl /health` valide le démarrage réel.

### Kubernetes
- **Haute disponibilité minimale** : `replicas: 2`.
- **Rolling update sans interruption** : `maxUnavailable: 0`, `maxSurge: 1`.
- **Probes** :
  - `readinessProbe` : garantit que le pod est prêt avant d’être routé
  - `livenessProbe` : redémarrage automatique si l’app ne répond plus
- **Fichiers séparés** : `deployment.yaml`, `service.yaml`, `configmap.yaml`.

---

## Commandes clés

### Local (Node)
```bash
npm ci
npm test
APP_PORT=8080 npm start
curl -f http://localhost:8080/health

### Local (Docker)

```bash
docker build -t exam-api:local .
docker run --rm -e APP_PORT=8088 -p 8088:8088 exam-api:local
curl -f http://localhost:8088/health
```

### CI/CD (GitHub Actions)

* Les secrets GitHub Actions requis :

  * `DOCKERHUB_USERNAME`
  * `DOCKERHUB_TOKEN` (token DockerHub avec droits d’écriture)
* Déclenchement : `git push` → pipeline `build_test` → `push` → `health`.

### Kubernetes (Minikube)

Appliquer les manifests :

```bash
kubectl apply -f k8s/
kubectl get pods
kubectl rollout status deployment/exam-api
kubectl get svc exam-api-svc
```

Accès au service (méthode fiable) :

```bash
kubectl port-forward svc/exam-api-svc 8089:80
curl -f http://localhost:8089/health
```

---

## Notes de déploiement Kubernetes

Dans `k8s/deployment.yaml`, l’image doit pointer vers l’image DockerHub réellement poussée :

```yaml
image: <dockerhub_user>/<dockerhub_repo>:<sha_tag>
```

Exemple :

```yaml
image: alienogman/exam-cicd-k8s-main-cyrilsampedro:9b1f250
```