import { router } from '@inertiajs/react';
import type { SortingState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Dir = 'asc' | 'desc';
type Initial = { q?: string; per_page?: number; sort?: string; dir?: Dir };

export function useIndexList(routeName: string, routeParams?: string, initial?: Initial, getExtra?: () => Record<string, unknown> | undefined) {
    const [q, setQ] = useState(initial?.q ?? '');
    const [perPage, setPerPage] = useState<number>(Number(initial?.per_page ?? 10));
    const [sorting, setSorting] = useState<SortingState>(
        initial?.sort ? [{ id: String(initial.sort), desc: (initial.dir ?? 'asc') === 'desc' }] : [],
    );
    const [loading, setLoading] = useState(false);

    const getExtraRef = useRef(getExtra);

    useEffect(() => {
        getExtraRef.current = getExtra;
    }, [getExtra]);

    const baseParams = useMemo(() => {
        const sort = sorting[0]?.id;
        const dir: Dir = sorting[0]?.desc ? 'desc' : 'asc';
        return { ...(sort ? { sort, dir } : {}) };
    }, [sorting]);

    const submit = useCallback(
        (page = 1, extra?: Record<string, unknown>) => {
            const url = routeParams ? `/${routeName}/${routeParams}` : `/${routeName}`;
            
            router.get(
                url,
                {
                    q: q,
                    per_page: perPage,
                    page,
                    ...(getExtraRef.current ? getExtraRef.current() : {}),
                    ...baseParams,
                    ...(extra ?? {}),
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onStart: () => setLoading(true),
                    onFinish: () => setLoading(false),
                },
            );
        },
        [q, perPage, baseParams, routeName, routeParams],
    );

    // Disable auto-submit for search to prevent unwanted redirects

    const onSortingChange = (next: SortingState) => {
        setSorting(next);
        const sort = next[0]?.id;
        const dir: Dir = next[0]?.desc ? 'desc' : 'asc';
        const url = routeParams ? `/${routeName}/${routeParams}` : `/${routeName}`;
        
        router.get(
            url,
            {
                q: q,
                per_page: perPage,
                page: 1,
                ...(getExtra ? getExtra() : {}),
                ...(sort ? { sort, dir } : {}),
            },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            },
        );
    };

    return { q, setQ, perPage, setPerPage, sorting, submit, onSortingChange, loading };
}