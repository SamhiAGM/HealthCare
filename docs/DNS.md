# LankaCare DNS Configuration

This document outlines the required production DNS records. **Do not store private credentials in this file.**

All records must be managed directly at your Domain Registrar (e.g., Namecheap) to avoid paid Azure DNS Zone fees.

## Root Domain Configuration (Apex)
If your registrar supports free URL forwarding or CNAME flattening:
- **Rule**: Forward https://lankacare.app to https://www.lankacare.app (301 Permanent Redirect)

## Frontend (Azure Static Web Apps)
- **Type**: \CNAME\
- **Name/Host**: \www\
- **Value/Target**: \<Azure Static Web App Auto-Generated Hostname>.azurestaticapps.net\
- **TTL**: Auto / 3600

## Backend API (Azure Container Apps)
- **Type**: \CNAME\
- **Name/Host**: \pi\
- **Value/Target**: \<Azure Container App Auto-Generated Hostname>.<region>.azurecontainerapps.io\
- **TTL**: Auto / 3600

### Backend Domain Verification (Required by Azure Container Apps)
- **Type**: \TXT\
- **Name/Host**: \suid.api\
- **Value/Target**: \<Azure Verification Token provided in the portal>\
- **TTL**: Auto / 3600
