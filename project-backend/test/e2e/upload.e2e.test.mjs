import request from 'supertest'
import { expect } from 'chai'
import fs from 'fs'
import path from 'path'
import app from '../../app.js'

// Utility per ottenere un JWT “vero” chiamando la tua /auth/login
async function getToken(address, password) {
  const res = await request(app)
    .post('/auth/login')
    .send({ address, password })
  expect(res.status).to.equal(200)
  expect(res.body).to.have.property('token')
  return res.body.token
}

/**
 * E2E:
 * - login come CERTIFICATORE
 * - POST /documents/upload con file
 * - assert su { cid, txHash, uploadedBy, hash, ipfsGateway }
 */
describe('E2E /documents/upload', () => {
  it('carica PDF, mock IPFS, registra on-chain e risponde 200', async () => {
    // Usa uno degli utenti mock con ruolo CERTIFICATORE_ROLE
    // es: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' / 'certificatorepass'
    const token = await getToken(
      '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      'certificatorepass'
    )

    const pdfPath = path.join(process.cwd(), 'test', 'fixtures', 'sample.pdf')
    const res = await request(app)
      .post('/documents/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', pdfPath)

    expect(res.status).to.equal(200)
    expect(res.body).to.have.keys(['cid', 'txHash', 'uploadedBy', 'hash', 'ipfsGateway'])
    expect(res.body.cid).to.be.a('string')
    expect(res.body.txHash).to.match(/^0x[a-fA-F0-9]{64}$/)
    expect(res.body.hash).to.match(/^[a-f0-9]{64}$/)
    expect(res.body.uploadedBy).to.be.a('string')
  })

  it('rifiuta senza ruolo CERTIFICATORE_ROLE (403)', async () => {
    // utente senza ruolo (adatta all’utente mock)
    const token = await getToken(
      '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc', // MANUTENTORE_ROLE nel tuo mock
      'manutentorepass'
    )

    const pdfPath = path.join(process.cwd(), 'test', 'fixtures', 'sample.pdf')
    const res = await request(app)
      .post('/documents/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', pdfPath)

    expect(res.status).to.equal(403)
  })
})
