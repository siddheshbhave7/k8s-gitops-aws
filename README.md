# Full-Stack GitOps Kubernetes Project

This repository contains a complete, end-to-end DevOps project demonstrating modern application development, containerization, CI/CD automation, and GitOps deployment on Kubernetes.

## 🏗️ Architecture Overview

The project consists of a full-stack Task Tracker application deployed onto a Kubernetes cluster using the GitOps methodology. 

1. **Frontend:** React.js (Vite) application styled with modern CSS.
2. **Backend:** Node.js (Express) REST API handling CRUD operations.
3. **Containerization:** Multi-stage Docker builds (Nginx for frontend, Alpine Node for backend).
4. **Continuous Integration (CI):** GitHub Actions pipeline that automatically builds and pushes Docker images to Docker Hub on every push to `main`.
5. **Continuous Deployment (CD):** ArgoCD monitors this repository and automatically synchronizes the Kubernetes manifests to a live cluster.
6. **Monitoring & Observability:** Prometheus and Grafana deployed via native Helm to track cluster metrics and resource utilization independently of the application lifecycle.
7. **Infrastructure:** Local Ubuntu server running a lightweight Kubernetes distribution (k3s). *(Note: AWS Terraform configurations are also available in the `terraform/` directory for cloud deployments).*

---

## 📁 Repository Structure

```
├── backend/                  # Node.js Express API source code & Dockerfile
├── frontend/                 # React.js UI source code & Dockerfile (Nginx)
├── k8s/                      # Kubernetes Deployment & Service YAML manifests
├── terraform/                # AWS Infrastructure-as-Code (VPC, EC2, Security Groups)
├── .github/workflows/        # GitHub Actions CI pipeline configuration
└── README.md                 # Project documentation
```

---

## 🚀 How it Works (The GitOps Flow)

1. A developer modifies the application code in `frontend/` or `backend/` and pushes the changes to GitHub.
2. **GitHub Actions** detects the push, runs the `ci.yml` workflow, builds the new Docker images, tags them with the Git commit SHA, and pushes them to Docker Hub.
3. The developer updates the Kubernetes manifests in the `k8s/` directory (if needed).
4. **ArgoCD**, running inside the Kubernetes cluster, detects the changes in the `k8s/` folder.
5. ArgoCD automatically pulls the new configurations and Docker images, performing a rolling update on the Kubernetes cluster with zero downtime.

---

## 🛠️ Local Setup & Execution

### 1. Run Locally (Without Docker)
```bash
# Start Backend (Port 5000)
cd backend
npm install
npm start

# Start Frontend (Port 5173)
cd frontend
npm install
npm run dev
```

### 2. Deploy to Kubernetes (GitOps)
This project is configured to run on a local Kubernetes cluster (like k3s or Minikube).

1. Install **ArgoCD** on your Kubernetes cluster.
2. Apply the ArgoCD Application manifest to connect your cluster to this repository:
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: task-tracker
  namespace: argocd
spec:
  project: default
  source:
    repoURL: 'https://github.com/siddheshbhave7/k8s-gitops-aws.git'
    path: k8s
    targetRevision: HEAD
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```
3. ArgoCD will automatically deploy the frontend (exposed via NodePort `30080`) and backend (exposed via NodePort `30005`).

### 3. Deploy Monitoring (Prometheus & Grafana)
We intentionally deploy the monitoring stack outside of the GitOps pipeline as a separate platform service using native Helm commands. This ensures that monitoring remains functional even if ArgoCD experiences an outage.

```bash
# Add the Prometheus community Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install the Kube-Prometheus-Stack
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.service.type=NodePort \
  --set grafana.service.nodePort=30090 \
  --set grafana.adminPassword="admin"
```
*Access Grafana at `http://<YOUR-NODE-IP>:30090` with the credentials `admin/admin`.*

---

## 💡 Key Features Implemented

* **Dynamic Environment Variables:** The React frontend dynamically determines the API URL based on the browser's current hostname (`window.location.hostname`), eliminating hardcoded IP addresses and making the app portable across different local network IPs.
* **Multi-Stage Builds:** The frontend Docker image compiles the React app using Node.js, but serves the static files using a lightweight Nginx image, drastically reducing the final image size and improving security.
* **Layer Caching:** The CI pipeline utilizes Docker Buildx layer caching (`cache-from`/`cache-to`) to Docker Hub, reducing subsequent pipeline execution times.
* **Separation of Concerns (Platform vs App):** Application deployments are fully automated via GitOps (ArgoCD), while critical platform infrastructure (Prometheus/Grafana) is managed natively (Helm). This deliberate architecture prevents a bad application deployment pipeline from taking down cluster observability.
