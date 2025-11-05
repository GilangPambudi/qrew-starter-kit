'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import * as React from 'react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: () => void;
    sorting: SortingState;
    onSortingChange: (updater: SortingState) => void;
    page: number; // 1-based
    pageCount: number;
    onPrev: () => void;
    onNext: () => void;
    onPageChange: (page: number) => void; // ⬅️ baru
    canPrev: boolean;
    canNext: boolean;
    perPage?: number;
    onPerPageChange?: (n: number) => void;
    rightActions?: React.ReactNode;
    loading?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchValue,
    onSearchChange,
    onSearchSubmit,
    sorting,
    onSortingChange,
    page,
    pageCount,
    onPrev,
    onNext,
    onPageChange,
    canPrev,
    canNext,
    perPage,
    onPerPageChange,
    rightActions,
    loading = false,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualSorting: true,
        enableRowSelection: true,
        state: { sorting, rowSelection },
        onRowSelectionChange: setRowSelection,
        onSortingChange: (updater) => {
            if (typeof updater === 'function') onSortingChange(updater(sorting));
            else onSortingChange(updater);
        },
    });

    const selectedCount = table.getFilteredSelectedRowModel().rows.length;
    const visibleCount = table.getFilteredRowModel().rows.length;

    return (
        <div aria-busy={loading} className="relative">
            {/* Toolbar atas */}
            <div className="flex items-center justify-between gap-2 py-4">
                <Input
                    placeholder="Cari…"
                    className="max-w-sm"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
                />
                <div className="flex items-center gap-2">{rightActions}</div>
            </div>

            {/* Table */}
            <div className="relative overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {data?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                        <svg className="size-6 animate-spin text-muted-foreground" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Footer ala shadcn */}
            <div className="flex items-center justify-between px-0 py-4">
                <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                    {selectedCount} of {visibleCount} row(s) selected.
                </div>

                <div className="flex w-full items-center gap-8 lg:w-fit">
                    <div className="hidden items-center gap-2 lg:flex">
                        <span className="text-sm font-medium">Rows per page</span>
                        {typeof perPage === 'number' && onPerPageChange ? (
                            <Select value={`${perPage}`} onValueChange={(v) => onPerPageChange(Number(v))}>
                                <SelectTrigger className="w-20">
                                    <SelectValue placeholder={perPage} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 50, 100].map((n) => (
                                        <SelectItem key={n} value={`${n}`}>
                                            {n}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                        )}
                    </div>

                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Page {page} of {Math.max(pageCount, 1)}
                    </div>

                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => onPageChange(1)}
                            disabled={!canPrev || loading}
                            aria-label="First page"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="size-8" size="icon" onClick={onPrev} disabled={!canPrev || loading} aria-label="Previous page">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="size-8" size="icon" onClick={onNext} disabled={!canNext || loading} aria-label="Next page">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() => onPageChange(pageCount)}
                            disabled={!canNext || loading}
                            aria-label="Last page"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
