import { db } from '../src/db/userRepository.js';
import { getUsersCollection } from '../src/db/mongo.js';

async function seed() {
    
  try {
    const usersCol = await getUsersCollection();

    console.log('[Seed] Pulizia database...');
    await usersCol.deleteMany({});
    console.log('[Seed] Collezione "users" svuotata.');
    const users = [
      { username: 'admin', password: 'admin123', role: 'ADMIN_ROLE' },
      { username: 'certificatore1', password: 'cert123', role: 'CERTIFICATORE_ROLE' },
      { username: 'ispettore1', password: 'insp123', role: 'ISPETTORE_ROLE' },
      { username: 'manutentore1', password: 'manu123', role: 'MANUTENTORE_ROLE' },
    ];

    for (const u of users) {
      try {
        await db.createUser(u);
        console.log(`✔ Utente creato: ${u.username}`);
      } catch (err) {
        if (err.message === 'Utente già esistente') {
          console.log(`ℹ Utente già presente: ${u.username}, skip`);
        } else {
          throw err;
        }
      }
    }

    console.log('✔ Seed completato');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();

