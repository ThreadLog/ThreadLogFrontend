import { prisma } from "../../lib/prisma";
import { sendSupportMail } from "../../lib/mailer";
import type { HandlerContext } from "./helpers";
import { json, AppError } from "./helpers";

export async function submitSupportTicket(ctx: HandlerContext) {
  const { firstname, lastname, email, message, sendAsEmail = false } = ctx.body;

  if (!firstname || !lastname || !email || !message) {
    return json({ error: "Missing fields" }, 400);
  }

  const ticket = await prisma.supportTicket.create({
    data: { firstname, lastname, email, message, sendAsEmail },
  });

  if (sendAsEmail) {
    await sendSupportMail({ firstname, lastname, email, message });
    return json({ status: "email_sent", ticket }, 201);
  }

  return json({ status: "saved_to_db", ticket }, 201);
}
