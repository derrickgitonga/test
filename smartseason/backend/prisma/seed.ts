import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function main() {
  await prisma.fieldUpdate.deleteMany({});
  await prisma.field.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPw = await bcrypt.hash('Admin@2026', 10);
  const agentPw = await bcrypt.hash('Agent@2026', 10);

  const sarah = await prisma.user.create({
    data: { name: 'Sarah Kimani', email: 'sarah.kimani@smartseason.com', password: adminPw, role: 'ADMIN' }
  });

  const james = await prisma.user.create({
    data: { name: 'James Mwangi', email: 'james.mwangi@smartseason.com', password: agentPw, role: 'FIELD_AGENT' }
  });
  const amina = await prisma.user.create({
    data: { name: 'Amina Hassan', email: 'amina.hassan@smartseason.com', password: agentPw, role: 'FIELD_AGENT' }
  });
  const peter = await prisma.user.create({
    data: { name: 'Peter Otieno', email: 'peter.otieno@smartseason.com', password: agentPw, role: 'FIELD_AGENT' }
  });
  const grace = await prisma.user.create({
    data: { name: 'Grace Wanjiku', email: 'grace.wanjiku@smartseason.com', password: agentPw, role: 'FIELD_AGENT' }
  });

  const kikuyuNorth = await prisma.field.create({
    data: { name: 'Kikuyu North Plot', cropType: 'Maize', plantingDate: daysAgo(130), currentStage: 'GROWING', assignedAgentId: james.id }
  });
  const limuruRidge = await prisma.field.create({
    data: { name: 'Limuru Ridge', cropType: 'Wheat', plantingDate: daysAgo(40), currentStage: 'PLANTED', assignedAgentId: james.id }
  });
  const thikaRoad = await prisma.field.create({
    data: { name: 'Thika Road Farm', cropType: 'Tomatoes', plantingDate: daysAgo(20), currentStage: 'PLANTED', assignedAgentId: james.id }
  });

  const mombasaCoastal = await prisma.field.create({
    data: { name: 'Mombasa Coastal Field', cropType: 'Cassava', plantingDate: daysAgo(90), currentStage: 'GROWING', assignedAgentId: amina.id }
  });
  const kilifiEast = await prisma.field.create({
    data: { name: 'Kilifi East Plot', cropType: 'Sorghum', plantingDate: daysAgo(15), currentStage: 'PLANTED', assignedAgentId: amina.id }
  });
  await prisma.field.create({
    data: { name: 'Malindi River Farm', cropType: 'Sugarcane', plantingDate: daysAgo(200), currentStage: 'HARVESTED', assignedAgentId: amina.id }
  });

  const kisumuLakeside = await prisma.field.create({
    data: { name: 'Kisumu Lakeside', cropType: 'Rice', plantingDate: daysAgo(60), currentStage: 'READY', assignedAgentId: peter.id }
  });
  const homabaySouth = await prisma.field.create({
    data: { name: 'Homabay South', cropType: 'Millet', plantingDate: daysAgo(110), currentStage: 'GROWING', assignedAgentId: peter.id }
  });
  const siayaWest = await prisma.field.create({
    data: { name: 'Siaya West Plot', cropType: 'Groundnuts', plantingDate: daysAgo(25), currentStage: 'GROWING', assignedAgentId: peter.id }
  });

  await prisma.field.create({
    data: { name: 'Nakuru Valley', cropType: 'Barley', plantingDate: daysAgo(180), currentStage: 'HARVESTED', assignedAgentId: grace.id }
  });
  const eldoretNorth = await prisma.field.create({
    data: { name: 'Eldoret North Farm', cropType: 'Potatoes', plantingDate: daysAgo(35), currentStage: 'GROWING', assignedAgentId: grace.id }
  });
  const naivashaGreenhouse = await prisma.field.create({
    data: { name: 'Naivasha Greenhouse', cropType: 'Kale', plantingDate: daysAgo(10), currentStage: 'PLANTED', assignedAgentId: grace.id }
  });

  await prisma.fieldUpdate.create({
    data: {
      fieldId: kikuyuNorth.id,
      agentId: james.id,
      note: 'Noticed early signs of leaf blight on the northern edge. Applied fungicide. Monitoring closely.',
      stageAtTimeOfUpdate: 'GROWING',
      createdAt: daysAgo(25)
    }
  });

  await prisma.fieldUpdate.create({
    data: {
      fieldId: mombasaCoastal.id,
      agentId: amina.id,
      note: 'Crop appears healthy, good rainfall this week.',
      stageAtTimeOfUpdate: 'GROWING',
      createdAt: daysAgo(20)
    }
  });
  await prisma.fieldUpdate.create({
    data: {
      fieldId: mombasaCoastal.id,
      agentId: amina.id,
      note: 'Some yellowing on older leaves, may be nitrogen deficiency. Will apply fertiliser.',
      stageAtTimeOfUpdate: 'GROWING',
      createdAt: daysAgo(5)
    }
  });

  await prisma.fieldUpdate.create({
    data: {
      fieldId: kisumuLakeside.id,
      agentId: peter.id,
      note: 'Grains filling well, on track for harvest within two weeks.',
      stageAtTimeOfUpdate: 'READY',
      createdAt: daysAgo(15)
    }
  });
  await prisma.fieldUpdate.create({
    data: {
      fieldId: kisumuLakeside.id,
      agentId: peter.id,
      note: 'Ready for harvest. Awaiting coordinator confirmation.',
      stageAtTimeOfUpdate: 'READY',
      createdAt: daysAgo(3)
    }
  });

  await prisma.fieldUpdate.create({
    data: {
      fieldId: homabaySouth.id,
      agentId: peter.id,
      note: 'Growth has been slower than expected due to dry spell. Irrigation scheduled.',
      stageAtTimeOfUpdate: 'GROWING',
      createdAt: daysAgo(8)
    }
  });

  await prisma.fieldUpdate.create({
    data: {
      fieldId: eldoretNorth.id,
      agentId: grace.id,
      note: 'Tubers forming well. No pest activity observed.',
      stageAtTimeOfUpdate: 'GROWING',
      createdAt: daysAgo(7)
    }
  });

  await prisma.fieldUpdate.create({
    data: {
      fieldId: naivashaGreenhouse.id,
      agentId: grace.id,
      note: 'Germination rate around 85%. Thinning in progress.',
      stageAtTimeOfUpdate: 'PLANTED',
      createdAt: daysAgo(2)
    }
  });

  await prisma.fieldUpdate.create({
    data: {
      fieldId: siayaWest.id,
      agentId: peter.id,
      note: 'Plants at knee height, progressing normally.',
      stageAtTimeOfUpdate: 'GROWING',
      createdAt: daysAgo(4)
    }
  });

  await prisma.fieldUpdate.create({
    data: {
      fieldId: thikaRoad.id,
      agentId: james.id,
      note: 'Seedlings established. First irrigation completed.',
      stageAtTimeOfUpdate: 'PLANTED',
      createdAt: daysAgo(6)
    }
  });

  const userCount = await prisma.user.count();
  const fieldCount = await prisma.field.count();
  const updateCount = await prisma.fieldUpdate.count();

  console.log('Seeding complete.');
  console.log(`Users: ${userCount} | Fields: ${fieldCount} | Updates: ${updateCount}`);
  console.log('');
  console.log('Admin:  sarah.kimani@smartseason.com  /  Admin@2026');
  console.log('Agents: james.mwangi@smartseason.com  /  Agent@2026');
  console.log('        amina.hassan@smartseason.com  /  Agent@2026');
  console.log('        peter.otieno@smartseason.com  /  Agent@2026');
  console.log('        grace.wanjiku@smartseason.com /  Agent@2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
