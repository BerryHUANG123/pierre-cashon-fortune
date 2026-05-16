// Supabase 配置 - 皮尔卡松的牌运预测
const SUPABASE_URL = 'https://celufcywdbgoblmfdxgk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbHVmY3l3ZGJnb2JsbWZkeGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MjkwNjUsImV4cCI6MjA5NDUwNTA2NX0.tzsXnCXc8o2dVcqiGy4g7vQqUcFpbHBMlDtC8Jzh-cY';

// 初始化 Supabase 客户端（命名避免与 CDN 全局 window.supabase 命名空间冲突）
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
