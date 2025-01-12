import nodemailer from 'nodemailer';
import { z } from 'zod';

import { createEmailTemplate } from './email-template';
import { logger } from './logger';

const emailConfigSchema = z.object({
  host: z.string(),
  port: z.number(),
  secure: z.boolean().default(true),
  auth: z.object({
    user: z.string(),
    pass: z.string(),
  }),
  from: z.string(),
});

const emailOptionsSchema = z.object({
  to: z.union([z.string(), z.array(z.string())]),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
  from: z.string().optional(),
});

type EmailOptions = z.infer<typeof emailOptionsSchema>;

let transporter: nodemailer.Transporter | null = null;

export async function initializeEmailTransporter() {
  try {
    const config = emailConfigSchema.parse({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      from: process.env.EMAIL_FROM || `"HomeDocs" <${process.env.EMAIL_USER}>`,
    });

    transporter = nodemailer.createTransport(config);

    // Verify connection configuration
    await transporter.verify();
    logger.info('Email transporter initialized successfully');
  } catch (error) {
    const errorObject = error instanceof Error ? error : new Error('Unknown error occurred');
    logger.error('Failed to initialize email transporter', { error: errorObject });
    transporter = null;
  }
}

export async function sendEmail(options: EmailOptions) {
  try {
    if (!transporter) {
      await initializeEmailTransporter();
      if (!transporter) {
        throw new Error('Email transporter not initialized');
      }
    }

    const emailOptions = emailOptionsSchema.parse({
      ...options,
      from: options.from || process.env.EMAIL_FROM || `"HomeDocs" <${process.env.EMAIL_USER}>`,
    });

    const info = await transporter.sendMail(emailOptions);
    logger.info('Email sent successfully', { messageId: info.messageId });
    return info;
  } catch (error) {
    const errorObject = error instanceof Error ? error : new Error('Unknown error occurred');
    logger.error('Failed to send email', { error: errorObject, options });
    throw error;
  }
}

export async function sendTaskAssignmentEmail(
  to: string,
  taskTitle: string,
  taskUrl: string,
  assignedBy: string
) {
  const subject = `Task Assigned: ${taskTitle}`;
  const content = `
    <h1>New Task Assignment</h1>
    <p>You have been assigned a new task by ${assignedBy}:</p>
    <h2>${taskTitle}</h2>
    <p>View the task details and manage it here:</p>
    <p><a href="${taskUrl}">${taskUrl}</a></p>
  `;

  const html = createEmailTemplate({
    title: subject,
    previewText: `${assignedBy} has assigned you a new task: ${taskTitle}`,
    content,
  });

  return sendEmail({
    to,
    subject,
    html,
    text: `New Task Assignment\n\nYou have been assigned a new task by ${assignedBy}:\n\n${taskTitle}\n\nView the task details and manage it here: ${taskUrl}`,
    from: process.env.EMAIL_FROM || `"HomeDocs" <${process.env.EMAIL_USER}>`,
  });
}

export async function sendTaskDueReminderEmail(
  to: string,
  taskTitle: string,
  taskUrl: string,
  dueDate: Date
) {
  const subject = `Task Due Soon: ${taskTitle}`;
  const formattedDate = dueDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = `
    <h1>Task Due Reminder</h1>
    <p>You have a task that is due on ${formattedDate}:</p>
    <h2>${taskTitle}</h2>
    <p>View the task details and manage it here:</p>
    <p><a href="${taskUrl}">${taskUrl}</a></p>
  `;

  const html = createEmailTemplate({
    title: subject,
    previewText: `Task "${taskTitle}" is due on ${formattedDate}`,
    content,
  });

  return sendEmail({
    to,
    subject,
    html,
    text: `Task Due Reminder\n\nYou have a task that is due on ${formattedDate}:\n\n${taskTitle}\n\nView the task details and manage it here: ${taskUrl}`,
    from: process.env.EMAIL_FROM || `"HomeDocs" <${process.env.EMAIL_USER}>`,
  });
}

export async function sendHomeShareInviteEmail(
  to: string,
  homeName: string,
  inviteUrl: string,
  invitedBy: string
) {
  const subject = `${process.env.ENVIRONMENT === 'production' ? '' : '[TEST] '} Home Share Invite: ${homeName}`;
  const content = `
    <h1>Home Share Invitation</h1>
    <p>${invitedBy} has invited you to access their home "${homeName}" in HomeDocs.</p>
    <p>Click the link below to accept the invitation and access the home:</p>
    <p><a href="${inviteUrl}">${inviteUrl}</a></p>
  `;

  const html = createEmailTemplate({
    title: subject,
    previewText: `${invitedBy} has invited you to access their home "${homeName}"`,
    content,
  });

  return sendEmail({
    to,
    subject,
    html,
    text: `Home Share Invitation\n\n${invitedBy} has invited you to access their home "${homeName}" in HomeDocs.\n\nClick the link below to accept the invitation and access the home:\n\n${inviteUrl}`,
    from: process.env.EMAIL_FROM || `"HomeDocs" <${process.env.EMAIL_USER}>`,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;
  const subject = `${process.env.ENVIRONMENT === 'production' ? '' : '[TEST] '}Verify your email address`;

  const content = `
    <h1>Welcome to HomeDocs!</h1>
    <p>Please verify your email address by clicking the button below:</p>
    <a href="${verificationUrl}" style="display: inline-block; background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
      Verify Email
    </a>
    <p>If the button doesn't work, you can also click this link:</p>
    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account with HomeDocs, you can safely ignore this email.</p>
  `;

  const html = createEmailTemplate({
    title: subject,
    previewText: 'Please verify your email address to complete your HomeDocs account setup',
    content,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Welcome to HomeDocs!\n\nPlease verify your email address by clicking the following link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account with HomeDocs, you can safely ignore this email.`,
  });
}
