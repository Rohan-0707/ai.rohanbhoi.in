export const JUDGE_TEST_EMAIL = "judge@google.com";
export const JUDGE_TEST_OTP = "123456";

export function isJudgeTestEmail(email: string): boolean {
  return email.trim().toLowerCase() === JUDGE_TEST_EMAIL;
}

export function isJudgeTestAccess(
  channel: string,
  email: string,
  code?: string,
): boolean {
  return (
    channel === "email" &&
    isJudgeTestEmail(email) &&
    (code === undefined || code === JUDGE_TEST_OTP)
  );
}
