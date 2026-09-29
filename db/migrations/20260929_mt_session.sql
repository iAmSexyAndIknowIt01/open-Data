-- Серверт хадгалагдах session. JWT cookie-д session_id (sid) орж, хүсэлт бүрт энд байгаа эсэх,
-- хүчингүй болоогүй эсэхийг шалгана. Ингэснээр:
--   * гарахад (logout) тухайн session даруй хүчингүй болно (хулгайлагдсан cookie ажиллахаа болино)
--   * нууц үг солих, сэргээх, имэйл солиход бусад төхөөрөмж дээрх session-ууд хүчингүй болно
-- Энэ migration-ий дараа хуучин (sid-гүй) cookie-тэй бүх хэрэглэгч нэг удаа дахин нэвтэрнэ.

BEGIN;

CREATE TABLE IF NOT EXISTS mt_session (
  session_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES mt_user(user_id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  revoked_at  timestamptz,
  user_agent  varchar(300),
  ip          varchar(64)
);

CREATE INDEX IF NOT EXISTS mt_session_user_idx ON mt_session (user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS mt_session_expires_idx ON mt_session (expires_at);

-- Supabase REST API-аар хандахыг хаана (апп BYPASSRLS хэрэглэгчээр холбогддог)
ALTER TABLE mt_session ENABLE ROW LEVEL SECURITY;

COMMIT;
