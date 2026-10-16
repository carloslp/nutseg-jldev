import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await NutritionRepository.getClientById(id);
    if (!client) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ client });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await NutritionRepository.updateClient(id, {
      fullName: body.fullName,
      birthDate: body.birthDate,
      sex: body.sex,
      heightCm: body.heightCm ? Number(body.heightCm) : undefined,
      phoneWhatsapp: body.phoneWhatsapp || body.phone,
      phone: body.phone || body.phoneWhatsapp,
      email: body.email,
      clinicalFlags: body.clinicalFlags,
      allergies: body.allergies,
      notes: body.notes,
      isActive: body.isActive,
    });

    if (!updated) {
      return NextResponse.json({ error: 'No se pudo actualizar el paciente' }, { status: 404 });
    }

    return NextResponse.json({ success: true, client: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar paciente' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await NutritionRepository.deleteClient(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al eliminar paciente' }, { status: 500 });
  }
}
