// lib/api/endpoints.ts
export enum ApiEndpoints {
    USER = '/auth/list',
    ADD_USER = '/auth/signup',
    EDIT_USER = '/auth/edit',
    AUTH_LOGIN = '/auth/login',
    CUTI_LIST = '/cuti/admin/list',
    ABSENSI_LIST = '/absensi/admin/list',
    CUTI_ACTION = '/cuti/action',
    LEMBUR_ACTION = '/absensi/approval',
    SITELOCATION = '/site-locations',
    UPDATEFCM = '/auth/update-fcm-token',
    GLOBAL_SETTING = '/global-setting',
    UPLOAD_CAROUSEL_IMAGE = '/upload-carousel',
    ABSENSI = '/absensi',
    CUTI = '/cuti',
    // ...add more as needed
}
