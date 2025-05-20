

import type { UserFormProps } from "./UserForm"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "src/components/ui/dialog"
import { UserFormContent } from "./UserFormContent"

export function UserFormDialog({
    open,
    setOpen,
    mode,
    userToEdit,
    onUserSaved,
}: UserFormProps & { open: boolean, setOpen: (open: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
