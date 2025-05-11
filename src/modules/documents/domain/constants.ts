import { DocumentType, DocumentStatus, DocumentAccessLevel } from './types';

export const DOCUMENT_TYPES = Object.values(DocumentType);
export const DOCUMENT_STATUSES = Object.values(DocumentStatus);
export const DOCUMENT_ACCESS_LEVELS = Object.values(DocumentAccessLevel);

export const DEFAULT_DOCUMENT_STATUS = DocumentStatus.DRAFT;
export const DEFAULT_DOCUMENT_ACCESS_LEVEL = DocumentAccessLevel.INTERNAL;

export const ALLOWED_DOCUMENT_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'text/plain',
  'text/html',
];

export const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DOCUMENT_PAGINATION_DEFAULT_LIMIT = 20;
export const DOCUMENT_PAGINATION_MAX_LIMIT = 100; 