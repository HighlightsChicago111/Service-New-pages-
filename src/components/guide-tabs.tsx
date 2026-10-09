'use client'

import {useEffect, useRef, useState} from 'react'
import {questionHeading} from '@/lib/headings'

export type GuideItem = {title: string; heading?: string; blocks: Array<{text: string; sub?: boolean}>}

export function GuideTabs({guides}: {guides: GuideItem[]}) {
  const [active, setActive] = useState(0)
  const guidePanelsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)')
    const keepDesktopGuideOpen = () => {
      if (desktop.matches) setActive((current) => current < 0 ? 0 : current)
    }

    keepDesktopGuideOpen()
    desktop.addEventListener('change', keepDesktopGuideOpen)
    return () => desktop.removeEventListener('change', keepDesktopGuideOpen)
  }, [])

  function selectGuide(index: number) {
    setActive(index)
    guidePanelsRef.current?.scrollTo({top: 0})
  }

  return (
    <div className="guide-tabs">
      <div className="guide-nav" role="tablist" aria-label="Guides">
        {guides.map((guide, index) => <button key={guide.title} type="button" role="tab" id={`guide-tab-${index}`} aria-controls={`guide-panel-${index}`} aria-selected={active === index} onClick={() => selectGuide(index)}>{questionHeading(guide.title)}</button>)}
      </div>
      <div className="guide-panels" ref={guidePanelsRef} tabIndex={0} aria-label="Electrical library guide content">
        {guides.map((guide, index) => (
          <div className="guide-panel" id={`guide-panel-${index}`} role="tabpanel" aria-labelledby={`guide-tab-${index}`} hidden={active !== index} key={guide.title}>
            <button className="guide-mobile-head" type="button" onClick={() => selectGuide(active === index ? -1 : index)}>{questionHeading(guide.title)}</button>
            <div className="guide-body">
              {guide.heading && <h3>{questionHeading(guide.heading)}</h3>}
              {guide.blocks.map((block, blockIndex) => block.sub ? <p key={blockIndex}><b>{block.text}</b></p> : <p key={blockIndex}>{block.text}</p>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
