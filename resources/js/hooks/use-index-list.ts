import { router } from '@inertiajs/react';
import { SortingState } from '@tanstack/react-table';
import { useCallback, useState } from 'react';

interface UseIndexListOptions {
    initialSort?: string;
    initialDir?: 'asc' | 'desc';
    initialPerPage?: number;
    initialQ?: string;
}

export function useIndexList(
    routeName: string,
    routeParams?: any,
    initialFilters?: any,
    getExtraFilters?: () => Record<string, any>
) {
    const [q, setQ] = useState(initialFilters?.q || '');
    const [perPage, setPerPage] = useState(initialFilters?.per_page || 10);
    const [loading, setLoading] = useState(false);
    
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: initialFilters?.sort || 'created_at',
            desc: initialFilters?.dir === 'desc'
        }
    ]);

    const submit = useCallback((page: number = 1, extraFilters: Record<string, any> = {}) => {
        setLoading(true);
        
        const sortColumn = sorting[0]?.id || 'created_at';
        const sortDirection = sorting[0]?.desc ? 'desc' : 'asc';
        
        const filters: Record<string, any> = {
            q: q || undefined,
            per_page: perPage,
            sort: sortColumn,
            dir: sortDirection,
            page,
            ...extraFilters,
            ...(getExtraFilters ? getExtraFilters() : {}),
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined || filters[key] === '') {
                delete filters[key];
            }
        });

        let url: string;
        if (routeParams) {
            // For nested routes like guests.show
            if (typeof routeParams === 'object') {
                url = `/${routeName.replace('.', '/')}/${Object.values(routeParams).join('/')}`;
            } else {
                url = `/${routeName.replace('.', '/')}/${routeParams}`;
            }
        } else {
            url = `/${routeName.replace('.', '/')}`;
        }

        router.get(url, filters, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    }, [q, perPage, sorting, routeName, routeParams, getExtraFilters]);

    const onSortingChange = useCallback((newSorting: SortingState) => {
        setSorting(newSorting);
        
        // Auto submit when sorting changes
        setTimeout(() => {
            const sortColumn = newSorting[0]?.id || 'created_at';
            const sortDirection = newSorting[0]?.desc ? 'desc' : 'asc';
            
            submit(1, { sort: sortColumn, dir: sortDirection });
        }, 0);
    }, [submit]);

    return {
        q,
        setQ,
        perPage,
        setPerPage,
        sorting,
        submit,
        onSortingChange,
        loading,
    };
}