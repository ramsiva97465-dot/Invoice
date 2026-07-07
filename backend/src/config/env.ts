import dotenv from 'dotenv';
import path from 'path';

// Load .env before anything else imports process.env
dotenv.config({ path: path.join(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
};
