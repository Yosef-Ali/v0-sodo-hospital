/**
 * UploadThing Client Utilities
 * Client-side hooks for file uploads
 */

import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react"

import type { OurFileRouter } from "@/lib/uploadthing"

export const UploadButton = generateUploadButton<OurFileRouter>()
export const UploadDropzone = generateUploadDropzone<OurFileRouter>()
