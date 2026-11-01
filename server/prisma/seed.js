import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for AI-Powered SaaS Platform...');

  // 1. Create Developer User
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password@123', salt);

  const demoUser = await prisma.user.upsert({
    where: { email: 'kunwarkantikeyagautam@gmail.com' },
    update: {},
    create: {
      name: 'KUNWAR KANTIKEYA GAUTAM',
      email: 'kunwarkantikeyagautam@gmail.com',
      password: hashedPassword,
    },
  });

  console.log(`👤 User created: ${demoUser.name} (${demoUser.email})`);

  // 2. Create Sample AI Generations
  const gen1 = await prisma.aiGeneration.create({
    data: {
      userId: demoUser.id,
      toolType: 'text',
      prompt: 'Explain the difference between Convolutional Neural Networks and Transformers in 3 bullet points.',
      result: `### CNNs vs Transformers Comparison:\n- **Architecture:** CNNs use localized convolution kernels to capture spatial features, whereas Transformers leverage self-attention to model global relationships.\n- **Inductive Bias:** CNNs possess strong spatial translation invariance; Transformers have less inductive bias and require larger training datasets.\n- **Scalability:** Transformers scale more effectively with compute and sequence length, powering modern multimodal models.`,
      provider: 'gemini',
      metadata: { model: 'gemini-1.5-flash', temperature: 0.7 },
    },
  });

  const gen2 = await prisma.aiGeneration.create({
    data: {
      userId: demoUser.id,
      toolType: 'image',
      prompt: 'Futuristic AI datacenter glowing with neon blue fiber optics in a hyper-realistic cybernetic city',
      result: 'https://image.pollinations.ai/prompt/Futuristic%20AI%20datacenter%20glowing%20with%20neon%20blue%20fiber%20optics?width=1024&height=1024&nologo=true',
      provider: 'pollinations-generative',
      metadata: { style: 'Photorealistic', size: '1024x1024' },
    },
  });

  const gen3 = await prisma.aiGeneration.create({
    data: {
      userId: demoUser.id,
      toolType: 'article',
      prompt: 'Topic: Edge Computing in Smart Grids | Tone: Professional | Length: Medium',
      result: `## Transforming Energy Infrastructure with Edge AI\n\n### Introduction\nAs modern electrical grids evolve toward decentralized renewable sources, traditional centralized analytics encounter bandwidth and latency constraints. Integrating Edge AI directly at substation telemetry units provides immediate fault prediction.\n\n### Core Benefits\n1. **Sub-millisecond Anomaly Isolation:** Immediate trip response during micro-grid voltage spikes.\n2. **Reduced Uplink Bandwidth:** On-device summarization avoids streaming raw telemetry over satellite or LTE links.\n3. **Cybersecurity Hardening:** Distributed edge intelligence continues operating during WAN dropouts.\n\n### Conclusion\nEdge AI represents a transformative paradigm for resilient utility operations.`,
      provider: 'groq',
      metadata: { topic: 'Edge Computing in Smart Grids', tone: 'Professional' },
    },
  });

  // 3. Create Sample History Links
  await prisma.history.createMany({
    data: [
      { userId: demoUser.id, generationId: gen1.id },
      { userId: demoUser.id, generationId: gen2.id },
      { userId: demoUser.id, generationId: gen3.id },
    ],
  });

  console.log('✅ Database seeded successfully with initial project records!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
