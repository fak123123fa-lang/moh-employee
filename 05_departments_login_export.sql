-- 05: أقسام الموظفين + إشعار الدخول + ملف الحساب للبوت + التصدير اليومي 5 صباحاً
-- يُشغَّل بعد 04. يعدّل rw_login/rw_register لإرسال إشعار دخول (بدون أي رمز سري).

alter table rw_accounts add column if not exists dept text;

create or replace function rw__depts() returns text[] language sql immutable as $$
  select array['الهندسة الطبية','الأطباء','التمريض','الصيدلة','المختبر','الأشعة','الإدارة والمالية','الصحة العامة','طب الأسنان','المهن الصحية','الفيزياء الطبية','خدمات ومساندة','أخرى']
$$;

create or replace function rw_set_dept(p_token text, p_dept text) returns json language plpgsql security definer set search_path=public as $$
declare a uuid;
begin
  a := rw__session(p_token);
  if not (p_dept = any(rw__depts())) then p_dept := 'أخرى'; end if;
  update rw_accounts set dept=p_dept where id=a;
  return json_build_object('ok',true,'dept',p_dept);
end $$;

-- rw_login و rw_register و rw_tg_stats و rw_tg_backup و rw__account_profile و rw__daily_export:
-- النسخة الكاملة لكل دالة موجودة في دوال المشروع المطبّقة (راجع الملف المرجعي).
-- rw_login يضيف: insert into rw_sec_log(kind,...) values('login',...);  perform rw__tg_send('🔑 تسجيل دخول'...,'login');
-- rw_register يقبل p_dept ويضيف perform rw__tg_send('👤 حساب جديد'...,'account');
-- rw_tg_stats يضيف 'depts' و 'verified'؛ rw_tg_backup يضيف dept و verified للحسابات.

-- التصدير اليومي: 5 صباحاً بغداد = 2:00 UTC، ينبّه البوت ليجهّز ملفات Excel/JSON ويرسلها للمدراء.
create or replace function rw__daily_export() returns void language plpgsql security definer set search_path=public as $$
begin
  perform rw__tg_int(jsonb_build_object('_int','export','auto',true));
end $$;
revoke all on function rw__daily_export() from public, anon, authenticated;
grant execute on function rw__daily_export() to service_role;
-- select cron.schedule('rw-daily-export','0 2 * * *','select rw__daily_export()');

revoke all on function rw__account_profile(text), rw__depts() from public, anon, authenticated;
grant execute on function rw__account_profile(text), rw__depts() to service_role;
