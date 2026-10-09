import type {Metadata} from 'next'
import Link from 'next/link'
import {CollectionFooter, CollectionHeader} from '@/components/collection-chrome'
import {getRoutes} from '@/lib/content'
import {contentSource} from '@/sanity/env'

export const revalidate = 60
export const metadata: Metadata = {title: 'Service pages (V2 template)', robots: {index: false, follow: false}}

export default async function HomePage() {
  const routes = await getRoutes()
  return (
    <div className="collection-page">
      <CollectionHeader />
      <main className="v2-index">
        <div className="collection-wrap">
          <h1>Service pages on the V2 template</h1>
          <p className="v2-index-source">Content source: {contentSource === 'sanity' ? 'Sanity' : 'local file (data/v2-documents.json)'} · {routes.length} page{routes.length === 1 ? '' : 's'}</p>
          {routes.length === 0 ? <p>No pages yet. Fill the workbook, then run <code>pnpm content:build</code>.</p> : (
            <ul className="v2-index-list">{routes.map((route) => <li key={route.slug}><Link href={`/${route.slug}`}><b>{route.name}</b><span>/services/{route.slug}</span></Link></li>)}</ul>
          )}
        </div>
      </main>
      <CollectionFooter />
    </div>
  )
}
