// Script per creare la collezione 'riders' su Firebase
// Esegui con: node scripts/create-riders.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Configurazione Firebase - SOSTITUISCI CON LE TUE CHIAVI
const firebaseConfig = {
  apiKey: "AIzaSyAWrw1vDEKOJnEbTMv4bF10vYeZnOI7DpY",
  authDomain: "pasto-sano.firebaseapp.com",
  projectId: "pasto-sano",
  storageBucket: "pasto-sano.firebasestorage.app",
  messagingSenderId: "109720925931",
  appId: "1:109720925931:web:6450822431711297d730ae"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Funzione per creare riders
async function createRiders() {
  try {
    console.log('🚀 Inizio creazione riders...\n');

    // Rider 1 - Mario Rossi
    const rider1 = {
      email: 'mario.rossi@pastosano.it',
      password: 'password123', // In produzione: usa hash bcrypt
      name: 'Mario Rossi',
      phone: '333 1234567',
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef1 = await addDoc(collection(db, 'riders'), rider1);
    console.log('✅ Rider 1 creato con ID:', docRef1.id);
    console.log('   Email:', rider1.email);
    console.log('   Password:', rider1.password);
    console.log('   Nome:', rider1.name);
    console.log('');

    // Rider 2 - Luca Verdi (esempio secondo rider)
    const rider2 = {
      email: 'luca.verdi@pastosano.it',
      password: 'password456',
      name: 'Luca Verdi',
      phone: '334 7654321',
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef2 = await addDoc(collection(db, 'riders'), rider2);
    console.log('✅ Rider 2 creato con ID:', docRef2.id);
    console.log('   Email:', rider2.email);
    console.log('   Password:', rider2.password);
    console.log('   Nome:', rider2.name);
    console.log('');

    console.log('🎉 Collezione "riders" creata con successo!');
    console.log('');
    console.log('📋 CREDENZIALI LOGIN:');
    console.log('');
    console.log('Rider 1:');
    console.log('  Email: mario.rossi@pastosano.it');
    console.log('  Password: password123');
    console.log('');
    console.log('Rider 2:');
    console.log('  Email: luca.verdi@pastosano.it');
    console.log('  Password: password456');
    console.log('');
    console.log('⚠️  IMPORTANTE: In produzione usa bcrypt per le password!');

    process.exit(0);

  } catch (error) {
    console.error('❌ Errore durante la creazione:', error);
    process.exit(1);
  }
}

// Esegui
createRiders();