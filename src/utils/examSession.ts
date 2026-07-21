/** 409 from questions start / exam submit — exam locked to another device session */
export function isExamOnOtherDeviceError(error: unknown): boolean {
  const err = error as { response?: { status?: number; data?: { message?: string } } };
  return err?.response?.status === 409;
}

export const EXAM_OTHER_DEVICE_MESSAGE =
  "Exam already in progress on another device. Please continue on the original device.";

export function getExamOnOtherDeviceMessage(error: unknown): string {
  const err = error as { response?: { data?: { message?: string } } };
  const apiMessage = err?.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim()) return apiMessage;
  return EXAM_OTHER_DEVICE_MESSAGE;
}
