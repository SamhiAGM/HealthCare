# Production Environment Variables

This document lists the environment variables required for the production environment on Azure Container Apps. **Do NOT commit actual secret values to version control.** Store them safely in GitHub Secrets and Azure Container Apps Environment Secrets.

## Frontend (`lankacare-web`)
These variables must be provided as build args during the Docker build process or loaded via environment variables in a standalone Next.js build. 

```env
NEXT_PUBLIC_APP_URL=https://lankacare.me
NEXT_PUBLIC_API_URL=https://api.lankacare.me/api/v1
NEXT_PUBLIC_SOCKET_URL=https://api.lankacare.me
```

## Backend (`lankacare-api`)
These variables must be set securely in the Azure Container App environment configuration.

```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://<dedicated-user>:<password>@<cluster-url>/<db>?retryWrites=true&w=majority
FRONTEND_URL=https://lankacare.me
JWT_ACCESS_SECRET=<generate_a_secure_random_string>
JWT_REFRESH_SECRET=<generate_a_secure_random_string>
NIC_ENCRYPTION_KEY=<32_byte_hex_string_for_encryption>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email-address>
EMAIL_PASSWORD=<your-app-password>
SMS_PROVIDER=<provider-name>
SMS_API_KEY=<provider-api-key>
```

### Notes on MongoDB Atlas:
- Ensure that you use a dedicated database user with **only** the required permissions (read/write on the specific LankaCare database).
- Do not use the cluster admin user for the application connection.
- Verify that Azure Container Apps can connect to MongoDB Atlas (whitelist Azure IPs or configure `0.0.0.0/0` if necessary, though peering/PrivateLink is preferred when budget allows).
