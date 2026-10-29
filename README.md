# Makeon

Site de prezentare și magazin online pentru Makeon, care reunește **SwitchMORN Coffee** și **Vero Aqua**. Platforma prezintă oferta de cafea, apă și echipamente pentru companii și include un dashboard pentru administrarea magazinului.

## Site-ul

Homepage-ul introduce împreună cafeaua și apa pentru birouri. Pe desktop generos, panorama se transformă la scroll în fotografie 55% și oferte 45%, cu fixare CSS nativă și texte ancorate. Pe ecrane mai mici și cu mișcare redusă, compoziția completă rămâne în flux normal. Pagina de cafea alternează fotografia de context, oferta cu espressor și cele trei produse reale. Pagina de apă grupează titlul, aparatul și condițiile abonamentului, apoi prezintă o imagine mare alături de toate cele cinci includeri. Hero-urile, secțiunile și interacțiunile au straturi de animație separate, cu fallback vizibil. Navigația oferă acces direct la `/apa`, `/cafea-pentru-birouri`, `/cafea-la-evenimente` și magazinul `/cafea`. Footerul comun reunește contactul, navigația și informațiile legale.

Interfața este adaptată pentru desktop și telefon, cu navigație prin tastatură și suport pentru mișcare redusă. Paginile de prezentare nu depind de scene 3D. Imaginea de birou este o ilustrație generată pornind de la referințele aparatelor, nu documentarea unei instalări la client. Fotografiile de evenimente sunt cele existente în proiect.

Scroll-ul cu rotița folosește Lenis, cu același ritm ca în FASON și sincronizare cu GSAP. Touch-ul și tastatura rămân native; meniul, coșul și formularele opresc derularea paginii cât sunt deschise. Preferința pentru mișcare redusă păstrează scroll-ul nativ.

Solicitările de ofertă sunt trimise prin e-mail folosind Resend. Telefonul și WhatsApp sunt disponibile ca alternative de contact.

## Pornire locală

Din folderul proiectului:

```powershell
npm.cmd ci
npm.cmd run dev
```

Deschide `http://localhost:3000`. Instalarea cu `npm.cmd ci` este necesară la prima pornire sau când se schimbă `package-lock.json`. În terminalele care permit scripturile npm poți folosi și `npm` în loc de `npm.cmd`.

Pentru magazin, administrare și serviciile externe, copiază `.env.example` în `.env.local` și completează credențialele serviciilor folosite. Site-ul de prezentare poate porni și fără ele.

## Magazinul

Catalogul de cafea include pagini individuale de produs, fotografii, gramaje, note de degustare și informații despre origine. Produsele pot fi căutate, filtrate și sortate. Pentru cafeaua măcinată, clientul poate alege măcinarea pentru ibric, moka sau espresso.

Coșul păstrează selecția între pagini și permite modificarea cantităților și eliminarea produselor. Magazinul are două fluxuri de comandă:

- **Produse disponibile:** card prin Stripe Checkout sau ramburs. Cardul rezervă stocul până la plată; rambursul scade stocul la înregistrarea comenzii.
- **Comenzi la cerere:** solicitare înregistrată în dashboard, confirmare telefonică, apoi link pentru card sau confirmarea totalului ramburs. Coșurile care includ produse fără stoc sau fără preț confirmat urmează integral acest flux.

Finalizarea comenzii permite facturare pe persoană fizică sau juridică, cu sediul firmei separat de adresa de livrare. Datele de facturare sunt disponibile în dashboard.

Plățile sunt procesate idempotent, iar rezervările și actualizările stocului sunt protejate prin tranzacții și constrângeri în PostgreSQL. Comenzile la cerere nu afectează stocul fizic și pot fi trecute în pregătire după confirmarea plății.

## Administrare

Dashboardul de la `/admin` permite gestionarea produselor, prețurilor, stocurilor și imaginilor, precum și consultarea comenzilor și actualizarea statusului lor de pregătire și livrare.

Pentru comenzile la cerere, administratorul confirmă prețurile și transportul, generează linkul Stripe și îl transmite clientului. Datele clientului și adresa de livrare sunt preluate din sesiunea de plată atunci când sunt furnizate de Stripe.

## Tehnologii

| Componentă | Tehnologie |
| --- | --- |
| Aplicație | Next.js, React, TypeScript |
| Administrare | Payload CMS |
| Bază de date | PostgreSQL, găzduit în Neon |
| Imagini | Cloudflare R2 |
| Plăți | Stripe Checkout |
| E-mail | Resend |
| Animații | Three.js, GSAP, SVG și CSS |
| Găzduire | Vercel |

Aplicația, baza de date și stocarea imaginilor sunt separate, astfel încât infrastructura poate fi mutată fără refacerea magazinului. Modificările schemei bazei de date sunt gestionate prin migrări versionate.

## Documentație

- [Ghid de predare pentru developeri](docs/developer-handover.md) — arhitectură, cod, fluxuri de plată, migrări și mentenanță.
- [Ghid de administrare](docs/commerce-setup.md) — utilizarea magazinului și gestionarea comenzilor.
- [Prezentarea vizuală](docs/presentation-design.md) — compoziții, inventarul imaginilor, contractele păstrate și verificările redesignului.
- [Deschiderea animată](docs/opening-motion.md) — secvența hero–oferte, fallback, focus și verificările de mișcare.
