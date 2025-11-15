/**
 * UploadThing Core Configuration
 * Server-side file upload handler
 */

import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

const f = createUploadthing()

/**
 * File router for permit documents
 * Handles uploads for work permits, residence IDs, licenses, etc.
 */
export const ourFileRouter = {
  // Document uploader - for permit-related documents
  permitDocumentUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 5 },
    image: { maxFileSize: "4MB", maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      // You can add authentication here if needed
      // For now, we'll allow uploads
      // In production, verify the user is authenticated

      return { userId: "temp-user-id" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs after the upload is complete
      console.log("Upload complete for userId:", metadata.userId)
      console.log("File URL:", file.url)

      // You can save to database here if needed
      // For now, we'll handle this in the component

      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
