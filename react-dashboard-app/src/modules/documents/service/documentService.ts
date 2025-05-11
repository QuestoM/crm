import {
  findDocuments,
  findDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  findDocumentsByEntityId,
  findDocumentTemplates
} from '../repository/documentRepository';
import { Document, DocumentFilter } from '../domain/types';
import { 
  validateCreateDocument, 
  validateUpdateDocument, 
  validateDocumentFilter 
} from '../domain/validation';
import { DocumentNotFoundError } from '../../../lib/errors';

export async function getDocuments(
  filter: DocumentFilter & { 
    limit?: number; 
    offset?: number; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc'; 
  }
): Promise<{ data: Document[]; total: number }> {
  const validatedFilter = validateDocumentFilter(filter);
  return findDocuments(validatedFilter);
}

export async function getDocumentById(id: string): Promise<Document> {
  const document = await findDocumentById(id);
  
  if (!document) {
    throw new DocumentNotFoundError(id);
  }
  
  return document;
}

export async function addDocument(data: unknown): Promise<Document> {
  const validatedData = validateCreateDocument(data);
  return createDocument(validatedData);
}

export async function modifyDocument(id: string, data: unknown): Promise<Document> {
  const document = await findDocumentById(id);
  
  if (!document) {
    throw new DocumentNotFoundError(id);
  }
  
  const validatedData = validateUpdateDocument(data);
  return updateDocument(id, validatedData);
}

export async function removeDocument(id: string): Promise<void> {
  const document = await findDocumentById(id);
  
  if (!document) {
    throw new DocumentNotFoundError(id);
  }
  
  return deleteDocument(id);
}

export async function getDocumentsByEntity(
  entityType: 'customer' | 'product' | 'order' | 'invoice' | 'lead' | 'appointment',
  entityId: string,
  limit?: number
): Promise<Document[]> {
  return findDocumentsByEntityId(entityType, entityId, limit);
}

export async function getDocumentTemplates(
  type?: string,
  limit?: number
): Promise<Document[]> {
  return findDocumentTemplates(type, limit);
}

export async function duplicateDocument(id: string, modifiedData?: unknown): Promise<Document> {
  const document = await findDocumentById(id);
  
  if (!document) {
    throw new DocumentNotFoundError(id);
  }
  
  // Create a duplicated document with modified data if provided
  const duplicateData = {
    ...document,
    title: `${document.title} (Copy)`,
    ...(modifiedData ? validateUpdateDocument(modifiedData) : {})
  };
  
  // Remove fields that should not be duplicated
  delete duplicateData.id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;
  
  return createDocument(duplicateData);
}

export async function createDocumentFromTemplate(templateId: string, customData: unknown): Promise<Document> {
  const template = await findDocumentById(templateId);
  
  if (!template) {
    throw new DocumentNotFoundError(templateId);
  }
  
  if (!template.isTemplate) {
    throw new Error('The specified document is not a template');
  }
  
  const validatedCustomData = validateUpdateDocument(customData);
  
  // Create a new document from template with custom data
  const newDocumentData = {
    ...template,
    ...validatedCustomData,
    isTemplate: false, // Ensure the new document is not marked as a template
  };
  
  // Remove fields that should not be duplicated
  delete newDocumentData.id;
  delete newDocumentData.createdAt;
  delete newDocumentData.updatedAt;
  
  return createDocument(newDocumentData);
} 