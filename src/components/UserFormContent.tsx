
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"

import { toast } from "sonner"
import { formSchema, type UserFormProps, type UserFormValues } from "./UserForm"
import type { SiteLocation } from "src/context/GlobalContext"
import { ApiService } from "src/service/ApiService"
import { ApiEndpoints } from "src/service/Endpoints"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "src/components/ui/form"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { DialogFooter } from "src/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export function UserFormContent({
    mode,
    userToEdit,
    onUserSaved,
    setOpen,
}: UserFormProps & { setOpen: (open: boolean) => void }) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [sites, setSites] = useState<SiteLocation[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const defaultValues: Partial<UserFormValues> = {
        fullName: userToEdit?.fullName ?? "",
        position: userToEdit?.position ?? "",
        site: userToEdit?.site ?? "",
        department: userToEdit?.department ?? "",
        nik: userToEdit?.nik ?? "",
        phone: userToEdit?.phone ?? "",
        salary: userToEdit?.salary ?? 0,
        role: userToEdit?.role ?? "",
        password: "",
        confirmPassword: "",
    }

    const form = useForm<UserFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    useEffect(() => {
        console.log("site " + userToEdit?.site)
        const getSiteLocations = async () => {
            try {
                const response = await ApiService.get(ApiEndpoints.SITELOCATION)
                if (response?.data?.data) {
                    setSites(response.data.data)
                }
            } catch (error) {
                toast.error("Failed to fetch site locations")
            } finally {
                setIsLoading(false)
            }
        }

        getSiteLocations()
    }, [])

    async function onSubmit(data: UserFormValues) {
        try {
            if (mode === "add") {
                await ApiService.post(ApiEndpoints.ADD_USER, data)
                toast.success("User added successfully")
            } else {
                await ApiService.put(`${ApiEndpoints.EDIT_USER}/${userToEdit?._id}`, data)
                toast.success("User updated successfully")
            }

            onUserSaved?.()
            setOpen(false)
        } catch (error: any) {
            toast.error("Failed to save user", {
                description: error?.data?.message || error.message,
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Lengkap</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="site"
                    render={({ field }) => {
                        console.log("value " + field.value)
                        const selectedSite = sites.find(st => st._id === field.value);
                        return (
                            <FormItem>
                                <FormLabel>Site</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Site">
                                                {selectedSite?.siteName ?? "Pilih Site"}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sites.map((site) => (
                                            <SelectItem key={site._id} value={site._id}>
                                                {site.siteName || '-'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />



                <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Posisi</FormLabel>
                            <FormControl>
                                <Input placeholder="Teknisi Elektrik" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Departemen</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Departemen" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Produksi">Produksi</SelectItem>
                                    <SelectItem value="SHE">SHE</SelectItem>
                                    <SelectItem value="Plant">Plant</SelectItem>
                                    <SelectItem value="HR">HR</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="nik"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NIK</FormLabel>
                                <FormControl>
                                    <Input placeholder="012345" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>No. HP</FormLabel>
                                <FormControl>
                                    <Input placeholder="+62 8123456789" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gaji</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="75000" {...field} />
                                </FormControl>
                                <FormDescription>Gaji bulanan dalam Rupiah</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="pjo">PJO</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="hrd">HRD</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {mode === "add" && (
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kata Sandi</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Kata sandi minimal 8 karakter gabungan antara huruf dan angka .
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {
                    mode == "add" ? <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Konfirmasi Kata Sandi</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    /> : null
                }
                <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {mode === "add" ? "Simpan" : "Update"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}
