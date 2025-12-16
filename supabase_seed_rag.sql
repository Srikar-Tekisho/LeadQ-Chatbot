DO $$
DECLARE
    target_user_id uuid;
BEGIN
    SELECT id INTO target_user_id FROM auth.users LIMIT 1;

    IF target_user_id IS NULL THEN
        RAISE NOTICE 'No user found for chat seeding.';
        RETURN;
    END IF;

    -- Seed Knowledge Base Articles (Mock Data without embeddings for now)
    INSERT INTO public.knowledge_base (content, metadata)
    VALUES 
    ('To update your billing information, go to the Billing tab and click "Edit Details". You can update your credit card or billing address there.', '{"category": "billing", "topic": "payment"}'),
    ('You can change your password in the Security section. We recommend using a strong password with at least 8 characters.', '{"category": "security", "topic": "password"}'),
    ('Referral credits are applied automatically at the end of each billing cycle. You earn 500 credits for every successful referral.', '{"category": "referral", "topic": "credits"}'),
    ('The "User Control" section allows Admins to manage team members, assign roles, and view activity logs.', '{"category": "admin", "topic": "users"}'),
    ('Notifications can be configured for Email, Push, and SMS. Go to Notification Settings to toggle these preferences.', '{"category": "notifications", "topic": "preferences"}');

END $$;
