import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const assignField = async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const { fieldId } = req.body;

    if (!fieldId) {
      return res.status(400).json({ message: 'Field ID is required' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const field = await prisma.field.findUnique({ where: { id: fieldId as string } });
    if (!field) return res.status(404).json({ message: 'Field not found' });

    const updatedField = await prisma.field.update({
      where: { id: fieldId as string },
      data: { assignedAgentId: id }
    });

    return res.json(updatedField);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
