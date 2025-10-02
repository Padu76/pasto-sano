import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { origin, destination } = await request.json();

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Google Maps API key non configurata' },
        { status: 500 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(
      destination
    )}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { success: false, error: 'Errore nel calcolo della distanza' },
        { status: 400 }
      );
    }

    const element = data.rows[0]?.elements[0];

    if (element?.status !== 'OK') {
      return NextResponse.json(
        { success: false, error: 'Indirizzo non trovato' },
        { status: 400 }
      );
    }

    const distanceInMeters = element.distance.value;
    const distanceInKm = distanceInMeters / 1000;

    return NextResponse.json({
      success: true,
      distance: parseFloat(distanceInKm.toFixed(2)),
      distanceText: element.distance.text,
      duration: element.duration.text
    });

  } catch (error: any) {
    console.error('Errore API calculate-distance:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}