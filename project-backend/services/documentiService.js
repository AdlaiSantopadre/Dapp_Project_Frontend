import { documentiDb } from '../db/documentiRepository.js';

export async function createDocumento(data) {
  return documentiDb.createDocumento(data);
}

export async function setQrCid(id, qrCid) {
  return documentiDb.setQrCid(id, qrCid);
}

export async function getDocumentoById(id) {
  return documentiDb.getDocumentoById(id);
}

export async function listDocumentiByImpianto(impiantoId) {
  return documentiDb.listDocumentiByImpianto(impiantoId);
}
export async function listDocumentiAll() {
  return documentiDb.listDocumentiAll();
}
