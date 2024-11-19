/*
 * Copied from https://github.com/phaux/react-scroll-snapper/blob/main/src/ScrollSnapper.tsx
 * The lib doesn't ship CJS so cannot do SSR
 */

import { Box } from '@mui/material'
import { useCallback, useEffect, useRef } from 'react'

export interface ScrollSnapperProps {
  index: number
  onIndexChange: (index: number, target: HTMLDivElement) => void
}

export function ScrollSnapper(props: ScrollSnapperProps & React.HTMLProps<HTMLDivElement>) {
  const { className = "", index, onIndexChange, onScroll, ...rootProps } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<number>()
  const lastChildrenCount = useRef(0)

  // on every rerender
  useEffect(() => {
    if (!containerRef.current) return

    // set aria-hidden and inert on all children that aren't current page
    const currentChild = containerRef.current.children[index]
    for (const child of containerRef.current.children) {
      if (!(child instanceof HTMLElement)) continue
      const isCurrent = child === currentChild
      child.ariaHidden = !isCurrent ? "true" : null
      child.inert = !isCurrent
    }

    // only if number of children changed
    const childrenCount = containerRef.current.children.length
    if (childrenCount !== lastChildrenCount.current) {
      lastChildrenCount.current = childrenCount

      // scroll container to the current page instantly
      const pageWidth = containerRef.current.scrollWidth / containerRef.current.children.length
      containerRef.current.scrollTo({
        behavior: 'instant',
        left: index * pageWidth,
        top: 0,
      })
    }
  })

  // on page index change
  useEffect(() => {
    if (!containerRef.current) return

    // scroll container to the current page smoothly
    const pageWidth = containerRef.current.scrollWidth / containerRef.current.children.length
    containerRef.current.scrollTo({
      behavior: "smooth",
      left: index * pageWidth,
      top: 0,
    })
  }, [index])

  // on user scroll
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      onScroll?.(event)
      const { currentTarget } = event
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
      scrollTimeout.current = window.setTimeout(() => {
        // update current page index
        const pageWidth = currentTarget.scrollWidth / currentTarget.children.length
        const currentIndex = Math.round(currentTarget.scrollLeft / pageWidth)
        onIndexChange(currentIndex, currentTarget)
      }, 100)
    },
    [onIndexChange, onScroll],
  )

  return (
    <Box
      {...rootProps}
      ref={containerRef}
      className={`ScrollSnapper ${className}`}
      onScroll={handleScroll}
      sx={{
        display: 'flex',
        scrollSnapType: 'x mandatory',
        overflowX: 'scroll',
        scrollbarWidth: 'none',
        scrollBehavior: 'smooth',
        '& > *': {
            width: '100%',
            flexShrink: 0,
            scrollSnapAlign: 'center',
            scrollSnapStop: 'always',
        },
        '&::-webkit-scrollbar': {
            width: 0,
            height: 0,
        }
      }}
    />
  )
}
