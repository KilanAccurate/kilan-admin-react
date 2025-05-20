
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { MoreHorizontal, CheckCircle2, XCircle, Image as ImageIcon, MapPin, ChevronDown, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import React from 'react'
import type { DateRange } from 'react-day-picker'
import type { User } from './Users'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from 'src/components/ui/dropdown-menu'
import { Button } from 'src/components/ui/button'
import { ApiService } from 'src/service/ApiService'
import { ApiEndpoints } from 'src/service/Endpoints'
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover'
import { cn } from 'src/lib/utils'
import { Input } from 'src/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table'
import { Calendar } from 'src/components/ui/calendar'
import type { ApprovalData } from 'src/models/ApprovalData'

export interface GeopifyLocation {
    name?: string
    oldName?: string
    country?: string
    countryCode?: string
    state?: string
    county?: string
    city?: string
    postcode?: string
    street?: string
    housenumber?: string
    lon?: number
    lat?: number
    stateCode?: string
    distance?: number
    resultType?: string
    formatted?: string
    addressLine1?: string
    addressLine2?: string
    category?: string
    plusCode?: string
    plusCodeShort?: string
    placeId?: string
}


export interface Absensi {
    _id: string
    startDate: string
    account: User;
    endDate: string
    requestedDate: string
    isOverTime: boolean
    otType?: string
    detectedSite?: string
    remarks?: string
    startImgUrl?: string
    endImgUrl?: string
    startPosition?: GeopifyLocation
    endPosition?: GeopifyLocation
    pjoApproval?: ApprovalData
    managerApproval?: ApprovalData
    hrdApproval?: ApprovalData
}

export default function AbsensiTable() {
    const [data, setData] = useState<Absensi[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})
    const [showDialog, setShowDialog] = useState(false)
    const [date, setDate] = React.useState<DateRange | undefined>()

    const columns: ColumnDef<Absensi>[] = [
        {
            accessorKey: 'account',
            filterFn: (row, columnId, filterValue) => {
                const account = row.getValue(columnId) as { fullName: string } | undefined;
                if (!account?.fullName) return false;
                return account.fullName.toLowerCase().includes((filterValue as string).toLowerCase());
            },
            header: 'Karyawan',
            cell: ({ row }) => {
                const account = row.getValue('account') as User
                return (
                    <div>
                        {`${account.fullName} (${account.nik})`}
                    </div>
                )
            },
        },
        {
            accessorKey: 'startDate',
            header: 'Start Date',
            cell: ({ row }) => {
                const date = row.getValue('startDate')
                return (
                    <div>
                        {typeof date === 'string' || typeof date === 'number' || date instanceof Date
                            ? new Date(date).toLocaleString('id-ID')
                            : '-'}
                    </div>
                )
            },
        },
        // {
        //     accessorKey: 'requestedDate',
        //     header: 'Requested Date',
        //     cell: ({ row }) => {
        //         const date = row.getValue('requestedDate')
        //         return (
        //             <div>
        //                 {date && (typeof date === 'string' || typeof date === 'number' || date instanceof Date)
        //                     ? new Date(date).toLocaleString('id-ID')
        //                     : '-'}
        //             </div>
        //         )
        //     },
        // },
        {
            accessorKey: 'endDate',
            header: 'End Date',
            cell: ({ row }) => {
                const date = row.getValue('endDate')
                return (
                    <div>
                        {date && (typeof date === 'string' || typeof date === 'number' || date instanceof Date)
                            ? new Date(date).toLocaleString('id-ID')
                            : '-'}
                    </div>
                )
            },
        },
        {
            accessorKey: 'isOverTime',
            header: 'Overtime',
            cell: ({ row }) => (
                <div className="text-center">
                    {row.getValue('isOverTime') ? 'Yes' : 'No'}
                </div>
            ),
        },
        {
            accessorKey: 'otType',
            header: 'OT Type',
            cell: ({ row }) => <div>{row.getValue('otType') || '-'}</div>,
        },
        {
            accessorKey: 'detectedSite',
            header: 'Detected Site',
            cell: ({ row }) => <div>{row.getValue('detectedSite') || '-'}</div>,
        },
        {
            accessorKey: 'remarks',
            header: 'Remarks',
            cell: ({ row }) => <div>{row.getValue('remarks') || '-'}</div>,
        },
        {
            accessorKey: 'startImgUrl',
            header: 'Start Photo',
            cell: ({ row }) => {
                const url = row.getValue('startImgUrl')
                return url ? (
                    <div></div>
                    //   <a href={url} target="_blank" rel="noopener noreferrer">
                    //     <ImageIcon className="h-5 w-5 text-blue-500" />
                    //   </a>
                ) : (
                    '-'
                )
            },
        },
        {
            accessorKey: 'endImgUrl',
            header: 'End Photo',
            cell: ({ row }) => {
                const url = row.getValue('endImgUrl')
                return url ? (
                    //   <a href={url} target="_blank" rel="noopener noreferrer">
                    //     <ImageIcon className="h-5 w-5 text-blue-500" />
                    //   </a>
                    <div></div>
                ) : (
                    '-'
                )
            },
        },
        {
            accessorKey: 'startPosition',
            header: 'Start Location',
            cell: ({ row }) => {
                const pos = row.original.startPosition
                return pos ? (
                    pos.addressLine1
                    //   <a
                    //     href={`https://www.google.com/maps/search/?api=1&query=${pos.latitude},${pos.longitude}`}
                    //     target="_blank"
                    //     rel="noopener noreferrer"
                    //   >
                    //     <MapPin className="h-5 w-5 text-green-600" />
                    //   </a>
                ) : (
                    '-'
                )
            },
        },
        {
            accessorKey: 'endPosition',
            header: 'End Location',
            cell: ({ row }) => {
                const pos = row.original.endPosition
                return pos ? (
                    pos.addressLine1
                    //   <a
                    //     href={`https://www.google.com/maps/search/?api=1&query=${pos.latitude},${pos.longitude}`}
                    //     target="_blank"
                    //     rel="noopener noreferrer"
                    //   >
                    //     <MapPin className="h-5 w-5 text-red-600" />
                    //   </a>
                ) : (
                    '-'
                )
            },
        },
        // {
        //     accessorKey: 'pjoApproval.approvalStatus',
        //     header: 'PJO Approval',
        //     cell: ({ row }) => {
        //         const status = row.original.pjoApproval?.approvalStatus
        //         return (
        //             <div className="flex justify-center">
        //                 {status === 'approved' ? (
        //                     <CheckCircle2 className="text-green-600" />
        //                 ) : status === 'rejected' ? (
        //                     <XCircle className="text-red-600" />
        //                 ) : null}
        //             </div>
        //         )
        //     },
        // },
        // {
        //     accessorKey: 'managerApproval.approvalStatus',
        //     header: 'Manager Approval',
        //     cell: ({ row }) => {
        //         const status = row.original.managerApproval?.approvalStatus
        //         return (
        //             <div className="flex justify-center">
        //                 {status === 'approved' ? (
        //                     <CheckCircle2 className="text-green-600" />
        //                 ) : status === 'rejected' ? (
        //                     <XCircle className="text-red-600" />
        //                 ) : null}
        //             </div>
        //         )
        //     },
        // },
        // {
        //     accessorKey: 'hrdApproval.approvalStatus',
        //     header: 'HRD Approval',
        //     cell: ({ row }) => {
        //         const status = row.original.hrdApproval?.approvalStatus
        //         return (
        //             <div className="flex justify-center">
        //                 {status === 'approved' ? (
        //                     <CheckCircle2 className="text-green-600" />
        //                 ) : status === 'rejected' ? (
        //                     <XCircle className="text-red-600" />
        //                 ) : null}
        //             </div>
        //         )
        //     },
        // },
        {
            id: 'actions',
            cell: ({ row }) => {
                const absensi = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(absensi._id)}>
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {/* <DropdownMenuItem className="text-red-600">Lihat Detail</DropdownMenuItem> */}
                            {/* <DropdownMenuItem className="text-red-600">Hapus</DropdownMenuItem> */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]


    const fetchAbsensiList = async () => {
        try {
            const response = await ApiService.get(ApiEndpoints.ABSENSI_LIST, {
                type: "reguler",
                startDate: date?.from,
                endDate: date?.to,
            })
            if (response.data.data.items) {
                setData(response.data.data.items)
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to fetch absensi list")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchAbsensiList()
    }, [date?.from?.toISOString(), date?.to?.toISOString()])

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
    })

    if (loading) {
        return (<div className="flex justify-center items-center w-full min-h-[200px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
        </div>)
    }

    if (error) {
        return <div className="p-4 text-red-600">Error: {error}</div>
    }


    return (
        <div>
            <div className="flex items-center justify-between p-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.to}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
                <Input
                    placeholder="Filter by name..."
                    value={(table.getColumn("account")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("account")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* <UserForm
                            mode="add"
                            onUserSaved={() => {
                                fetchCutiList()
                            }}
                        /> */}
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
            </div>
            <div className="flex items-center justify-end space-x-2 p-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                    selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Next
                    </Button>
                </div>
            </div>
            {/* <UserFormDialog
                    open={showDialog}
                    setOpen={setShowDialog}
                    mode="edit"
                    userToEdit={{
                        _id: userToEdit?._id ?? '',
                        fullName: userToEdit?.fullName,
                        position: userToEdit?.position,
                        site: userToEdit?.site?._id,
                        department: userToEdit?.department,
                        nik: userToEdit?.nik,
                        phone: userToEdit?.phone,
                        salary: userToEdit?.salary,
                        password: '',
                        confirmPassword: '',
                        role: userToEdit?.role,
    
                    }}
                    onUserSaved={() => {
                        setShowDialog(false)
                        fetchCutiList()
                    }}
                /> */}
        </div>
    )
}