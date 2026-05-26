# Base de données & Multi-tenant

## Règles critiques

1. Toutes les tables ont un `tenant_id` — sans exception
2. Toutes les queries filtrent par `tenant_id` — sans exception
3. Le `tenant_id` est extrait du subdomain dans `middleware.ts`
4. Ne jamais faire confiance au `tenant_id` côté client — vérifier côté serveur

**Routing subdomains :**
```
app.smartservice.ga      → (dashboard)
smartservice.ga          → (marketing)
{slug}.smartservice.ga   → (tenant)/[slug]
```

## Schéma DB

```
tenants       → id, name, slug, custom_domain, plan, logo_url, whatsapp_number
users         → id, tenant_id, email, full_name, role
customers     → id, tenant_id, full_name, phone, email, address
services      → id, tenant_id, name, description, price, duration_minutes
appointments  → id, tenant_id, customer_id, service_id, scheduled_at, status, is_urgent
interventions → id, tenant_id, appointment_id, technician_id, notes, photos_before, photos_after
invoices      → id, tenant_id, customer_id, appointment_id, amount, status, pdf_url
reviews       → id, tenant_id, customer_id, appointment_id, rating, comment
```

- **Statuts appointments** : `pending` | `confirmed` | `done` | `cancelled`
- **Plans** : `free` | `pro` | `business`
- **Rôles** : `admin` | `staff`
