# LankaCare Azure Deployment Guide

This document outlines the steps for deploying the LankaCare architecture to Azure Container Apps (Consumption Plan).

## Architecture
- **Frontend (Next.js)** -> `lankacare-web` on Azure Container Apps
- **Backend (Express + Socket.io)** -> `lankacare-api` on Azure Container Apps
- **Database** -> MongoDB Atlas

## Prerequisites
- Azure CLI installed and authenticated (`az login`)
- An active Azure for Students Subscription
- Docker installed

## 1. Create Resource Group & Environment
```bash
az group create --name rg-lankacare --location eastus

az containerapp env create \
  --name lankacare-env \
  --resource-group rg-lankacare \
  --location eastus
```

## 2. Deploy Backend (`lankacare-api`) First
Build and push the image to a container registry (e.g., ACR or GHCR), or use the GitHub CI/CD pipeline. To deploy manually via Azure CLI from local source (requires ACR or building remotely):

```bash
az containerapp up \
  --name lankacare-api \
  --resource-group rg-lankacare \
  --environment lankacare-env \
  --source ./backend \
  --ingress external \
  --target-port 8080 \
  --min-replicas 0 \
  --max-replicas 1 \
  --env-vars NODE_ENV=production PORT=8080 FRONTEND_URL=https://lankacare.me
```

> **Test the Backend:** Wait for deployment to finish and grab the generated hostname (e.g., `lankacare-api.niceocean-abc1234.eastus.azurecontainerapps.io`). Visit `https://<generated-host>/api/health` to confirm it returns `{"status":"ok","version":"1.0.0"}`.

## 3. Deploy Frontend (`lankacare-web`)
Ensure backend is healthy, then deploy frontend:

```bash
az containerapp up \
  --name lankacare-web \
  --resource-group rg-lankacare \
  --environment lankacare-env \
  --source ./frontend \
  --ingress external \
  --target-port 3000 \
  --min-replicas 0 \
  --max-replicas 1 \
  --env-vars \
    NEXT_PUBLIC_APP_URL=https://lankacare.me \
    NEXT_PUBLIC_API_URL=https://api.lankacare.me/api/v1 \
    NEXT_PUBLIC_SOCKET_URL=https://api.lankacare.me
```

> **Test the Frontend:** Check the frontend Azure generated hostname (e.g., `lankacare-web.niceocean-abc1234.eastus.azurecontainerapps.io`) to verify login pages and routing work.

## 4. Setup Custom Domains
Refer to `docs/DNS.md` for DNS configurations.

## 5. Cost Protection
Ensure both `min-replicas=0` and `max-replicas=1` are configured on both container apps to leverage the consumption free grant effectively.
Set up budget alerts in Azure Cost Management to notify you at low thresholds (e.g., $1 or $5).
