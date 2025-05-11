import { z } from 'zod';
import { 
  DocumentType, 
  DocumentStatus, 
  DocumentAccessLevel, 
  Document 
} from './types';
import { 
  ALLOWED_DOCUMENT_FILE_TYPES, 
  MAX_DOCUMENT_FILE_SIZE 
} from './constants';

export const documentSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  type: z.nativeEnum(DocumentType),
  status: z.nativeEnum(DocumentStatus),
  accessLevel: z.nativeEnum(DocumentAccessLevel),
  fileUrl: z.string().url(),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive().max(MAX_DOCUMENT_FILE_SIZE),
  fileType: z.string().refine(
    type => ALLOWED_DOCUMENT_FILE_TYPES.includes(type),
    { message: 'Unsupported file type' }
  ),
  customerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  isTemplate: z.boolean().default(false),
  version: z.number().int().min(1).default(1),
});

export const createDocumentSchema = documentSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const updateDocumentSchema = documentSchema
  .partial()
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true, 
    createdBy: true 
  });

export const documentFilterSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional(),
  type: z.nativeEnum(DocumentType).optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  accessLevel: z.nativeEnum(DocumentAccessLevel).optional(),
  customerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  createdBy: z.string().uuid().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  isTemplate: z.boolean().optional(),
  searchQuery: z.string().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const validateDocument = (data: unknown): Document => {
  return documentSchema.parse(data) as Document;
};

export const validateCreateDocument = (data: unknown): Omit<Document, 'id' | 'createdAt' | 'updatedAt'> => {
  return createDocumentSchema.parse(data);
};

export const validateUpdateDocument = (data: unknown): Partial<Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>> => {
  return updateDocumentSchema.parse(data);
};

export const validateDocumentFilter = (data: unknown) => {
  return documentFilterSchema.parse(data);
}; 