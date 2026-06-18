import { createFileRoute } from "@tanstack/react-router";
import { getCompanyUsers, getCompanyUsersDb, persistDb } from "../../../server/db";
import { User, UserRole } from "../../../types";
import { supabase, isSupabaseConfigured } from "../../../lib/supabase";

export const Route = createFileRoute("/api/users/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { id, name, email, role, avatar, password, domain, company } = body;
          const companyKey = company || "ekaba";
          const usersList = getCompanyUsers(companyKey);
          const usersCredentialsDb = getCompanyUsersDb(companyKey);

          if (!id || !name || !email || !role) {
            return new Response(
              JSON.stringify({ error: "Missing required fields for user registration." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          // Check if user already exists locally for matching fallback status
          const existingIndex = usersList.findIndex((u) => u.id === id);

          if (isSupabaseConfigured) {
            try {
              const { data, error } = await supabase
                .from("users")
                .upsert({
                  id,
                  name,
                  email,
                  role,
                  avatar: avatar || "EE",
                  password: password || "Password@123",
                  domain: domain || (email.includes("@") ? email.split("@")[1] : "enterprise.com"),
                  company: companyKey.toLowerCase().trim(),
                })
                .select()
                .single();

              if (error) throw error;

              return new Response(
                JSON.stringify({
                  success: true,
                  message: existingIndex !== -1 ? "User updated in database." : "User registered in database.",
                  user: data,
                }),
                { headers: { "Content-Type": "application/json" } },
              );
            } catch (err) {
              console.error("Supabase user register failed, falling back:", err);
            }
          }

          if (existingIndex !== -1) {
            const oldName = usersList[existingIndex].name;
            const oldKey = oldName.toLowerCase().trim();
            const newKey = name.toLowerCase().trim();

            // Clean up old credentials database key if name changed
            if (oldKey !== newKey && usersCredentialsDb[oldKey]) {
              delete usersCredentialsDb[oldKey];
            }

            // Update in-memory user details
            usersList[existingIndex].name = name;
            usersList[existingIndex].role = role as UserRole;
            usersList[existingIndex].email = email;
            if (avatar) {
              usersList[existingIndex].avatar = avatar;
            }

            // Maintain in-memory credentials record under new key
            usersCredentialsDb[newKey] = {
              name: name.trim(),
              domain: domain
                ? domain.trim()
                : email.includes("@")
                  ? email.split("@")[1]
                  : "enterprise.com",
              password: password || usersCredentialsDb[newKey]?.password || "Password@123",
              role: role,
            };

            persistDb();

            return new Response(
              JSON.stringify({
                success: true,
                message: "User updated in database.",
                user: usersList[existingIndex],
              }),
              { headers: { "Content-Type": "application/json" } },
            );
          }

          // Maintain in-memory credentials record for new user
          const userKey = name.toLowerCase().trim();
          usersCredentialsDb[userKey] = {
            name: name.trim(),
            domain: domain
              ? domain.trim()
              : email.includes("@")
                ? email.split("@")[1]
                : "enterprise.com",
            password: password || "Password@123",
            role: role,
          };

          const newUser: User = { id, name, email, role, avatar: avatar || "EE" };
          usersList.push(newUser);
          persistDb();

          return new Response(JSON.stringify({ success: true, user: newUser }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return new Response(
            JSON.stringify({
              error: errorMessage || "Failed to process user registration",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
