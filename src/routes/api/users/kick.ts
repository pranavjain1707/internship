import { createFileRoute } from "@tanstack/react-router";
import { getCompanyUsers, getCompanyUsersDb, persistDb } from "../../../server/db";

export const Route = createFileRoute("/api/users/kick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { userId, company } = body;
          const companyKey = company || "ekaba";
          const usersList = getCompanyUsers(companyKey);
          const usersCredentialsDb = getCompanyUsersDb(companyKey);

          if (!userId) {
            return new Response(JSON.stringify({ error: "Missing userId." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const index = usersList.findIndex((u) => u.id === userId);
          if (index === -1) {
            return new Response(JSON.stringify({ error: "User not found to kick." }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          const userToKick = usersList[index];
          if (userToKick.role === "Owner") {
            return new Response(JSON.stringify({ error: "Owner cannot be kicked." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          usersList.splice(index, 1);
          const userKey = userToKick.name.toLowerCase().trim();
          delete usersCredentialsDb[userKey];
          persistDb();


          return new Response(
            JSON.stringify({
              success: true,
              message: `Successfully kicked user ${userToKick.name}`,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return new Response(
            JSON.stringify({ error: errorMessage || "Failed to process kick request" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
