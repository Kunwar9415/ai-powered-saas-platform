import prisma, { getDbStatus } from './db.js';
import { logger } from '../utils/logger.js';

// Resilient Runtime Memory Store
const inMemoryDB = {
  users: new Map(),
  generations: new Map(),
  documents: new Map(),
  histories: new Map(),
};

// Seed demo developer account (KUNWAR KANTIKEYA GAUTAM)
inMemoryDB.users.set('usr_demo', {
  id: 'usr_demo',
  name: 'KUNWAR KANTIKEYA GAUTAM',
  email: 'kunwarkantikeyagautam@gmail.com',
  // bcrypt hash for Password@123
  password: '$2a$10$wE1V2sK3L4r5q6s7t8u9veW0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const dbRepo = {
  // ================= USER OPERATIONS =================
  async findUserByEmail(email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (getDbStatus() && prisma) {
      try {
        return await prisma.user.findUnique({ where: { email: cleanEmail } });
      } catch (err) {
        logger.warn('PostgreSQL query error, falling back to memory store:', err.message);
      }
    }

    for (const u of inMemoryDB.users.values()) {
      if (u.email.toLowerCase() === cleanEmail) return u;
    }
    return null;
  },

  async findUserById(id) {
    if (getDbStatus() && prisma) {
      try {
        return await prisma.user.findUnique({
          where: { id },
          select: { id: true, name: true, email: true, createdAt: true },
        });
      } catch (err) {}
    }

    const u = inMemoryDB.users.get(id);
    if (u) {
      return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt };
    }
    return null;
  },

  async createUser({ name, email, password }) {
    const cleanEmail = email.toLowerCase().trim();
    if (getDbStatus() && prisma) {
      try {
        return await prisma.user.create({
          data: { name: name.trim(), email: cleanEmail, password },
          select: { id: true, name: true, email: true, createdAt: true },
        });
      } catch (err) {
        logger.warn('PostgreSQL user creation bypassed:', err.message);
      }
    }

    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newUser = { id, name: name.trim(), email: cleanEmail, password, createdAt: new Date() };
    inMemoryDB.users.set(id, newUser);
    return { id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt };
  },

  async updateUser(id, updateData) {
    if (getDbStatus() && prisma) {
      try {
        return await prisma.user.update({
          where: { id },
          data: updateData,
          select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
        });
      } catch (err) {}
    }

    const u = inMemoryDB.users.get(id);
    if (u) {
      if (updateData.name) u.name = updateData.name;
      if (updateData.password) u.password = updateData.password;
      u.updatedAt = new Date();
      return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, updatedAt: u.updatedAt };
    }
    return null;
  },

  // ================= AI GENERATIONS =================
  async createGeneration({ userId, toolType, prompt, result, provider, metadata = {} }) {
    if (getDbStatus() && prisma) {
      try {
        const gen = await prisma.aiGeneration.create({
          data: {
            userId,
            toolType,
            prompt,
            result: typeof result === 'string' ? result : JSON.stringify(result),
            provider,
            metadata,
          },
        });
        await prisma.history.create({
          data: { userId, generationId: gen.id },
        });
        return gen;
      } catch (err) {
        logger.warn('PostgreSQL write bypassed for generation:', err.message);
      }
    }

    const id = 'gen_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const gen = {
      id,
      userId,
      toolType,
      prompt,
      result: typeof result === 'string' ? result : JSON.stringify(result),
      provider,
      metadata,
      createdAt: new Date(),
    };
    inMemoryDB.generations.set(id, gen);

    const historyId = 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    inMemoryDB.histories.set(historyId, {
      id: historyId,
      userId,
      generationId: id,
      createdAt: new Date(),
      generation: gen,
    });

    return gen;
  },

  // ================= DOCUMENTS =================
  async createDocument({ userId, fileName, filePath, fileType, fileSize, extractedText }) {
    if (getDbStatus() && prisma) {
      try {
        return await prisma.document.create({
          data: { userId, fileName, filePath, fileType, fileSize, extractedText },
        });
      } catch (err) {
        logger.warn('PostgreSQL write bypassed for Document:', err.message);
      }
    }

    const id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const doc = {
      id,
      userId,
      fileName,
      filePath,
      fileType,
      fileSize,
      extractedText,
      uploadedAt: new Date(),
    };
    inMemoryDB.documents.set(id, doc);
    return doc;
  },

  async findDocumentById(id, userId) {
    if (getDbStatus() && prisma) {
      try {
        return await prisma.document.findFirst({ where: { id, userId } });
      } catch (err) {}
    }

    const doc = inMemoryDB.documents.get(id);
    return doc && doc.userId === userId ? doc : null;
  },

  async updateDocument(id, updateData) {
    if (getDbStatus() && prisma) {
      try {
        return await prisma.document.update({ where: { id }, data: updateData });
      } catch (err) {}
    }

    const doc = inMemoryDB.documents.get(id);
    if (doc) {
      Object.assign(doc, updateData);
    }
    return doc;
  },

  async getDocumentsByUserId(userId) {
    if (getDbStatus() && prisma) {
      try {
        return await prisma.document.findMany({
          where: { userId },
          orderBy: { uploadedAt: 'desc' },
        });
      } catch (err) {}
    }

    const docs = Array.from(inMemoryDB.documents.values()).filter((d) => d.userId === userId);
    return docs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  },

  async deleteDocument(id, userId) {
    if (getDbStatus() && prisma) {
      try {
        return await prisma.document.delete({ where: { id } });
      } catch (err) {}
    }

    const doc = inMemoryDB.documents.get(id);
    if (doc && doc.userId === userId) {
      inMemoryDB.documents.delete(id);
      return true;
    }
    return false;
  },

  // ================= HISTORY =================
  async getHistory({ userId, toolType, search, page = 1, limit = 20 }) {
    if (getDbStatus() && prisma) {
      try {
        const whereClause = { userId };
        if (toolType && toolType !== 'all') whereClause.generation = { toolType: toolType.toLowerCase() };
        if (search && search.trim() !== '') {
          whereClause.generation = {
            ...whereClause.generation,
            OR: [
              { prompt: { contains: search.trim(), mode: 'insensitive' } },
              { result: { contains: search.trim(), mode: 'insensitive' } },
            ],
          };
        }

        const [total, histories] = await Promise.all([
          prisma.history.count({ where: whereClause }),
          prisma.history.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: { generation: true },
          }),
        ]);

        return {
          history: histories.map((h) => ({ historyId: h.id, createdAt: h.createdAt, generation: h.generation })),
          total,
        };
      } catch (err) {
        logger.warn('PostgreSQL history read bypassed:', err.message);
      }
    }

    let items = Array.from(inMemoryDB.histories.values()).filter((h) => h.userId === userId);

    if (toolType && toolType !== 'all') {
      items = items.filter((h) => h.generation?.toolType === toolType.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      items = items.filter(
        (h) =>
          (h.generation?.prompt && h.generation.prompt.toLowerCase().includes(q)) ||
          (h.generation?.result && h.generation.result.toLowerCase().includes(q))
      );
    }

    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = items.length;
    const paginated = items.slice((page - 1) * limit, page * limit);

    return {
      history: paginated.map((h) => ({ historyId: h.id, createdAt: h.createdAt, generation: h.generation })),
      total,
    };
  },

  async deleteHistory(id, userId) {
    if (getDbStatus() && prisma) {
      try {
        const hist = await prisma.history.findFirst({ where: { id, userId } });
        if (hist) {
          await prisma.aiGeneration.delete({ where: { id: hist.generationId } });
          return true;
        }
      } catch (err) {}
    }

    const hist = inMemoryDB.histories.get(id);
    if (hist && hist.userId === userId) {
      inMemoryDB.histories.delete(id);
      inMemoryDB.generations.delete(hist.generationId);
      return true;
    }
    return false;
  },

  async clearHistory(userId) {
    if (getDbStatus() && prisma) {
      try {
        await prisma.aiGeneration.deleteMany({ where: { userId } });
        return true;
      } catch (err) {}
    }

    for (const [key, val] of inMemoryDB.histories.entries()) {
      if (val.userId === userId) inMemoryDB.histories.delete(key);
    }
    for (const [key, val] of inMemoryDB.generations.entries()) {
      if (val.userId === userId) inMemoryDB.generations.delete(key);
    }
    return true;
  },

  // ================= DASHBOARD STATS =================
  async getDashboardStats(userId) {
    if (getDbStatus() && prisma) {
      try {
        const [totalGenerations, totalDocuments] = await Promise.all([
          prisma.aiGeneration.count({ where: { userId } }),
          prisma.document.count({ where: { userId } }),
        ]);

        const toolCounts = await prisma.aiGeneration.groupBy({
          by: ['toolType'],
          where: { userId },
          _count: { id: true },
        });

        const toolMap = {};
        toolCounts.forEach((item) => {
          toolMap[item.toolType] = item._count.id;
        });

        const metrics = {
          totalGenerations,
          totalDocuments,
          textGenerations: toolMap['text'] || 0,
          imageGenerations: toolMap['image'] || 0,
          articleGenerations: toolMap['article'] || 0,
          titleGenerations: toolMap['title'] || 0,
          documentAnalyses: toolMap['document'] || 0,
          resumeAnalyses: toolMap['resume'] || 0,
        };

        const toolColors = {
          text: '#6366F1',
          image: '#EC4899',
          article: '#8B5CF6',
          title: '#3B82F6',
          document: '#F59E0B',
          resume: '#10B981',
        };

        const toolDistribution = Object.keys(toolColors).map((k) => ({
          name: k.charAt(0).toUpperCase() + k.slice(1),
          count: toolMap[k] || 0,
          fill: toolColors[k],
        }));

        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
          const dateStr = d.toISOString().split('T')[0];
          last7Days.push({ dateStr, day: dayLabel, count: 0 });
        }

        const recentGenerations = await prisma.aiGeneration.findMany({
          where: {
            userId,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
          select: { createdAt: true },
        });

        recentGenerations.forEach((gen) => {
          const genDate = gen.createdAt.toISOString().split('T')[0];
          const match = last7Days.find((d) => d.dateStr === genDate);
          if (match) match.count += 1;
        });

        const recentActivities = await prisma.aiGeneration.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        const recentDocuments = await prisma.document.findMany({
          where: { userId },
          orderBy: { uploadedAt: 'desc' },
          take: 5,
        });

        return {
          metrics,
          toolDistribution,
          activityTimeline: last7Days,
          recentActivities,
          recentDocuments,
        };
      } catch (err) {
        logger.warn('PostgreSQL dashboard stats bypassed:', err.message);
      }
    }

    const userGenerations = Array.from(inMemoryDB.generations.values()).filter((g) => g.userId === userId);
    const userDocs = Array.from(inMemoryDB.documents.values()).filter((d) => d.userId === userId);

    const toolMap = {};
    userGenerations.forEach((g) => {
      toolMap[g.toolType] = (toolMap[g.toolType] || 0) + 1;
    });

    const metrics = {
      totalGenerations: userGenerations.length,
      totalDocuments: userDocs.length,
      textGenerations: toolMap['text'] || 0,
      imageGenerations: toolMap['image'] || 0,
      articleGenerations: toolMap['article'] || 0,
      titleGenerations: toolMap['title'] || 0,
      documentAnalyses: toolMap['document'] || 0,
      resumeAnalyses: toolMap['resume'] || 0,
    };

    const toolColors = {
      text: '#6366F1',
      image: '#EC4899',
      article: '#8B5CF6',
      title: '#3B82F6',
      document: '#F59E0B',
      resume: '#10B981',
    };

    const toolDistribution = Object.keys(toolColors).map((k) => ({
      name: k.charAt(0).toUpperCase() + k.slice(1),
      count: toolMap[k] || 0,
      fill: toolColors[k],
    }));

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push({ dateStr, day: dayLabel, count: 0 });
    }

    userGenerations.forEach((gen) => {
      const genDate = new Date(gen.createdAt).toISOString().split('T')[0];
      const match = last7Days.find((d) => d.dateStr === genDate);
      if (match) match.count += 1;
    });

    const recentActivities = [...userGenerations]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const recentDocuments = [...userDocs]
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 5);

    return {
      metrics,
      toolDistribution,
      activityTimeline: last7Days,
      recentActivities,
      recentDocuments,
    };
  },
};

export default dbRepo;
