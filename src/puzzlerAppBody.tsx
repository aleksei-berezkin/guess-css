import { ScrollToTop } from './scrollToTop';

export function PuzzlerAppBody(p: {children: React.ReactNode}) {
    return <>
        <ScrollToTop />
        {
            p.children
        }
    </>
}
