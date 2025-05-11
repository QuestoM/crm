export enum DocumentType {
  INVOICE = 'INVOICE',
  CONTRACT = 'CONTRACT',
  PROPOSAL = 'PROPOSAL',
  RECEIPT = 'RECEIPT',
  AGREEMENT = 'AGREEMENT',
  ORDER_FORM = 'ORDER_FORM',
  WARRANTY = 'WARRANTY',
  CERTIFICATE = 'CERTIFICATE',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export enum DocumentAccessLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  RESTRICTED = 'RESTRICTED',
  PRIVATE = 'PRIVATE',
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: DocumentType;
  status: DocumentStatus;
  accessLevel: DocumentAccessLevel;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  customerId?: string;
  productId?: string;
  orderId?: string;
  invoiceId?: string;
  leadId?: string;
  appointmentId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  isTemplate: boolean;
  version: number;
}

export interface DocumentFilter {
  id?: string;
  title?: string;
  type?: DocumentType;
  status?: DocumentStatus;
  accessLevel?: DocumentAccessLevel;
  customerId?: string;
  productId?: string;
  orderId?: string;
  invoiceId?: string;
  leadId?: string;
  appointmentId?: string;
  tags?: string[];
  createdBy?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  isTemplate?: boolean;
  searchQuery?: string;
} 