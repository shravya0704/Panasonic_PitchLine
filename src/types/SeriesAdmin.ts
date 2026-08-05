/**
 * SeriesAdmin.ts
 * TypeScript types for all series admin operations
 * Place this in src/types/SeriesAdmin.ts
 */

import { Product } from "./Product";

// Series type (from database)
export interface Series {
  id: string;
  code: string;
  name: string;
  type?: "standard" | "aio"; // <--- ADDED THIS PROPERTY
  cover_image: string;
  edm_image_url: string;
  created_at?: string;
}

// Brochure upload tracking
export interface SeriesBrochure {
  id: string;
  series_id: string;
  series_code: string;
  original_pdf_url: string;
  conversion_status: "pending" | "completed" | "failed";
  page_count: number | null;
  created_at: string;
  updated_at: string;
}

// Individual brochure page
export interface BrochurePage {
  id: string;
  series_code: string;
  page_number: number;
  image_url: string;
  series_id?: string;
  series_brochure_id?: string;
}

// Result from PDF to image conversion
export interface ConvertedPdfResult {
  pages: string[]; // Array of base64 JPEG strings
  pageCount: number;
}

// Progress tracking for uploads/conversions
export interface UploadProgress {
  current: number;
  total: number;
  stage: "uploading" | "converting" | "saving" | "complete";
  message?: string;
}

// Series creation workflow state
export interface SeriesCreationState {
  step: 1 | 2 | 3 | 4 | 5;
  seriesId?: string;
  seriesBrochureId?: string;
  seriesData?: {
    code: string;
    name: string;
    type: "standard" | "aio"; // <--- ADDED THIS PROPERTY
  };
  brochurePages?: string[]; // base64 images
  pageCount?: number;
  models?: Product[];
  error?: string;
  isLoading: boolean;
}

// Form validation result
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// Brochure upload service response
export interface BrochureUploadResponse {
  success: boolean;
  pageCount: number;
  imageUrls: string[];
  error?: string;
}

// Series creation service responses
export interface SeriesCreationInitResponse {
  seriesId: string;
  seriesBrochureId: string;
}

export interface BrochureUploadForSeriesResponse {
  pageCount: number;
  previewUrls: string[];
}

// Progress tracking response
export interface SeriesCreationProgressResponse {
  seriesExists: boolean;
  brochureUploaded: boolean;
  modelsAdded: number;
}

// Toast/notification types
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}