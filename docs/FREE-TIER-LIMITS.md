# LankaCare Free Tier Limits

This document records the free limits and expiration boundaries for the zero-cost deployment architecture used by LankaCare.

## Azure Static Web Apps (Frontend)
- **Plan**: Free
- **Bandwidth**: 100 GB per subscription per month
- **Custom Domains**: 2 per app (Free managed SSL included)
- **Storage**: 250 MB per app

## Azure Container Apps (Backend)
- **Plan**: Consumption
- **Monthly Free Grant**: 
  - 180,000 vCPU-seconds
  - 360,000 GiB-seconds
  - 2 million requests
- *Protection*: Max replicas set to 1, Min replicas set to 0 to ensure scale-to-zero when idle.

## MongoDB Atlas
- **Plan**: M0 Free Cluster
- **Storage**: 512 MB
- **Connections**: 500 max connections

## Domain Expiration Tracker
> **WARNING: Domains provided through GitHub Student Developer Pack typically expire after 1 year.**
- **Domain**: lankacare.app (Pending registration)
- **Registrar**: Name.com / Namecheap / .TECH (To be confirmed)
- **Registered**: DATE
- **Free Until**: DATE (1 year from registration)
- **Renewal**: Check registrar price 30 days before expiration. Do not assume automatic free renewal.

## Student Azure Credit Expiration
- Azure for Students provides  credit for 12 months.
- Even on free tiers, some egress or external services may draw pennies. Monitor the expiration of the credit.
