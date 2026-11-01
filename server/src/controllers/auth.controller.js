import bcrypt from 'bcryptjs';
import dbRepo from '../config/dbRepository.js';
import { generateToken } from '../utils/token.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required fields.', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 'Please provide a valid email address.', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long.', 400);
    }

    // Check if user already exists
    const existingUser = await dbRepo.findUserByEmail(email);

    if (existingUser) {
      return errorResponse(res, 'An account with this email address already exists.', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await dbRepo.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const token = generateToken({ userId: user.id, email: user.email, name: user.name });
    logger.success(`New user registered: ${user.email} (${user.id})`);

    return successResponse(
      res,
      { user, token },
      'Registration successful! Welcome to the AI SaaS Platform.',
      201
    );
  } catch (error) {
    logger.error('Registration error:', error.message);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // Quick demo login convenience for KUNWAR KANTIKEYA GAUTAM
    if (
      (cleanEmail === 'kunwarkantikeyagautam@gmail.com' || cleanEmail === 'demo@omnianalytics.ai') &&
      (password === 'Password@123' || password === 'Demo@123456')
    ) {
      const demoUser = {
        id: 'usr_demo',
        name: 'KUNWAR KANTIKEYA GAUTAM',
        email: 'kunwarkantikeyagautam@gmail.com',
        createdAt: new Date(),
      };
      const token = generateToken({ userId: demoUser.id, email: demoUser.email, name: demoUser.name });
      return successResponse(res, { user: demoUser, token }, 'Logged in successfully as KUNWAR KANTIKEYA GAUTAM.');
    }

    const user = await dbRepo.findUserByEmail(email);

    if (!user) {
      return errorResponse(res, 'Invalid email or password credentials.', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password credentials.', 401);
    }

    const token = generateToken({ userId: user.id, email: user.email, name: user.name });
    logger.success(`User logged in: ${user.email}`);

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
      'Login successful! Welcome back.'
    );
  } catch (error) {
    logger.error('Login error:', error.message);
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, { user: req.user }, 'User profile retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, newPassword } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (newPassword && newPassword.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await dbRepo.updateUser(userId, updateData);

    return successResponse(res, { user: updatedUser || req.user }, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
};
