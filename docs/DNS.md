# DNS Configuration Guide

This guide details exactly how to map the custom domain `lankacare.me` to the Azure Container Apps.

You will need the **Frontend Azure Generated Hostname**, **Backend Azure Generated Hostname**, and the **Azure Environment IP**.

## 1. Backend Custom Domain (`api.lankacare.me`)

1. In the Azure Portal, go to **lankacare-api** > **Custom domains** > **Add custom domain**.
2. Select **Managed certificate** and input `api.lankacare.me`.
3. Azure will generate a verification code.
4. Go to your DNS Provider and add these records:

| Type  | Host/Name | Value |
| --- | --- | --- |
| CNAME | `api` | `<ACTUAL BACKEND AZURE GENERATED HOSTNAME>` |
| TXT   | `asuid.api` | `<ACTUAL AZURE VERIFICATION CODE>` |

5. Wait for propagation, then click **Validate** and bind the certificate in Azure.

## 2. Frontend Subdomain (`www.lankacare.me`)

1. In the Azure Portal, go to **lankacare-web** > **Custom domains** > **Add custom domain**.
2. Select **Managed certificate** and input `www.lankacare.me`.
3. Azure will generate a verification code.
4. Add these DNS records:

| Type  | Host/Name | Value |
| --- | --- | --- |
| CNAME | `www` | `<ACTUAL FRONTEND AZURE GENERATED HOSTNAME>` |
| TXT   | `asuid.www` | `<ACTUAL AZURE VERIFICATION CODE>` |

5. Validate and bind the certificate in Azure.

## 3. Frontend Apex Domain (`lankacare.me`)

1. In the Azure Portal, go to **lankacare-web** > **Custom domains** > **Add custom domain**.
2. Select **Managed certificate** and input `lankacare.me`.
3. Azure will generate a verification code.
4. Retrieve the **Container Apps Environment Static IP** from the overview page of `lankacare-env`.
5. Add these DNS records:

| Type  | Host/Name | Value |
| --- | --- | --- |
| A | `@` (or leave empty) | `<ACTUAL CONTAINER APPS ENVIRONMENT IP>` |
| TXT   | `asuid` | `<ACTUAL AZURE FRONTEND VERIFICATION CODE>` |

6. Validate and bind the certificate in Azure.

## Complete DNS Record Summary

Your final DNS configuration should look like this:

| Type | Name | Value |
| :--- | :--- | :--- |
| A | `@` | `<Azure environment IP>` |
| TXT | `asuid` | `<frontend verification code>` |
| CNAME | `www` | `<frontend Azure generated hostname>` |
| TXT | `asuid.www` | `<frontend verification code>` |
| CNAME | `api` | `<backend Azure generated hostname>` |
| TXT | `asuid.api` | `<backend verification code>` |

*(Note: If CAA records are present, ensure `digicert.com` is permitted as required by Azure Managed Certificates).*
