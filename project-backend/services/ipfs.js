// services/ipfs.js
import { create } from '@storacha/client'
import { File } from '@web-std/file'

let client = null
const MOCK = String(process.env.IPFS_MOCK || '').toLowerCase() === 'true'

/**
 * Inizializza il client Storacha con login email, attesa piano e setup dello Space.

export async function initializeStoracha(email = 'adiegiuli@gmail.com') {
  client = await create()


  const account = await client.login(email)
  console.log('[Storacha] Login avviato. Attendo attivazione piano...')
 
  // Attende che l’utente abbia selezionato un piano (max 15 minuti)
  await account.plan.wait()
  console.log('[Storacha] Piano attivo.')

  // Crea lo Space (o lo recupera se già esiste)
  const space = await client.createSpace('documenti-impianto', { account })

  await client.setCurrentSpace(space.did())
  console.log(`[Storacha] Space attivo: ${space.did()}`)

  return client
}
*/
/**
 * Carica un file su Storacha (deve essere chiamato dopo initializeStoracha)
 */
export async function getStorachaClient() {
  if (MOCK) return null // Mock per test senza IPFS reale


  //   console.warn('[Storacha] Mock attivo, non verrà effettuato upload reale.')
  //   return {
  //     uploadFile: async (file) => {
  //       console.log(`[Mock Storacha] Upload file: ${file.name}`)
  //       return 'bafybeigdyrmockcid1234567890'
  //     }
  //   }
  // }

  if (!client) {
    client = await create()
    // In ambiente reale: primo run → login mail & piano
    // Nei test E2E teniamo mock=true per evitare dipendenze esterne
  }
  return client
}

export async function uploadToIPFS(buffer, filename) {
  if (MOCK) {
    const hash = await import('node:crypto').then(c => 
      c.createHash('sha256').update(buffer).digest('hex')
    )
    // Restituisco un CID “fake” stabile per i test
    return `bafyTEST_${hash.slice(0, 18)}`
    // console.warn('[Storacha] Mock attivo, non verrà effettuato upload reale.')
    // return 'bafybeigdyrmockcid1234567890'
  }

  const client = await getStorachaClient()
  const file = new File([buffer], filename, { type: 'application/pdf' })
  const cid = await client.uploadFile(file)

  console.log('[Storacha] Upload completato. CID:', cid.toString())
  return cid.toString()
}
