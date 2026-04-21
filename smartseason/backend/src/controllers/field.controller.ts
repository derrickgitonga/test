import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prismaClient';
import { computeFieldStatus } from '../services/field.service';
import { Stage } from '@prisma/client';

export const getFields = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let fields;

    if (userRole === 'ADMIN') {
      fields = await prisma.field.findMany({
        include: { assignedAgent: { select: { id: true, name: true, email: true } }, updates: true }
      });
    } else {
      fields = await prisma.field.findMany({
        where: { assignedAgentId: userId },
        include: { assignedAgent: { select: { id: true, name: true, email: true } }, updates: true }
      });
    }

    const fieldsWithStatus = fields.map(field => {
      const { updates, ...rest } = field;
      return {
        ...rest,
        computedStatus: computeFieldStatus(field)
      };
    });

    return res.json(fieldsWithStatus);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createField = async (req: AuthRequest, res: Response) => {
  try {
    const { name, cropType, plantingDate, assignedAgentId } = req.body;

    if (!name || !cropType || !plantingDate || !assignedAgentId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const agent = await prisma.user.findUnique({ where: { id: assignedAgentId } });
    if (!agent || agent.role !== 'FIELD_AGENT') {
      return res.status(400).json({ message: 'Assigned agent not found.' });
    }

    const field = await prisma.field.create({
      data: {
        name,
        cropType,
        plantingDate: new Date(plantingDate),
        assignedAgentId,
        currentStage: 'PLANTED'
      }
    });

    return res.status(201).json(field);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFieldById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const field = await prisma.field.findUnique({
      where: { id },
      include: {
        assignedAgent: { select: { id: true, name: true } },
        updates: { orderBy: { createdAt: 'desc' }, include: { agent: { select: { name: true } } } }
      }
    });

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    if (userRole !== 'ADMIN' && field.assignedAgentId !== userId) {
      return res.status(403).json({ message: 'Access denied to this field' });
    }

    return res.json({
      ...field,
      computedStatus: computeFieldStatus(field)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateFieldStage = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const { stage } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!stage || !['PLANTED', 'GROWING', 'READY', 'HARVESTED'].includes(stage)) {
      return res.status(400).json({ message: 'Invalid stage' });
    }

    const field = await prisma.field.findUnique({ where: { id } });
    if (!field) return res.status(404).json({ message: 'Field not found' });

    if (userRole !== 'ADMIN' && field.assignedAgentId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stageOrder: Record<string, number> = {
      PLANTED: 0,
      GROWING: 1,
      READY: 2,
      HARVESTED: 3
    };

    if (stageOrder[stage] <= stageOrder[field.currentStage]) {
      return res.status(400).json({ message: 'Stages can only move forward chronologically' });
    }

    const updated = await prisma.field.update({
      where: { id },
      data: { currentStage: stage as Stage }
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const addFieldUpdate = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const { note } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!note) {
      return res.status(400).json({ message: 'Note is required' });
    }

    const field = await prisma.field.findUnique({ where: { id } });
    if (!field) return res.status(404).json({ message: 'Field not found' });

    if (userRole !== 'ADMIN' && field.assignedAgentId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const update = await prisma.fieldUpdate.create({
      data: {
        fieldId: field.id,
        agentId: userId!,
        note,
        stageAtTimeOfUpdate: field.currentStage
      }
    });

    return res.status(201).json(update);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFieldUpdates = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const field = await prisma.field.findUnique({ where: { id } });
    if (!field) return res.status(404).json({ message: 'Field not found' });

    if (userRole !== 'ADMIN' && field.assignedAgentId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = await prisma.fieldUpdate.findMany({
      where: { fieldId: id },
      include: { agent: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(updates);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
