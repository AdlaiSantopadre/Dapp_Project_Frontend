// services/ipfs.js
import { create } from '@storacha/client'
import { File } from '@web-std/file'

let client = null


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
  if (!client) {
    client = await create()
    // Prima esecuzione: farà login via mail & attesa piano (già fatto nei tuoi test)
    // Se preferisci evitare il login qui, inizializza altrove una tantum.
  }
  return client
}

export async function uploadToIPFS(buffer, filename) {
  const client = await getStorachaClient()
  const file = new File([buffer], filename)
  const cid = await client.uploadFile(file)

  console.log('[Storacha] Upload completato. CID:', cid.toString())
  return cid.toString()
}
