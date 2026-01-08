// app/search/page.tsx (це Server Component)
import { Suspense } from 'react';
import SearchPageClient from './SearchPageClient';

export const dynamic = 'force-dynamic';

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Завантаження пошуку...</div>}>
            <SearchPageClient />
        </Suspense>
    );
}
