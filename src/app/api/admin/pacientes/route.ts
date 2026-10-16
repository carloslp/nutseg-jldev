import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';
import { generateReadablePin } from '@/lib/security/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      birthDate,
      sex,
      heightCm,
      phoneWhatsapp,
      email,
      clinicalFlags = [],
      allergies = [],
      notes,
    } = body;

    if (!fullName || !birthDate || !sex || !heightCm) {
      return NextResponse.json(
        { error: 'Nombre completo, fecha de nacimiento, sexo y estatura son obligatorios.' },
        { status: 400 }
      );
    }

    // 1. Create client in Supabase / repository
    const client = await NutritionRepository.createClient({
      fullName: fullName.trim(),
      birthDate,
      sex,
      heightCm: Number(heightCm),
      phoneWhatsapp: phoneWhatsapp?.trim() || undefined,
      email: email?.trim() || undefined,
      clinicalFlags,
      allergies,
      notes: notes?.trim() || undefined,
    });

    // 2. Initialize default permalink with readable PIN for the nutritionist
    const initialPin = generateReadablePin();
    await NutritionRepository.createOrUpdatePermalink({
      clientId: client.id,
      pin: initialPin,
    });

    return NextResponse.json({ success: true, client });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error del servidor al registrar paciente' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const clients = await NutritionRepository.getClients();
    return NextResponse.json({ clients });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
