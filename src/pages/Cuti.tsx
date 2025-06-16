

import { CheckCircle2, XCircle } from "lucide-react"

import { useEffect, useState } from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "src/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu"
import { Input } from "src/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/ui/table"
import { toast } from "sonner"
import type { User } from "./Users"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "src/components/ui/alert-dialog"
import { ApiService } from "src/service/ApiService"
import { ApiEndpoints } from "src/service/Endpoints"
import { useAuth } from "src/context/AuthContext"
import { exportCutiToXLSX } from "src/utils/exporter"


export interface ApprovalData {
    uid: string
    approvedDate: Date
    userId: string
    approvalStatus: 'approved' | 'rejected'
    role: 'pjo' | 'manager' | 'hrd'
}

export interface Cuti {
    _id: string
    accountId: string
    account: User
    tanggalMasuk: Date
    mulaiCuti: Date
    kembaliBekerja: Date
    poh: 'lokal' | 'nonLokal'
    rosterCuti: string
    tujuanCuti: string
    pekerjaanDiserahkanPada: User[]
    transport: string
    sisaHariCuti: number
    keterangan?: string
    pjoApproval?: ApprovalData
    managerApproval?: ApprovalData
    hrdApproval?: ApprovalData
    createdAt: Date
    updatedAt: Date
}


export default function CutiTable() {
    const [data, setData] = useState<Cuti[]>([])
    // const [userToEdit, setEditUser] = useState<Cuti>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})
    const [showDialog, setShowDialog] = useState(false)
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1)
    const [isMax, setIsMax] = useState(false)
    const [inputValue, setInputValue] = useState("");
    const [debouncedValue, setDebouncedValue] = useState(inputValue);
    const [partialLoading, setPartialLoading] = useState(true)
    const columns: ColumnDef<Cuti>[] = [
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
            accessorKey: "tanggalMasuk",
            header: "Tanggal Masuk",
            cell: ({ row }) => {
                const date = new Date(row.getValue("tanggalMasuk"))
                return <div>{date.toDateString()}</div>
            },
        },
        {
            accessorKey: "mulaiCuti",
            header: "Mulai Cuti",
            cell: ({ row }) => {
                const date = new Date(row.getValue("mulaiCuti"))
                return <div>{date.toDateString()}</div>
            },
        },
        {
            accessorKey: "kembaliBekerja",
            header: "Kembali Bekerja",
            cell: ({ row }) => {
                const date = new Date(row.getValue("kembaliBekerja"))
                return <div>{date.toDateString()}</div>
            },
        },
        {
            accessorKey: "poh",
            header: "POH",
            cell: ({ row }) => <div>{row.getValue("poh")}</div>,
        },
        {
            accessorKey: "rosterCuti",
            header: "Roster Cuti",
            cell: ({ row }) => <div>{row.getValue("rosterCuti")}</div>,
        },
        {
            accessorKey: "tujuanCuti",
            header: "Tujuan Cuti",
            cell: ({ row }) => <div>{row.getValue("tujuanCuti")}</div>,
        },
        {
            accessorKey: "pekerjaanDiserahkanPada",
            header: "Pekerjaan Diserahkan Pada",
            cell: ({ row }) => {
                const userList = row.getValue("pekerjaanDiserahkanPada") as User[];

                return (
                    <div>
                        {userList.map(user => `${user.fullName}(${user.nik})`).join(", ")}
                    </div>
                );
            },
        },
        {
            accessorKey: "transport",
            header: "Transport",
            cell: ({ row }) => <div>{row.getValue("transport")}</div>,
        },
        {
            accessorKey: "sisaHariCuti",
            header: "Sisa Hari Cuti",
            cell: ({ row }) => <div className="text-right">{row.getValue("sisaHariCuti")}</div>,
        },
        {
            accessorKey: "keterangan",
            header: "Keterangan",
            cell: ({ row }) => <div>{row.getValue("keterangan")}</div>,
        },
        {
            accessorKey: "pjoApproval.approvalStatus",
            header: "PJO Approval",
            cell: ({ row }) => {
                const status = row.original.pjoApproval?.approvalStatus
                return (
                    <div className="flex justify-center">
                        {status === "approved" ? (
                            <CheckCircle2 className="text-green-600" />
                        ) : status === "rejected" ? (
                            <XCircle className="text-red-600" />
                        ) : null}
                    </div>
                )
            },
        },
        {
            accessorKey: "managerApproval.approvalStatus",
            header: "Manager Approval",
            cell: ({ row }) => {
                const status = row.original.managerApproval?.approvalStatus
                return (
                    <div className="flex justify-center">
                        {status === "approved" ? (
                            <CheckCircle2 className="text-green-600" />
                        ) : status === "rejected" ? (
                            <XCircle className="text-red-600" />
                        ) : null}
                    </div>
                )
            },
        },
        {
            accessorKey: "hrdApproval.approvalStatus",
            header: "HRD Approval",
            cell: ({ row }) => {
                const status = row.original.hrdApproval?.approvalStatus
                return (
                    <div className="flex justify-center">
                        {status === "approved" ? (
                            <CheckCircle2 className="text-green-600" />
                        ) : status === "rejected" ? (
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
                                actionCuti(absensi._id, '2025-05-14T10:00:00.000Z', 'approved')
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
                                actionCuti(absensi._id, '2025-05-14T10:00:00.000Z', 'rejected')
                            }>Ya</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            }
        },
    ]

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(inputValue)
        }, 300); // debounce delay

        return () => clearTimeout(handler);
    }, [inputValue]);




    const fetchCutiList = async () => {
        setPartialLoading(true)
        try {
            const response = await ApiService.post(ApiEndpoints.CUTI_LIST, {
                status: "all",
                page: currentPage,
                search: debouncedValue,
                limit: 10,
            })
            if (response.data.data.items) {
                setIsMax(response.data.data.isMax)
                setData(response.data.data.items)
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to fetch cuti list")
        } finally {
            setPartialLoading(false)
        }
    }

    const actionCuti = async (uid: string, approvedDate: string, approvalStatus: string) => {
        try {
            const response = await ApiService.put(ApiEndpoints.CUTI_ACTION, {
                uid,
                approvedDate,
                approvalStatus,
            })
            fetchCutiList()
        } catch (err: any) {
            setError(err?.message ?? "Failed to do action on cuti")
        } finally {
            setLoading(false)
        }
    }

    // async function handleDeleteUser(userId: string) {
    //     try {
    //         await ApiService.delete(`auth/delete/${userId}`)
    //         toast('User deleted successfully')
    //         fetchCutiList()
    //     } catch (error: any) {
    //         toast('Failed to delete user', {
    //             description:
    //                 error?.data?.message || error?.message || 'Something went wrong.',
    //         })
    //     }
    // }


    useEffect(() => {
        fetchCutiList()
    }, [debouncedValue, currentPage])

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
                <Input
                    placeholder="Filter berdasarkan nama..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="max-w-sm"
                />
                <div className="flex items-center gap-2">
                    {data.length == 0 ? null : <Button variant="outline" onClick={() => exportCutiToXLSX(data)}>
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


