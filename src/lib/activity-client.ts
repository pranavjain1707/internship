export const logUserActivity = async (userId: string, userName: string, action: string) => {
  try {
    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userName, action }),
    });
  } catch (e) {
    console.error("[activity-client] Failed to log activity:", e);
  }
};
