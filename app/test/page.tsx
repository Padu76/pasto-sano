'use client';

import { useEffect, useState } from 'react';
import { testFirebaseConnection, addOrder } from '@/lib/firebase';

export default function TestPage() {
  const [results, setResults] = useState<any>({
    envVars: {},
    firebaseInit: null,
    connectionTest: null,
    saveTest: null,
    errors: []
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const testResults: any = {
      envVars: {},
      firebaseInit: null,
      connectionTest: null,
      saveTest: null,
      errors: []
    };

    // 1. TEST ENVIRONMENT VARIABLES
    console.log('🔍 TEST 1: Checking Environment Variables...');
    
    // Check if process.env exists
    if (typeof process !== 'undefined' && process.env) {
      testResults.envVars = {
        FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing',
        FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Present' : '❌ Missing',
        FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Present' : '❌ Missing',
        FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Present' : '❌ Missing',
        FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Present' : '❌ Missing',
        FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Present' : '❌ Missing',
        EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? '✅ Present' : '❌ Missing',
        EMAILJS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ? '✅ Present' : '❌ Missing',
        EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? '✅ Present' : '❌ Missing',
      };
      
      // Log actual values (first 10 chars only for security)
      console.log('API Key preview:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...');
      console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    } else {
      testResults.envVars = { error: '❌ process.env not available in browser' };
      console.error('❌ process.env is not defined');
    }

    // 2. TEST FIREBASE INITIALIZATION
    console.log('🔍 TEST 2: Checking Firebase Initialization...');
    try {
      // Check if Firebase modules are imported
      const { db, auth, storage } = await import('@/lib/firebase');
      
      testResults.firebaseInit = {
        db: db ? '✅ Firestore initialized' : '❌ Firestore NOT initialized',
        auth: auth ? '✅ Auth initialized' : '❌ Auth NOT initialized',
        storage: storage ? '✅ Storage initialized' : '❌ Storage NOT initialized',
      };
      
      console.log('Firebase services:', { db: !!db, auth: !!auth, storage: !!storage });
    } catch (error: any) {
      testResults.firebaseInit = { error: `❌ ${error.message}` };
      testResults.errors.push(`Firebase init error: ${error.message}`);
      console.error('❌ Firebase initialization error:', error);
    }

    // 3. TEST FIREBASE CONNECTION
    console.log('🔍 TEST 3: Testing Firebase Connection...');
    try {
      const isConnected = await testFirebaseConnection();
      testResults.connectionTest = isConnected 
        ? '✅ Firebase connection successful!' 
        : '❌ Firebase connection failed';
      console.log('Firebase connection test:', isConnected);
    } catch (error: any) {
      testResults.connectionTest = `❌ Connection test error: ${error.message}`;
      testResults.errors.push(`Connection test error: ${error.message}`);
      console.error('❌ Connection test error:', error);
    }

    // 4. TEST SAVING ORDER
    console.log('🔍 TEST 4: Testing Order Save...');
    try {
      const testOrder = {
        customerName: 'TEST USER',
        customerEmail: 'test@test.com',
        customerPhone: '1234567890',
        customerAddress: 'Test Address',
        items: [{ name: 'Test Item', quantity: 1, price: 10 }],
        totalAmount: 10,
        paymentMethod: 'test',
        paymentMethodName: 'Test Payment',
        pickupDate: new Date().toISOString(),
        notes: 'This is a test order from debug page',
        source: 'test-page',
        timestamp: new Date(),
      };

      const orderId = await addOrder(testOrder);
      testResults.saveTest = `✅ Test order saved with ID: ${orderId}`;
      console.log('✅ Test order saved successfully:', orderId);
    } catch (error: any) {
      testResults.saveTest = `❌ Save test failed: ${error.message}`;
      testResults.errors.push(`Save test error: ${error.message}`);
      console.error('❌ Save test error:', error);
    }

    // 5. CHECK WINDOW OBJECT
    console.log('🔍 TEST 5: Checking Window Object...');
    if (typeof window !== 'undefined') {
      console.log('Window location:', window.location.href);
      console.log('Window env (if any):', (window as any).__env);
    }

    setResults(testResults);
  };

  const copyToClipboard = () => {
    const text = JSON.stringify(results, null, 2);
    navigator.clipboard.writeText(text);
    alert('Results copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">🔍 Firebase Configuration Test</h1>
        
        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">1. Environment Variables</h2>
          {Object.entries(results.envVars).map(([key, value]) => (
            <div key={key} className="flex justify-between py-2 border-b">
              <span className="font-mono text-sm">{key}:</span>
              <span className={typeof value === 'string' && value.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {String(value)}
              </span>
            </div>
          ))}
        </div>

        {/* Firebase Initialization */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">2. Firebase Initialization</h2>
          {results.firebaseInit && (
            typeof results.firebaseInit === 'object' && !results.firebaseInit.error ? (
              Object.entries(results.firebaseInit).map(([key, value]) => (
                <div key={key} className="py-2">
                  <span className={String(value).includes('✅') ? 'text-green-600' : 'text-red-600'}>
                    {String(value)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-red-600">{results.firebaseInit?.error || 'Not tested yet'}</div>
            )
          )}
        </div>

        {/* Connection Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">3. Firebase Connection Test</h2>
          <div className={results.connectionTest?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
            {results.connectionTest || 'Not tested yet'}
          </div>
        </div>

        {/* Save Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">4. Order Save Test</h2>
          <div className={results.saveTest?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
            {results.saveTest || 'Not tested yet'}
          </div>
        </div>

        {/* Errors */}
        {results.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-red-800">❌ Errors Found</h2>
            {results.errors.map((error: string, index: number) => (
              <div key={index} className="text-red-600 py-1">• {error}</div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button 
            onClick={runTests}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Run Tests Again
          </button>
          <button 
            onClick={copyToClipboard}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            📋 Copy Results
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">📝 What to check:</h3>
          <ol className="list-decimal list-inside text-yellow-800 space-y-1">
            <li>All environment variables should show ✅ Present</li>
            <li>Firebase services should all be initialized</li>
            <li>Connection test should be successful</li>
            <li>Test order should save with an ID</li>
          </ol>
          <p className="mt-4 text-yellow-800">
            <strong>Note:</strong> Check the browser console (F12) for detailed logs!
          </p>
        </div>
      </div>
    </div>
  );
}