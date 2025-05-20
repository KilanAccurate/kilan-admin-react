// app/(protected)/admin/users/page.tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { SiteLocation } from "src/context/GlobalContext"
import { type SortingState, type ColumnFiltersState, type ColumnDef, useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from "@tanstack/react-table"
import { Button } from "src/components/ui/button"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "src/components/ui/dropdown-menu"
import { ApiService } from "src/service/ApiService"
import { ApiEndpoints } from "src/service/Endpoints"
import { Input } from "src/components/ui/input"
import { UserForm } from "src/components/UserForm"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/ui/table"
import { UserFormDialog } from "src/components/UserFormDialog"

// Define the User type
export type User = {
    _id: string
    fullName: string
    position: string
    site: SiteLocation
    department: string
    nik: string
    phone: string
    salary: number
    role: string
}

export function UsersTable() {
    const [data, setData] = useState<User[]>([])
    const [userToEdit, setEditUser] = useState<User>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})
    const [showDialog, setShowDialog] = useState(false)


    // Define the columns
    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "fullName",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Full Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("fullName")}</div>,
        },
        {
            accessorKey: "position",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Position
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("position")}</div>,
        },
        {
            accessorKey: "department",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Department
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("department")}</div>,
        },
        {
            accessorKey: "nik",
            header: "NIK (ID)",
            cell: ({ row }) => <div className="font-medium">{row.getValue("nik")}</div>,
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <div>{row.getValue("phone")}</div>,
        },
        {
            accessorKey: "salary",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Salary
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const amount = Number.parseFloat(row.getValue("salary"))
                const formatted = new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                }).format(amount)
                return <div className="text-right font-medium">{formatted}</div>
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as string
                return (
                    <div className="flex justify-center">
                        <div
                            className={`
            rounded-full px-2.5 py-0.5 text-xs font-medium
            ${role === "Admin"
                                    ? "bg-red-100 text-red-800"
                                    : role === "Manager"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                }
          `}
                        >
                            {role}
                        </div>
                    </div>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original

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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user._id)}>Copy user ID</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {/* <DropdownMenuItem>View user details</DropdownMenuItem> */}
                            <DropdownMenuItem onClick={() => {
                                setEditUser(user)
                                setShowDialog(true)
                            }}>Edit user</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user._id)}>Delete user</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]


    const fetchUsers = async () => {
        try {
            const response = await ApiService.get(ApiEndpoints.USER)
            if (response.data.data) {
                setData(response.data.data)
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to fetch users")
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteUser(userId: string) {
        try {
            await ApiService.delete(`auth/delete/${userId}`)
            toast('User deleted successfully')
            fetchUsers()
        } catch (error: any) {
            toast('Failed to delete user', {
                description:
                    error?.data?.message || error?.message || 'Something went wrong.',
            })
        }
    }


    useEffect(() => {
        fetchUsers()
    }, [])

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
                    placeholder="Filter by name..."
                    value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("fullName")?.setFilterValue(event.target.value)}
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
                    <UserForm
                        mode="add"
                        onUserSaved={() => {
                            fetchUsers()
                        }}
                    />
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
                {/* <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                    selected.
                </div> */}
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
            <UserFormDialog
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
                    fetchUsers()
                }}
            />
        </div>
    )
}
