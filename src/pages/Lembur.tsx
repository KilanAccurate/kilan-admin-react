'use client'

import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu'
import { Button } from 'src/components/ui/button'
import { MoreHorizontal, CheckCircle2, XCircle, Image as ImageIcon, MapPin, ChevronDown, CalendarIcon } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table'
import { Input } from 'src/components/ui/input'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from 'src/components/ui/alert-dialog'
import { Popover, PopoverContent } from 'src/components/ui/popover'
import { PopoverTrigger } from '@radix-ui/react-popover'
import { addDays, format } from 'date-fns'
import React from 'react'
import type { DateRange } from 'react-day-picker'
import { cn } from 'src/lib/utils'
import { Calendar } from 'src/components/ui/calendar'
import type { Absensi } from './Absensi'
import type { User } from './Users'
import { ApiService } from 'src/service/ApiService'
import { ApiEndpoints } from 'src/service/Endpoints'
import { useAuth } from 'src/context/AuthContext'
import { exportLemburanToXLSX } from 'src/utils/exporter'

export default function LemburTable() {
    const [data, setData] = useState<Absensi[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})
    const [showDialog, setShowDialog] = useState(false)
    const [date, setDate] = React.useState<DateRange | undefined>()
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1)
    const [isMax, setIsMax] = useState(false)
    const [inputValue, setInputValue] = useState("");
    const [debouncedValue, setDebouncedValue] = useState(inputValue);
    const [partialLoading, setPartialLoading] = useState(true)


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
                const isDeleted = !!account.deletedAt;

                return (

                    <div className={isDeleted ? "text-red-500" : ""}>
                        {`${account.fullName} (${account.nik})`}
                    </div>
                )
            },
        },
        {
            accessorKey: 'startDate',
            header: 'Waktu Mulai',
            cell: ({ row }) => {
                const date = row.getValue('startDate')
                return (
                    <div>
                        {typeof date === 'string' || typeof date === 'number' || date instanceof Date
                            ? new Date(date).toUTCString()
                            : '-'}
                    </div>
                )
            },
        },
        {
            accessorKey: 'requestedDate',
            header: 'Waktu Pengajuan',
            cell: ({ row }) => {
                const date = row.getValue('requestedDate')
                return (
                    <div>
                        {date && (typeof date === 'string' || typeof date === 'number' || date instanceof Date)
                            ? new Date(date).toUTCString()
                            : '-'}
                    </div>
                )
            },
        },
        {
            accessorKey: 'endDate',
            header: 'Waktu Selesai',
            cell: ({ row }) => {
                const date = row.getValue('endDate')
                return (
                    <div>
                        {date && (typeof date === 'string' || typeof date === 'number' || date instanceof Date)
                            ? new Date(date).toUTCString()
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
            header: 'Site Terdeteksi',
            cell: ({ row }) => <div>{row.getValue('detectedSite') || '-'}</div>,
        },
        {
            accessorKey: 'remarks',
            header: 'Remarks',
            cell: ({ row }) => <div>{row.getValue('remarks') || '-'}</div>,
        },
        {
            accessorKey: 'startImgUrl',
            header: 'Foto Mulai',
            cell: ({ row }) => {
                const url = row.getValue('startImgUrl')
                return url ? (
                    <img src={url as string} />
                ) : (
                    '-'
                )
            },
        },
        {
            accessorKey: 'endImgUrl',
            header: 'Foto Selesai',
            cell: ({ row }) => {
                const url = row.getValue('endImgUrl')
                return url ? (
                    <img src={url as string} />
                ) : (
                    '-'
                )
            },
        },
        {
            accessorKey: 'startPosition',
            header: 'Lokasi Mulai',
            cell: ({ row }) => {
                const pos = row.original.startPosition
                return pos ? (
                    <div>{pos.lat},{pos.lon}</div>
                ) : (
                    '-'
                )
            },
        },
        {
            accessorKey: 'endPosition',
            header: 'Lokasi Selesai',
            cell: ({ row }) => {
                const pos = row.original.endPosition
                return pos ? (
                    <div>{pos.lat},{pos.lon}</div>
                ) : (
                    '-'
                )
            },
        },
        {
            accessorKey: 'pjoApproval.approvalStatus',
            header: 'Persetujuan PJO',
            cell: ({ row }) => {
                const status = row.original.pjoApproval?.approvalStatus
                return (
                    <div className="flex justify-center">
                        {status === 'approved' ? (
                            <CheckCircle2 className="text-green-600" />
                        ) : status === 'rejected' ? (
                            <XCircle className="text-red-600" />
                        ) : null}
                    </div>
                )
            },
        },
        {
            accessorKey: 'managerApproval.approvalStatus',
            header: 'Persetujuan Manager',
            cell: ({ row }) => {
                const status = row.original.managerApproval?.approvalStatus
                return (
                    <div className="flex justify-center">
                        {status === 'approved' ? (
                            <CheckCircle2 className="text-green-600" />
                        ) : status === 'rejected' ? (
                            <XCircle className="text-red-600" />
                        ) : null}
                    </div>
                )
            },
        },
        {
            accessorKey: 'hrdApproval.approvalStatus',
            header: 'Persetujuan HRD',
            cell: ({ row }) => {
                const status = row.original.hrdApproval?.approvalStatus
                return (
                    <div className="flex justify-center">
                        {status === 'approved' ? (
                            <CheckCircle2 className="text-green-600" />
                        ) : status === 'rejected' ? (
                            <XCircle className="text-red-600" />
                        ) : null}
                    </div>
                )
            },
        },
        {
            id: 'approve',
            cell: ({ row }) => {
                const absensi = row.original
                if ((row.original.pjoApproval && user?.role == 'pjo') || (row.original.managerApproval && user?.role == 'manager') || (user?.role == 'hrd') || (user?.role == 'admin')) {
                    return null;
                }
                return <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-gray-700 text-white">Setuju</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{`Setujui permintaan lemburan ${absensi.account.fullName}?`}</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction className="bg-green-600 hover:bg-gray-700 text-white" onClick={() =>
                                actionLembur(absensi._id, '2025-05-14T10:00:00.000Z', 'approved')
                            }>Ya</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            }
        },
        {
            id: 'reject',
            cell: ({ row }) => {
                const absensi = row.original
                if ((row.original.pjoApproval && user?.role == 'pjo') || (row.original.managerApproval && user?.role == 'manager') || (user?.role == 'hrd') || (user?.role == 'admin')) {
                    return null;
                }
                return <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-gray-700 text-white">Tolak</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{`Tolak permintaan lemburan ${absensi.account.fullName}?`}</AlertDialogTitle>

                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-gray-700 text-white" onClick={() =>
                                actionLembur(absensi._id, '2025-05-14T10:00:00.000Z', 'rejected')
                            }>Ya</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            }
        },
    ]
    const actionLembur = async (uid: string, approvedDate: string, approvalStatus: string) => {
        try {
            const response = await ApiService.put(ApiEndpoints.LEMBUR_ACTION, {
                uid,
                approvedDate,
                approvalStatus,
            })
            fetchAbsensiList()
        } catch (err: any) {
            setError(err?.message ?? "Failed to do action on cuti")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(inputValue)
        }, 300); // debounce delay

        return () => clearTimeout(handler);
    }, [inputValue]);



    const fetchAbsensiList = async () => {
        setPartialLoading(true)
        try {
            const response = await ApiService.get(ApiEndpoints.ABSENSI_LIST, {
                type: "lembur",
                startDate: date?.from,
                endDate: date?.to,
                search: debouncedValue,
                page: currentPage,
                limit: 10,
            })
            if (response.data.data.items) {
                setIsMax(response.data.data.isMax)
                setData(response.data.data.items)
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to fetch absensi list")
        } finally {
            setPartialLoading(false)
        }
    }
    useEffect(() => {
        fetchAbsensiList()
    }, [date?.from?.toISOString(), date?.to?.toISOString(), debouncedValue, currentPage])


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
                                <span>Filter Tanggal</span>
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
                    placeholder="Filter berdasarkan nama..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="max-w-sm"
                />

                <div className="flex items-center gap-2">
                    {data.length == 0 ? null : <Button variant="outline" onClick={() => exportLemburanToXLSX(data)}>
                        Export XLSX
                    </Button>}
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
            {partialLoading ? (<div className="flex justify-center items-center w-full min-h-[200px]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
            </div>) : <div className="rounded-md border">
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
            </div>}
            <div className="flex items-center justify-end space-x-2 p-4">
                {/* <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                    selected.
                </div> */}
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (!partialLoading) {
                                setCurrentPage(currentPage - 1)
                            }
                        }}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                        if (!partialLoading) {
                            setCurrentPage(currentPage + 1)
                        }
                    }} disabled={isMax}>
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