import { NextRequest, NextResponse } from 'next/server';

// 🔍 TEST COMPLETO FIREBASE ADMIN SDK
export async function GET() {
  console.log('🔍 === INIZIO TEST FIREBASE ADMIN SDK ===');
  
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: {}
  };

  try {
    // ✅ TEST 1: VERIFICA VARIABILI D'AMBIENTE
    console.log('🔍 Test 1: Verifica variabili d\'ambiente...');
    
    const envVars = {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      // Valori per debug (primi caratteri)
      project_id_value: process.env.FIREBASE_PROJECT_ID || 'MANCANTE',
      client_email_preview: process.env.FIREBASE_CLIENT_EMAIL ? 
        process.env.FIREBASE_CLIENT_EMAIL.substring(0, 30) + '...' : 'MANCANTE',
      private_key_preview: process.env.FIREBASE_PRIVATE_KEY ? 
        process.env.FIREBASE_PRIVATE_KEY.substring(0, 50) + '...' : 'MANCANTE'
    };
    
    results.tests.environment_variables = {
      status: envVars.FIREBASE_PROJECT_ID && envVars.FIREBASE_CLIENT_EMAIL && envVars.FIREBASE_PRIVATE_KEY ? 'PASS' : 'FAIL',
      details: envVars
    };
    
    console.log('📋 Variabili ambiente:', envVars);

    if (!envVars.FIREBASE_PROJECT_ID || !envVars.FIREBASE_CLIENT_EMAIL || !envVars.FIREBASE_PRIVATE_KEY) {
      results.tests.firebase_admin_import = { status: 'SKIP', reason: 'Missing environment variables' };
      results.tests.firebase_initialization = { status: 'SKIP', reason: 'Missing environment variables' };
      results.tests.database_connection = { status: 'SKIP', reason: 'Missing environment variables' };
      results.tests.write_test = { status: 'SKIP', reason: 'Missing environment variables' };
      
      return NextResponse.json({
        success: false,
        message: 'VARIABILI FIREBASE MANCANTI - Configura su Vercel',
        ...results
      });
    }

    // ✅ TEST 2: IMPORT FIREBASE ADMIN SDK
    console.log('🔍 Test 2: Import Firebase Admin SDK...');
    
    let adminApp: any;
    let adminDb: any;
    
    try {
      const { initializeApp: initializeAdminApp, cert, getApps: getAdminApps } = await import('firebase-admin/app');
      const { getFirestore: getAdminFirestore } = await import('firebase-admin/firestore');
      
      results.tests.firebase_admin_import = {
        status: 'PASS',
        message: 'Firebase Admin SDK importato correttamente'
      };
      
      console.log('✅ Firebase Admin SDK importato');

      // ✅ TEST 3: INIZIALIZZAZIONE FIREBASE ADMIN
      console.log('🔍 Test 3: Inizializzazione Firebase Admin...');
      
      if (getAdminApps().length === 0) {
        console.log('🚀 Inizializzazione nuova app Admin...');
        
        const credentials = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        };
        
        console.log('🔑 Credenziali preparate:', {
          projectId: credentials.projectId,
          clientEmail: credentials.clientEmail,
          privateKeyLength: credentials.privateKey.length,
          privateKeyStartsWith: credentials.privateKey.substring(0, 30)
        });
        
        adminApp = initializeAdminApp({
          credential: cert(credentials)
        });
        
        console.log('✅ App Admin inizializzata');
      } else {
        console.log('✅ App Admin già esistente');
        adminApp = getAdminApps()[0];
      }
      
      adminDb = getAdminFirestore(adminApp);
      
      results.tests.firebase_initialization = {
        status: 'PASS',
        message: 'Firebase Admin inizializzato correttamente',
        project_id: process.env.FIREBASE_PROJECT_ID
      };
      
      console.log('✅ Firestore Admin inizializzato');

      // ✅ TEST 4: CONNESSIONE DATABASE
      console.log('🔍 Test 4: Test connessione database...');
      
      try {
        // Prova a leggere la collezione orders
        const ordersRef = adminDb.collection('orders');
        const snapshot = await ordersRef.limit(1).get();
        
        results.tests.database_connection = {
          status: 'PASS',
          message: 'Connessione al database riuscita',
          orders_found: snapshot.size,
          collection_exists: true
        };
        
        console.log('✅ Connessione database OK, ordini trovati:', snapshot.size);
        
      } catch (dbError: any) {
        results.tests.database_connection = {
          status: 'FAIL',
          message: 'Errore connessione database',
          error: dbError.message,
          code: dbError.code
        };
        
        console.error('❌ Errore connessione database:', dbError);
      }

      // ✅ TEST 5: TEST SCRITTURA
      console.log('🔍 Test 5: Test scrittura database...');
      
      try {
        const testOrder = {
          customerName: 'TEST USER',
          customerEmail: 'test@test.com',
          customerPhone: '123456789',
          customerAddress: 'Test Address',
          items: [{
            name: 'Test Item',
            quantity: 1,
            price: 9.99
          }],
          totalAmount: 9.99,
          paymentMethod: 'test',
          paymentStatus: 'test',
          orderStatus: 'test',
          notes: 'TEST ORDER - SAFE TO DELETE',
          source: 'firebase-test',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('📝 Tentativo scrittura ordine test...');
        const docRef = await adminDb.collection('orders').add(testOrder);
        console.log('✅ Ordine test scritto con ID:', docRef.id);
        
        // Prova a leggere l'ordine appena scritto
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          console.log('✅ Ordine test letto correttamente');
          
          // Cancella l'ordine test
          await docRef.delete();
          console.log('✅ Ordine test cancellato');
          
          results.tests.write_test = {
            status: 'PASS',
            message: 'Scrittura, lettura e cancellazione riuscite',
            test_document_id: docRef.id
          };
          
        } else {
          results.tests.write_test = {
            status: 'FAIL',
            message: 'Ordine scritto ma non leggibile',
            test_document_id: docRef.id
          };
        }
        
      } catch (writeError: any) {
        results.tests.write_test = {
          status: 'FAIL',
          message: 'Errore nella scrittura',
          error: writeError.message,
          code: writeError.code
        };
        
        console.error('❌ Errore scrittura:', writeError);
      }

    } catch (importError: any) {
      results.tests.firebase_admin_import = {
        status: 'FAIL',
        message: 'Errore import Firebase Admin SDK',
        error: importError.message
      };
      
      results.tests.firebase_initialization = { status: 'SKIP', reason: 'Import failed' };
      results.tests.database_connection = { status: 'SKIP', reason: 'Import failed' };
      results.tests.write_test = { status: 'SKIP', reason: 'Import failed' };
      
      console.error('❌ Errore import Firebase Admin:', importError);
    }

    // ✅ RIEPILOGO FINALE
    const allTests = Object.values(results.tests);
    const passedTests = allTests.filter((test: any) => test.status === 'PASS').length;
    const failedTests = allTests.filter((test: any) => test.status === 'FAIL').length;
    const skippedTests = allTests.filter((test: any) => test.status === 'SKIP').length;
    
    results.summary = {
      total_tests: allTests.length,
      passed: passedTests,
      failed: failedTests,
      skipped: skippedTests,
      success_rate: `${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`,
      overall_status: failedTests === 0 && passedTests > 0 ? 'SUCCESS' : 'FAILED'
    };
    
    console.log('🎉 === TEST COMPLETATI ===');
    console.log('📊 Riepilogo:', results.summary);
    
    return NextResponse.json({
      success: results.summary.overall_status === 'SUCCESS',
      message: results.summary.overall_status === 'SUCCESS' ? 
        'TUTTI I TEST FIREBASE SUPERATI!' : 
        'ALCUNI TEST FIREBASE FALLITI',
      ...results
    });

  } catch (error: any) {
    console.error('💥 === ERRORE GENERALE TEST ===', error);
    
    return NextResponse.json({
      success: false,
      message: 'ERRORE GENERALE NEL TEST',
      error: {
        message: error.message,
        stack: error.stack,
        type: typeof error
      },
      ...results
    }, { status: 500 });
  }
}

// ✅ POST per test con dati specifici
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 === TEST POST CON DATI SPECIFICI ===');
    
    // Import Firebase Admin
    const { initializeApp: initializeAdminApp, cert, getApps: getAdminApps } = await import('firebase-admin/app');
    const { getFirestore: getAdminFirestore } = await import('firebase-admin/firestore');
    
    let adminDb: any;
    
    if (getAdminApps().length === 0) {
      const adminApp = initializeAdminApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      });
      adminDb = getAdminFirestore(adminApp);
    } else {
      adminDb = getAdminFirestore(getAdminApps()[0]);
    }
    
    // Salva i dati ricevuti
    const testData = {
      ...body,
      timestamp: new Date(),
      source: 'api-test-post'
    };
    
    const docRef = await adminDb.collection('test_orders').add(testData);
    
    return NextResponse.json({
      success: true,
      message: 'Dati salvati correttamente',
      document_id: docRef.id,
      data: testData
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Errore salvataggio dati',
      error: error.message
    }, { status: 500 });
  }
}