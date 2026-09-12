This is a [Next.js](https://nextjs.org) project bootstrapped with `[create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app)`.

## Lokale installatie

De applicatie gebruikt Node.js 24 LTS, Next.js 16, React 19, Supabase en Resend.

```bash
nvm use
npm ci
cp .env.example .env.local
```

Vul in `.env.local` de server-side Supabase- en Resend-gegevens in. Alleen
`NEXT_PUBLIC_SITE_URL` wordt naar de browser gestuurd. Gebruik nooit een
Supabase service-role sleutel in een variabele met het voorvoegsel
`NEXT_PUBLIC_`.

Start daarna de ontwikkelserver:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Zonder serverconfiguratie toont de site een lokale voorbeeldcatalogus. Afrekenen
faalt dan bewust met een gecontroleerde `503`-melding; er worden nooit
bestellingen of prijzen uitsluitend in de browser vertrouwd.

## Database en e-mail

- Nieuwe Supabase-projecten kunnen `supabase/schema.sql` gebruiken.
- Voor een bestaand project voer je eerst
`supabase/migrations/20260826_security_hardening.sql` uit.
- De migratie trekt publieke toegang tot bestellingen in, voegt idempotentie en
rate limiting toe en maakt niet-voorspelbare bestelnummers.
- Stel `RESEND_FROM_EMAIL` in op een afzender van een geverifieerd domein.

Controleer na de migratie de volledige bestelstroom eerst in een stagingomgeving.

De checkout-rate-limit gebruikt in productie uitsluitend de door Vercel beheerde
`x-vercel-forwarded-for`-header. Andere proxyheaders worden genegeerd. Een
self-hosted productieomgeving faalt bewust gesloten totdat een gelijkwaardige,
vertrouwde proxy-integratie in de applicatie is toegevoegd. Lokaal gebruiken alle
verzoeken één vaste ontwikkelbucket.

## Kwaliteitscontroles

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run audit:prod
```

De productieconfiguratie bevat CSP, HSTS, clickjacking- en MIME-bescherming,
een strikt referrerbeleid en beperkte browserpermissies.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
