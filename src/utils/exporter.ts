import { saveAs } from "file-saver"
import Papa from "papaparse"
import type { Absensi } from "src/pages/Absensi"
import type { Cuti } from "src/pages/Cuti"
import * as XLSX from "xlsx"

export function exportToCSV<T>(data: T[], filename: string) {
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, `${filename}.csv`)
}


export function exportToCsvUsers(data: any[], fileName: string) {
    const formattedData = data.map(user => ({
        "Nama Lengkap": user.fullName,
        "Gaji": `Rp.${user.salary}`,
        "Posisi": user.position,
        "Department": user.department,
        "NIK": user.nik,
        "No HP": user.phone,
        "Role": user.role,
    }));

    const csv = Papa.unparse(formattedData);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
}

export function exportToXLSXUsers<T extends Record<string, any>>(data: T[], filename: string) {
    const formattedData = data.map(user => ({
        "Nama Lengkap": user.fullName,
        "Gaji": `Rp.${user.salary}`,
        "Posisi": user.position,
        "Department": user.department,
        "NIK": user.nik,
        "No HP": user.phone,
        "Role": user.role,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, `${filename}.xlsx`);
}


export function exportLemburanToXLSX(data: Absensi[]) {
    const worksheetData = data.map((item) => ({
        "Karyawan": `${item.account.fullName} (${item.account.nik})`,
        "Waktu Mulai": item.startDate ? new Date(item.startDate).toLocaleString("id-ID") : "-",
        "Waktu Pengajuan": item.requestedDate ? new Date(item.requestedDate).toLocaleString("id-ID") : "-",
        "Waktu Selesai": item.endDate ? new Date(item.endDate).toLocaleString("id-ID") : "-",
        "Overtime": item.isOverTime ? "Yes" : "No",
        "OT Type": item.otType || "-",
        "Site Terdeteksi": item.detectedSite || "-",
        "Remarks": item.remarks || "-",
        "Foto Mulai": item.startImgUrl || "-",
        "Foto Selesai": item.endImgUrl || "-",
        "Lokasi Mulai": item.startPosition ? `${item.startPosition.lat}, ${item.startPosition.lon}` : "-",
        "Lokasi Selesai": item.endPosition ? `${item.endPosition.lat}, ${item.endPosition.lon}` : "-",
        "Persetujuan PJO": item.pjoApproval?.approvalStatus || "-",
        "Persetujuan Manager": item.managerApproval?.approvalStatus || "-",
        "Persetujuan HRD": item.hrdApproval?.approvalStatus || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lemburan");

    XLSX.writeFile(workbook, "lemburan.xlsx");
}

export function exportAbsensiToXLSX(data: Absensi[]) {
    const worksheetData = data.map((item) => ({
        "Karyawan": `${item.account.fullName} (${item.account.nik})`,
        "Waktu Mulai": item.startDate ? new Date(item.startDate).toLocaleString("id-ID") : "-",
        "Waktu Pengajuan": item.requestedDate ? new Date(item.requestedDate).toLocaleString("id-ID") : "-",
        "Waktu Selesai": item.endDate ? new Date(item.endDate).toLocaleString("id-ID") : "-",
        "Overtime": item.isOverTime ? "Yes" : "No",
        "OT Type": item.otType || "-",
        "Site Terdeteksi": item.detectedSite || "-",
        "Remarks": item.remarks || "-",
        "Foto Mulai": item.startImgUrl || "-",
        "Foto Selesai": item.endImgUrl || "-",
        "Lokasi Mulai": item.startPosition ? `${item.startPosition.lat}, ${item.startPosition.lon}` : "-",
        "Lokasi Selesai": item.endPosition ? `${item.endPosition.lat}, ${item.endPosition.lon}` : "-",
        "Persetujuan PJO": item.pjoApproval?.approvalStatus || "-",
        "Persetujuan Manager": item.managerApproval?.approvalStatus || "-",
        "Persetujuan HRD": item.hrdApproval?.approvalStatus || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi");

    XLSX.writeFile(workbook, "absensi.xlsx");
}


export function exportCutiToXLSX(data: Cuti[]) {
    const worksheetData = data.map((item) => ({
        "Karyawan": `${item.account.fullName} (${item.account.nik})`,
        "Tanggal Masuk": item.tanggalMasuk ? new Date(item.tanggalMasuk).toLocaleDateString("id-ID") : "-",
        "Mulai Cuti": item.mulaiCuti ? new Date(item.mulaiCuti).toLocaleDateString("id-ID") : "-",
        "Kembali Bekerja": item.kembaliBekerja ? new Date(item.kembaliBekerja).toLocaleDateString("id-ID") : "-",
        "POH": item.poh || "-",
        "Roster Cuti": item.rosterCuti || "-",
        "Tujuan Cuti": item.tujuanCuti || "-",
        "Pekerjaan Diserahkan Pada": item.pekerjaanDiserahkanPada?.map(user => `${user.fullName}(${user.nik})`).join(", ") || "-",
        "Transport": item.transport || "-",
        "Sisa Hari Cuti": item.sisaHariCuti ?? "-",
        "Keterangan": item.keterangan || "-",
        "PJO Approval": item.pjoApproval?.approvalStatus || "-",
        "Manager Approval": item.managerApproval?.approvalStatus || "-",
        "HRD Approval": item.hrdApproval?.approvalStatus || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cuti");

    XLSX.writeFile(workbook, "cuti.xlsx");
}

