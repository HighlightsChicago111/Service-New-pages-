/* eslint-disable @next/next/no-img-element -- Sanity permits arbitrary external image sources; native img keeps alt text crawlable. */
import type {CSSProperties, ReactNode} from 'react'
import Link from 'next/link'
import type {Faq, Guide, Img, ProcessOwner, V2Area, V2Page, V2PageData, V2Settings} from '@/types/v2'
import {GuideTabs, type GuideItem} from './guide-tabs'
import {CenteredAreaRail} from './centered-area-rail'
import {LeadForm} from './lead-form'
import {CollectionFooter, CollectionHeader} from './collection-chrome'
import {questionHeading} from '@/lib/headings'
import {WorkingPhotoGrid} from './working-photo-grid'
import {GalleryPhoto} from './gallery-photo'
import {PUBLIC_SITE_ORIGIN, SERVICES_PATH, servicePageUrl} from '@/lib/service-urls'

const BRAND_STYLE = {
  '--brand': '#151f2a',
  '--brand-dk': '#0f171f',
  '--brand-lt': '#f4f6f7',
  '--brand-2': '#82aa24',
  '--accent': '#9ec837',
  '--accent-dk': '#82aa24',
  '--footer': '#151f2a',
} as CSSProperties

const LIGHT_MARK_ON_DARK_TILE = new Set(['eaton', 'generac', 'siemens', 'sma'])
const CONFIRM_PATTERN = /(\[CONFIRM:[^\]]*\])/g
const OWNER_LABELS: Record<ProcessOwner, {label: string; tone: string}> = {
  highlights: {label: 'Highlights', tone: 'us'},
  city: {label: 'City of Chicago', tone: 'city'},
  comed: {label: 'ComEd', tone: 'comed'},
  customer: {label: 'You', tone: 'cust'},
  manufacturer: {label: 'Manufacturer', tone: 'mfr'},
}

export const hasConfirmPlaceholder = (value?: string) => Boolean(value && /\[CONFIRM:[^\]]*\]/.test(value))

/** Text that may hold "[CONFIRM: ...]" placeholders; they render as yellow review chips. */
function T({children}: {children?: string}) {
  if (!children) return null
  if (!hasConfirmPlaceholder(children)) return <>{children}</>
  return <>{children.split(CONFIRM_PATTERN).map((part, index) => part.startsWith('[CONFIRM:') ? <span className="nx-ph" key={index}>{part}</span> : part)}</>
}

function AnchorLink({label, anchor}: {label?: string; anchor?: string}) {
  if (!label || !anchor) return null
  return <a href={`#${anchor}`}>{label}</a>
}

function imageUrl(image?: Img): string | undefined {
  return image?.resolvedUrl || image?.externalUrl
}

function imageAlt(image: Img | undefined, fallback: string): string {
  return image?.alt?.trim() || fallback
}

function brandSlug(brand: string): string {
  return brand.normalize('NFKD').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function BrandMark({brand}: {brand: string}) {
  const slug = brandSlug(brand)
  const filter = LIGHT_MARK_ON_DARK_TILE.has(slug) ? 'brand-light-on-dark-filter' : 'brand-dark-on-light-filter'
  return <span className={`brand-mark brand-mark--${slug}`} role="img" aria-label={`${brand} logo`}><svg viewBox="0 0 64 40" aria-hidden="true"><image href={`/services/images/brands/${slug}.png`} x="0" y="0" width="64" height="40" preserveAspectRatio="xMidYMid meet" filter={`url(#${filter})`} /></svg></span>
}

function BrandLogoFilter() {
  return <svg className="brand-filter-defs" aria-hidden="true"><defs><filter id="brand-dark-on-light-filter" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .88  0 0 0 0 .9  0 0 0 0 .92  -.333 -.333 -.333 1 0" /><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 1 1" /></feComponentTransfer></filter><filter id="brand-light-on-dark-filter" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .88  0 0 0 0 .9  0 0 0 0 .92  .333 .333 .333 0 0" /><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 1 1" /></feComponentTransfer></filter></defs></svg>
}

function GoogleMark({large = false}: {large?: boolean}) {
  return (
    <span className={`mark${large ? ' mark-lg' : ''}`} title="Google">
      <svg viewBox="0 0 48 48" aria-label="Google" role="img">
        <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.2z" />
        <path fill="#34A853" d="M24 46c6 0 11-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8 41.3 15.4 46 24 46z" />
        <path fill="#FBBC04" d="M11.8 28.3c-.4-1.3-.7-2.7-.7-4.3s.3-3 .7-4.3v-5.7H4.5A22 22 0 0 0 2 24c0 3.6.9 6.9 2.5 9.9l7.3-5.6z" />
        <path fill="#EA4335" d="M24 10.3c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C35 3.8 30 1.8 24 1.8 15.4 1.8 8 6.5 4.5 13.9l7.3 5.7c1.7-5.2 6.5-9.3 12.2-9.3z" />
      </svg>
    </span>
  )
}

function Rating({rating, count, compact = false, largeMark = false}: {rating: number; count?: number; compact?: boolean; largeMark?: boolean}) {
  const style = {'--pct': `${Math.max(0, Math.min(100, rating * 20))}%`} as CSSProperties
  return (
    <span className={`rating src-google${compact ? ' rating-sm' : ''}`}>
      <GoogleMark large={largeMark} />
      <span className="num">{rating}</span><span className="out">/5</span>
      <span className="stars" style={style} aria-hidden="true">★★★★★</span>
      {count !== undefined && <span className="cnt">{count} reviews</span>}
    </span>
  )
}

function EquipmentIcon({index}: {index: number}) {
  const icons: ReactNode[] = [
    <><rect x="12" y="8" width="24" height="32" rx="3" /><path className="ln" d="M18 16h12M18 22h12M18 28h12" /></>,
    <><rect x="12" y="8" width="24" height="32" rx="3" /><path className="ln" d="M18 18h12M18 26h12M24 8v32" /></>,
    <><rect x="12" y="8" width="24" height="32" rx="3" /><circle className="ln" cx="24" cy="18" r="3" /><path className="ln" d="M18 28h12" /></>,
    <><rect x="12" y="8" width="24" height="32" rx="3" /><path className="ln" d="M26 14l-6 10h8l-6 10" /></>,
    <><rect x="8" y="6" width="32" height="36" rx="3" /><path className="ln" d="M16 14h16M16 22h16M16 30h16M24 6v4" /></>,
    <><rect x="10" y="8" width="28" height="32" rx="3" /><circle className="ln" cx="19" cy="18" r="3" /><circle className="ln" cx="29" cy="18" r="3" /><circle className="ln" cx="19" cy="29" r="3" /><circle className="ln" cx="29" cy="29" r="3" /></>,
    <><rect x="12" y="8" width="24" height="32" rx="3" /><path className="ln" d="M17 15l14 18M31 15L17 33" /></>,
    <><rect x="14" y="10" width="20" height="28" rx="3" /><path className="ln" d="M19 18h10M19 25h10M24 4v6M10 24h4M34 24h4" /></>,
  ]
  return <svg viewBox="0 0 48 48" aria-hidden="true">{icons[index % icons.length]}</svg>
}

function EmptyImageIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="11" width="34" height="27" rx="3" /><circle cx="18" cy="21" r="4" /><path d="M9 34l10-8 7 6 5-4 8 6" /></svg>
}

function guideItem(guide: Guide): GuideItem {
  const blocks: GuideItem['blocks'] = []
  if (guide.intro) blocks.push({text: guide.intro})
  for (const section of guide.sections || []) {
    if (section.heading) blocks.push({text: section.heading, sub: true})
    for (const paragraph of section.body.split(/\n{2,}|\r?\n/).map((line) => line.trim()).filter(Boolean)) blocks.push({text: paragraph})
  }
  return {title: guide.title, heading: guide.heading, blocks}
}

function Table({label, columns, rows, caption}: {label: string; columns: string[]; rows: string[][]; caption?: string}) {
  return (
    <div className="table-wrap" tabIndex={0} aria-label={`${label}, scroll horizontally to view all columns`}>
      <table>
        {caption && <caption>{caption}</caption>}
        <thead><tr>{columns.map((column, index) => <th key={index}>{column}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><T>{cell}</T></td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

function JsonLd({page, area, settings, faqs}: {page: V2Page; area: V2Area; settings: V2Settings; faqs: Faq[]}) {
  const canonicalUrl = servicePageUrl(page.slug)
  // Unanswered placeholder FAQs stay out of the schema until they are confirmed.
  const answered = faqs.filter((faq) => !hasConfirmPlaceholder(faq.answer) && !hasConfirmPlaceholder(faq.question))
  const graph = [
    {
      '@type': settings.schemaBusinessType || 'Electrician',
      '@id': `${PUBLIC_SITE_ORIGIN}/#business`,
      name: settings.companyName,
      telephone: settings.phoneE164 || settings.phoneDisplay,
      url: PUBLIC_SITE_ORIGIN,
      email: settings.email,
      address: {'@type': 'PostalAddress', streetAddress: settings.address?.street, addressLocality: settings.address?.city, addressRegion: settings.address?.state, postalCode: settings.address?.zip, addressCountry: 'US'},
      geo: settings.shopLocation ? {'@type': 'GeoCoordinates', latitude: settings.shopLocation.lat, longitude: settings.shopLocation.lng} : undefined,
      aggregateRating: settings.google?.rating ? {'@type': 'AggregateRating', ratingValue: settings.google.rating, reviewCount: settings.google.reviewCount} : undefined,
    },
    {'@type': 'Service', name: `${page.hero.h1Prefix} in ${area.name}`, serviceType: page.name, provider: {'@id': `${PUBLIC_SITE_ORIGIN}/#business`}, areaServed: {'@type': 'City', name: `${area.name}, ${area.state}`}},
    {'@type': 'BreadcrumbList', itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Home', item: PUBLIC_SITE_ORIGIN},
      {'@type': 'ListItem', position: 2, name: 'Services', item: `${PUBLIC_SITE_ORIGIN}${SERVICES_PATH}`},
      {'@type': 'ListItem', position: 3, name: `${page.name} in ${area.name}`, item: canonicalUrl},
    ]},
    ...(answered.length ? [{'@type': 'FAQPage', mainEntity: answered.map((faq) => ({'@type': 'Question', name: faq.question, acceptedAnswer: {'@type': 'Answer', text: faq.answer}}))}] : []),
  ]
  const json = JSON.stringify({'@context': 'https://schema.org', '@graph': graph}).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: json}} />
}

export function ServiceLandingPageV2({data}: {data: V2PageData}) {
  const {page, area, settings} = data
  if (!page || !area || !settings) return null
  const rating = settings.google?.rating
  const reviewCount = settings.google?.reviewCount
  const {hero, form, jobPaths, equipment, assessment, diagnose, brands, why, process, otherServices, pricing, included, cta} = page
  const equipmentItems = equipment?.items || []
  const brandItems = brands?.items || []
  const trustMetrics = settings.trustMetrics || []
  const faqs = [...(page.faqs || []), ...(area.localFaqs || [])]
  const guides = [...(area.sharedGuides || []), ...(page.serviceGuide?.title ? [page.serviceGuide] : [])].map(guideItem)
  const relatedServices = (otherServices?.items || []).slice(0, 4)
  const coverageMap = area.mapQuery ? <div className="area-map"><iframe title={`${area.name} service area map`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(area.mapQuery)}&output=embed`} /></div> : null
  const coverageAreas = <CenteredAreaRail label={`${area.name} service locations`}>{area.subAreas?.map((subArea) => {
    const src = imageUrl(subArea.photo)
    const alt = imageAlt(subArea.photo, `${subArea.name} neighborhood landmark in ${area.name}`)
    return <a className="area-chip" role="listitem" href="#quote" key={subArea._key || subArea.name}><span className="area-img">{src ? <img src={src} alt={alt} title={subArea.photo?.caption || subArea.note || subArea.name} loading="lazy" decoding="async" /> : <EmptyImageIcon />}</span><b>{subArea.name}</b><span>{subArea.note}</span>{subArea.photo?.credit && <small className="area-credit">Photo: {subArea.photo.credit}</small>}</a>
  })}</CenteredAreaRail>

  return (
    <div className="site-chrome">
      <CollectionHeader />
      <main className="service-landing" style={BRAND_STYLE}>
        <nav className="crumbs wrap" aria-label="Breadcrumb"><ol><li><a href={PUBLIC_SITE_ORIGIN}>Home</a></li><li><Link href="/">Services</Link></li><li aria-current="page">{page.name} in {area.name}</li></ol></nav>

        <header className="hero"><div className="wrap hero-grid"><div>
          <p className="eyebrow">{area.heroEyebrow}</p><h1>{questionHeading(`${hero.h1Prefix} in ${area.name}`)}</h1><p className="lede"><T>{hero.lede}</T></p>
          <div className="trustbar">{settings.trustLines?.map((line) => <span className="trust-item" key={line}>◆ {line}</span>)}{rating && <Rating rating={rating} count={reviewCount} />}</div>
          <div className="btn-row"><a className="btn btn-primary" href={`tel:${settings.phoneE164}`}>Call {settings.phoneDisplay}</a><a className="btn btn-secondary" href="#quote">{hero.secondaryCta || 'Request service'}</a></div>
          <div className="cs-gallery"><div className="cs-gallery-rail">{page.gallery?.filter((photo) => Boolean(imageUrl(photo))).slice(0, 3).map((photo, index) => {
            const src = imageUrl(photo) as string
            const alt = imageAlt(photo, `${page.name} project by Highlights Chicago in ${area.name}`)
            return <GalleryPhoto key={photo._key || index} src={src} alt={alt} title={photo.caption || alt} eager={index === 0} />
          })}</div><div className="cs-gallery-head"><p className="eyebrow">{area.galleryLabel}</p><a href="#working-in-area">See more →</a></div></div>
        </div><LeadForm service={page.name} area={area.name} issueQuestion={form?.issueQuestion} issueOptions={form?.issueOptions} extraFields={form?.extraFields} buildingTypes={area.buildingTypes} addressPlaceholder={area.addressPlaceholder} subtitle={settings.formSubtitle} note={settings.formNote} /></div></header>

        {Boolean(jobPaths?.items?.length) && <section className="section-tint nx-center" id="your-job"><div className="wrap">
          <h2>{jobPaths?.heading}</h2>{jobPaths?.lede && <p className="lede narrow"><T>{jobPaths.lede}</T></p>}
          <div className="nx-paths">{jobPaths?.items?.map((path) => <article className="nx-path" key={path._key || path.title}>
            <h3>{path.title}</h3>{path.whoFor && <p><T>{path.whoFor}</T></p>}
            <dl>{path.scopeDrivers && <><dt>Scope is decided by</dt><dd><T>{path.scopeDrivers}</T></dd></>}{path.firstStep && <><dt>First step</dt><dd><T>{path.firstStep}</T></dd></>}</dl>
            <AnchorLink label={path.linkLabel} anchor={path.linkAnchor} />
          </article>)}</div>
          {jobPaths?.note && <p className="small muted section-note"><T>{jobPaths.note}</T></p>}
        </div></section>}

        <section className="wrap" id="equipment"><h2>{questionHeading(equipment?.heading)}</h2>{equipment?.lede && <p className="lede narrow"><T>{equipment.lede}</T></p>}
          {equipmentItems.length > 0 && <div className="equip-strip" aria-label={equipment?.heading}><div className="equip-track">{[...equipmentItems, ...equipmentItems].map((item, index) => <div className="equip" key={`${item._key || item.name}-${index}`} aria-hidden={index >= equipmentItems.length || undefined}><EquipmentIcon index={index} /><b>{item.name}</b><span>{item.description}</span></div>)}</div></div>}
          {equipment?.footnote && <p className="small muted section-note"><T>{equipment.footnote}</T> <AnchorLink label={equipment.footnoteLinkLabel} anchor={equipment.footnoteLinkAnchor} /></p>}
          {Boolean(equipment?.comparison?.rows?.length) && <div className="nx-block" id="equipment-choices">
            <h3>{equipment?.comparison?.heading}</h3>{equipment?.comparison?.intro && <p className="nx-sub"><T>{equipment.comparison.intro}</T></p>}
            <Table label={equipment?.comparison?.heading || 'Comparison'} columns={['', ...(equipment?.comparison?.columns || [])]} rows={(equipment?.comparison?.rows || []).map((row) => [row.label, ...(row.values || [])])} />
          </div>}
          {Boolean(equipment?.options?.items?.length) && <div className="nx-block" id="equipment-options">
            <h3>{equipment?.options?.heading}</h3>
            {(equipment?.options?.calloutLead || equipment?.options?.calloutBody) && <p className="nx-callout">{equipment?.options?.calloutLead && <strong>{equipment.options.calloutLead}</strong>} <T>{equipment?.options?.calloutBody}</T></p>}
            <div className="nx-options">{equipment?.options?.items?.map((option) => <div className="nx-option" key={option._key || option.title}><h4>{option.title}</h4><p><T>{option.body}</T></p></div>)}</div>
            {equipment?.options?.note && <p className="small muted"><T>{equipment.options.note}</T></p>}
          </div>}
        </section>

        {Boolean(assessment?.checks?.length) && <section className="section-tint nx-center" id="site-assessment"><div className="wrap">
          <h2>{assessment?.heading}</h2>{assessment?.lede && <p className="lede narrow"><T>{assessment.lede}</T></p>}
          <ul className="nx-checks">{assessment?.checks?.map((check) => <li key={check._key || check.title}><b>{check.title}</b><span><T>{check.body}</T></span></li>)}</ul>
          {Boolean(assessment?.routes?.length) && <div className="nx-block" id="assessment-routes">
            <h3>{assessment?.routesHeading}</h3>
            <ol className="nx-routes">{assessment?.routes?.map((route) => <li key={route._key || route.title}><b>{route.title}</b><span><T>{route.body}</T></span></li>)}</ol>
            {assessment?.routesNote && <p className="small muted"><T>{assessment.routesNote}</T></p>}
          </div>}
        </div></section>}

        {Boolean(diagnose?.rows?.length) && <section className="wrap nx-center" id="diagnose">
          <h2>{diagnose?.heading}</h2>{diagnose?.lede && <p className="lede narrow"><T>{diagnose.lede}</T></p>}
          <Table label={diagnose?.heading || 'Symptoms and checks'} columns={diagnose?.columns?.length === 3 ? diagnose.columns : ["What you're seeing", 'Common causes we check', 'Where we start']} rows={(diagnose?.rows || []).map((row) => [row.symptom, row.causes || '', row.firstCheck || ''])} />
          {(diagnose?.repairTitle || diagnose?.orphanTitle) && <div className="nx-two">
            {diagnose?.repairTitle && <div className="nx-block"><h3>{diagnose.repairTitle}</h3><p><T>{diagnose.repairBody}</T></p></div>}
            {diagnose?.orphanTitle && <div className="nx-block"><h3>{diagnose.orphanTitle}</h3><p><T>{diagnose.orphanBody}</T></p></div>}
          </div>}
        </section>}

        {brandItems.length > 0 && <section className="brands-section" id="brands"><BrandLogoFilter /><div className="wrap"><h2>{questionHeading(`${brands?.heading} in ${area.name}`)}</h2>{brands?.lede && <p className="lede narrow">{brands.lede}</p>}<div className="brand-strip" aria-label={`${brands?.heading} in ${area.name}`}><div className="brand-track">{[0, 1].map((copy) => <div className="brand-sequence" aria-hidden={copy === 1 || undefined} key={copy}>{brandItems.map((brand) => <div className="brand-tile" key={`${copy}-${brand}`}><BrandMark brand={brand} /><strong>{brand}</strong></div>)}</div>)}</div></div>{brands?.note && <p className="small section-note">{brands.note}</p>}</div></section>}

        <section className="wrap" id="trust"><h2>{questionHeading(settings.trustHeading)}</h2><p className="lede narrow">{settings.trustLede}</p><div className="trust-strip">{trustMetrics.map((metric) => <div className="trust-cell" key={metric._key || metric.label}><b>{metric.value}</b><span>{metric.label}</span></div>)}{rating && <div className="trust-cell google-proof-cell"><b><Rating rating={rating} largeMark /></b><span>{reviewCount} Google reviews</span></div>}</div><div className="grid grid-3 trust-cards">{settings.trustCards?.map((item) => <article className="card" key={item._key || item.title}><h3>{questionHeading(item.title)}</h3><p className="small">{item.body}</p></article>)}</div></section>

        {Boolean(page.reviews?.length) && <section className="section-tint" id="reviews"><div className="wrap"><h2>{questionHeading(settings.reviewsHeading)}</h2><div className="grid grid-2 reviews-grid reviews-grid-equal">{page.reviews?.map((review, index) => <a className="rev-card" href={review.sourceUrl} target="_blank" rel="noreferrer" key={review._key || index}><blockquote>{review.quote}</blockquote>{rating && <div className="rev-rating"><Rating rating={rating} compact /></div>}<footer className="rev-meta"><span><strong>{review.author}</strong>{(review.location || review.date) && <> · {review.location || review.date}</>}</span><span className="rev-src">View on Google →</span></footer></a>)}</div>{settings.google?.reviewsUrl && <div className="rev-cta"><a className="rev-cta-btn" href={settings.google.reviewsUrl}>Read all {reviewCount ? `${reviewCount} ` : ''}reviews →</a></div>}{settings.reviewsDisclaimer && <p className="small muted review-note">{settings.reviewsDisclaimer}</p>}</div></section>}

        {Boolean(why?.items?.length) && <section className="wrap" id="why-us"><h2>{questionHeading(why?.heading)}</h2>{why?.lede && <p className="lede narrow">{why.lede}</p>}<div className="why-grid">{why?.items?.map((item) => <article className="why-item" key={item._key || item.title}><h3 className="why-title">{questionHeading(item.title)}</h3><p className="why-body"><T>{item.body}</T> <AnchorLink label={item.linkLabel} anchor={item.linkAnchor} /></p></article>)}</div></section>}

        <section className="section-tint" id="working-in-area"><div className="wrap"><h2>{questionHeading(`Our Works in ${area.name}`)}</h2><p className="lede narrow">{area.workingLede}</p><WorkingPhotoGrid photos={page.workingPhotos} serviceName={page.name} areaName={area.name} /></div></section>

        {Boolean(process?.steps?.length) && <section className="wrap nx-center" id="process">
          <h2>{process?.heading}</h2>{process?.lede && <p className="lede narrow"><T>{process.lede}</T></p>}
          <ol className="nx-steps">{process?.steps?.map((step) => <li key={step._key || step.title}>{step.owners?.map((owner) => OWNER_LABELS[owner] && <span className={`nx-who ${OWNER_LABELS[owner].tone}`} key={owner}>{OWNER_LABELS[owner].label}</span>)}<h3>{step.title}</h3><p><T>{step.body}</T></p></li>)}</ol>
        </section>}

        <section className="wrap" id="areas"><h2 className="single-line-mobile">{questionHeading(area.areasHeading)}</h2><p className="lede narrow">{area.areasLede}</p><div className="coverage-stack">{coverageMap}{coverageAreas}</div>{area.areasNote && <p className="small muted coverage-note">{area.areasNote}</p>}{page.areasCallout && <p className="nx-callout"><T>{page.areasCallout}</T></p>}</section>

        {(otherServices?.featured?.title || relatedServices.length > 0) && <section className="wrap" id="other-services"><h2>{questionHeading(`Our other services in ${area.name}`)}</h2><div className="svc-split">{otherServices?.featured?.title && <div className="svc-feature"><span className="svc-feature-tag">{otherServices.featured.tag}</span><h3>{questionHeading(otherServices.featured.title)}</h3><p>{otherServices.featured.description}</p></div>}<div className="svc-four">{relatedServices.map((item) => <a className="svc-mini" href={item.url} key={item._key || item.name}><b>{item.name}</b><span>{item.description}</span></a>)}</div></div></section>}

        {Boolean(pricing?.rows?.length) && <section className="section-tint" id="pricing"><div className="wrap">
          <h2>{`${(pricing?.heading || 'What This Work Costs').trim().replace(/\?$/, '')} in ${area.name}?`}</h2>{pricing?.lede && <p className="lede narrow"><T>{pricing.lede}</T></p>}
          <Table label={`${page.name} pricing table`} caption={pricing?.caption} columns={pricing?.columns?.length === 3 ? pricing.columns : ['Job', 'Reported median, or what drives the price', 'Permit needed?']} rows={(pricing?.rows || []).map((row) => [row.job, row.driver || '', row.permit || ''])} />
          {pricing?.note && <p className="small muted section-note"><T>{pricing.note}</T></p>}
          {Boolean(pricing?.drivers?.length) && <div className="nx-block"><h3>{pricing?.driversHeading}</h3><Table label={pricing?.driversHeading || 'Cost drivers'} columns={['Factor', 'Why it changes the price', 'When you find out']} rows={(pricing?.drivers || []).map((driver) => [driver.factor, driver.why || '', driver.when || ''])} /></div>}
          {pricing?.incentivesNote && <p className="nx-callout"><T>{pricing.incentivesNote}</T></p>}
        </div></section>}

        {Boolean(included?.inScope?.length || included?.handover?.length) && <section className="section-tint nx-center" id="whats-included"><div className="wrap">
          <h2>{included?.heading}</h2>{included?.lede && <p className="lede narrow"><T>{included.lede}</T></p>}
          <div className="nx-two">
            <div className="nx-block nx-in"><h3>{included?.inScopeHeading}</h3><ul>{included?.inScope?.map((item) => <li key={item}><T>{item}</T></li>)}</ul>{included?.inScopeNote && <p className="small"><T>{included.inScopeNote}</T></p>}</div>
            <div className="nx-block nx-out"><h3>{included?.separateHeading}</h3><ul>{included?.separate?.map((item) => <li key={item}><T>{item}</T></li>)}</ul>{included?.separateNote && <p className="small"><T>{included.separateNote}</T></p>}</div>
          </div>
          {(Boolean(included?.handover?.length) || Boolean(included?.warranty?.length)) && <div className="nx-two">
            {Boolean(included?.handover?.length) && <div className="nx-block"><h3>{included?.handoverHeading}</h3><ul className="nx-ticks">{included?.handover?.map((item) => <li key={item}><T>{item}</T></li>)}</ul></div>}
            {Boolean(included?.warranty?.length) && <div className="nx-block"><h3>{included?.warrantyHeading}</h3><dl className="nx-warranty">{included?.warranty?.map((row) => <div key={row._key || row.item}><dt>{row.item}</dt><dd><T>{row.party}</T></dd></div>)}</dl></div>}
          </div>}
        </div></section>}

        {faqs.length > 0 && <section className="wrap" id="faq"><h2>{questionHeading(`${page.name} in ${area.name} — FAQs`)}</h2><div className="faq">{faqs.map((faq, index) => <details key={`${index}-${faq.question}`}><summary><span>{faq.question}</span><span className="faq-chevron" aria-hidden="true" /></summary><div className="faq-body"><p><T>{faq.answer}</T></p></div></details>)}</div></section>}

        <section className="wrap closing-cta-section"><div className="cta-final"><h2 className="cta-heading">{questionHeading(`${cta?.heading || 'Planning this work'} in ${area.name}?`)}</h2>{cta?.body && <p>{cta.body}</p>}{Boolean(cta?.readyItems?.length) && <div className="nx-ready"><h3>{cta?.readyHeading || 'Have these ready when you call'}</h3><ul>{cta?.readyItems?.map((item) => <li key={item}>{item}</li>)}</ul></div>}<div className="btn-row centered"><a className="btn btn-primary" href={`tel:${settings.phoneE164}`}>Call {settings.phoneDisplay}</a><a className="btn btn-secondary" href="#quote">{hero.secondaryCta || 'Request service'}</a></div></div></section>

        {guides.length > 0 && <section className="section-tint library-section" id="guides"><div className="wrap"><h2>{questionHeading(area.libraryHeading)}</h2><p className="lede narrow">{area.libraryLede}</p><GuideTabs guides={guides} /></div></section>}

        <div className="callbar"><a className="c-call" href={`tel:${settings.phoneE164}`}>Call {settings.phoneDisplay}</a><a className="c-form" href="#quote">Book service</a></div>
        <JsonLd page={page} area={area} settings={settings} faqs={faqs} />
      </main>
      <CollectionFooter />
    </div>
  )
}
