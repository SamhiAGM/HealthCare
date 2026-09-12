# LankaCare Azure Deployment Guide

This document provides the exact steps for the zero-out-of-pocket production deployment of the LankaCare application.

## 1. Resource Group
- **Name**: `rg-lankacare-student`
- **Subscription**: Azure for Students
- **Tags**: `Project=LankaCare`, `Environment=Production`, `Owner=Student`, `CostProfile=FreeTier`

## 2. Claiming the Free Domain (Phase 10)
To redeem your free domain through the GitHub Student Developer Pack:
1. Go to [GitHub Education](https://education.github.com/pack).
2. Scroll to the **Domains** section and find **Name.com**, **Namecheap**, or **.TECH**.
3. Click **Get Offer** and authenticate with your GitHub account.
4. Search for your preferred domain (e.g., `lankacare.app`, `lankacare.dev`).
5. Confirm the domain is covered by the student offer.
6. Proceed to checkout. **CRITICAL: Before final confirmation, ensure the checkout total is $0.**
7. Complete registration.

## 3. Frontend Deployment (Azure Static Web Apps)
- **Resource Name**: `lankacare-frontend`
- **Plan**: Free
- **Source**: GitHub Repository (`HealthCare`)
- **Build Details**: 
  - Framework: Next.js
  - App Location: `/frontend`
  - Output Location: `.next`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL=https://api.<student-domain>/api/v1`
  - `NEXT_PUBLIC_SOCKET_URL=https://api.<student-domain>`
  - `NEXT_PUBLIC_APP_URL=https://www.<student-domain>`

## 4. Backend Deployment (Azure Container Apps)
- **Resource Name**: `lankacare-api`
- **Plan**: Consumption
- **Scaling**: Minimum Replicas: 0 | Maximum Replicas: 1
- **Ingress**: External, HTTP, Target Port: 5000 (or your Express `PORT`)
- **Container Image**: Built via GitHub Actions and pulled from `ghcr.io` (GitHub Container Registry).
- **Environment Variables**:
  - `NODE_ENV=production`
  - `MONGODB_URI=<Atlas Free Tier URI>`
  - `FRONTEND_URL=https://www.<student-domain>`
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NIC_ENCRYPTION_KEY`, etc. (Sourced from GitHub Secrets)

## 5. SSL / TLS Configuration
Both frontend and backend utilize Azure's **Free Managed Certificates**.
- Frontend: Managed automatically via Azure Static Web Apps Custom Domains tab.
- Backend: Managed automatically via Azure Container Apps Ingress Custom Domains tab.

## 6. Cost Protection
- **Budgets**: Set Azure Budget alerts at $1, $5, and $10 against the subscription.
- Ensure the backend Container App strictly scales to 0 when idle.
- Monitor `FREE-TIER-LIMITS.md` boundaries monthly.
