"use client"

import { useState } from "react"
import { Button } from "src/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "src/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/ui/table"
import { MapPin } from "lucide-react"
import type { LatLng } from "src/context/GlobalContext"


interface SiteCoordinatesDialogProps {
    siteName: string
    coordinates: LatLng[]
}

export function SiteCoordinatesDialog({ siteName, coordinates }: SiteCoordinatesDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                    View Coordinates
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <MapPin className="mr-2 h-5 w-5" />
                        {siteName} Coordinates
                    </DialogTitle>
                    <DialogDescription>Boundary coordinates for this site location</DialogDescription>
                </DialogHeader>
                <div className="mt-4 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Point</TableHead>
                                <TableHead>Latitude</TableHead>
                                <TableHead>Longitude</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coordinates.map((coord, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">Point {index + 1}</TableCell>
                                    <TableCell>{coord.lat}</TableCell>
                                    <TableCell>{coord.lng}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}
