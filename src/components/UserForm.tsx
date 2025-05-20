
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { toast } from "sonner"
import type { SiteLocation } from "src/context/GlobalContext"
import { ApiService } from "src/service/ApiService"
import { ApiEndpoints } from "src/service/Endpoints"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "src/components/ui/dialog"
import { Button } from "./ui/button"
import { UserFormContent } from "./UserFormContent"

export const formSchema = z.object({
    fullName: z.string().min(2),
    position: z.string().min(2),
    site: z.string().min(2),
    department: z.string(),
    nik: z.string().min(3),
    phone: z.string().min(10),
    salary: z.coerce.number().positive(),
    role: z.string(),
    password: z
        .string()
        .min(8)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/[0-9]/)
        .optional()
        .or(z.literal("")), // optional for edit
    confirmPassword: z.string().optional(),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type UserFormValues = z.infer<typeof formSchema>

export interface UserFormProps {
    mode: "add" | "edit"
    userToEdit?: Partial<UserFormValues> & { _id: string }
    onUserSaved?: () => void
}

export function UserForm({ mode, userToEdit, onUserSaved }: UserFormProps) {
    const [open, setOpen] = useState(false)
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={mode === "add" ? "default" : "outline"}>
                    {mode === "add" ? "Add User" : "Edit"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{mode === "add" ? "Tambahkan User Baru" : "Edit User"}</DialogTitle>
                    <DialogDescription>
                        {mode === "add" ? "Isi form untuk menambahkan user baru." : "Edit data user."}
                    </DialogDescription>
                </DialogHeader>
                <UserFormContent
                    mode={mode}
                    userToEdit={userToEdit}
                    onUserSaved={onUserSaved}
                    setOpen={setOpen}
                />
            </DialogContent>
        </Dialog>
    )
}
