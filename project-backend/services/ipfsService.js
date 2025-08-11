// services/ipfsService.js
import { create as createClient } from '@storacha/client'
import { File } from '@web-std/file'
import { Readable } from 'node:stream'

export function makeStorage() {
  const useReal = process.env.TEST_E2E === '1' || process.env.IPFS_USE_REAL === '1'
  return useReal ? makeStorachaClient() : makeMockStorage()
}

function makeMockStorage() {
  return {
    async put({ name, data, size, mimetype }) {
      console.log(`[IPFS MOCK] name=${name}, size=${size}, mime=${mimetype}`)
      return { cid: 'bafyMOCKcid', size }
    }
  }
}

function makeStorachaClient() {
  const {
    STORACHA_SPACE_DID,
    STORACHA_AGENT_SECRET,
    STORACHA_DATA_DIR,
    STORACHA_ENDPOINT
  } = process.env

  if (!STORACHA_SPACE_DID || !STORACHA_AGENT_SECRET) {
    throw new Error('Missing Storacha env vars (STORACHA_SPACE_DID / STORACHA_AGENT_SECRET)')
  }

  // crea il client UNA VOLTA; usa await dentro ai metodi
  const clientP = (async () => {
      const client = await Promise.resolve(
      createClient({
        space: STORACHA_SPACE_DID,   // DID dello Space
        agentSecret: STORACHA_AGENT_SECRET, // 👈 usa il secret, NON "principal"
        dataDir: STORACHA_DATA_DIR,
        endpoint: STORACHA_ENDPOINT
      })
    )
    return client
  })()

  return {
    async put({ name, data, size, mimetype }) {
      if (!name || !data || !size) throw new Error('ipfsService.put: bad input')
      const client = await clientP
      console.log("DEBUG uploadFile typeof:", typeof client.uploadFile)

      // usa un File “web-like” da Buffer
      const file = new File([data], name, { type: mimetype || 'application/octet-stream' })

      // alcune versioni ritornano stringa, altre oggetto → normalizza
      const out = await client.uploadFile(file)
      const cid =
        typeof out === 'string'
          ? out
          : out?.cid ?? out?.root?.toString?.() ?? out?.toString?.()

      if (!cid) throw new Error('uploadFile returned no CID')
      return { cid, size }
    }
  }
}


