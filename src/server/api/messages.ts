import { getPrisma } from "../../lib/prisma";
import type { HandlerContext } from "./helpers";
import { json, AppError, requireUser, restrictTo, parseId } from "./helpers";

export async function sendMessage(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "JOB_SEEKER", "COMPANY_RECRUITER");
  const data = ctx.body;

  if (user.id === data.receiverId && user.role === data.receiverRole) {
    return json({ message: "You cannot send a message to yourself" }, 400);
  }

  const message: any = { content: data.content };
  if (user.role === "JOB_SEEKER") message.senderJobSeekerId = user.id;
  else message.senderRecruiterId = user.id;

  if (data.receiverRole === "JOB_SEEKER") message.receiverJobSeekerId = data.receiverId;
  else message.receiverRecruiterId = data.receiverId;

  const created = await getPrisma().messages.create({ data: message });
  return json({ status: "success", data: created }, 201);
}

export async function getConversation(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "JOB_SEEKER", "COMPANY_RECRUITER");
  const otherId = parseId(ctx.params.otherId);
  const otherRole = ctx.query.get("role");

  if (!otherId || !otherRole) {
    return json({ message: "Please provide the other user's ID in the URL and their role in the query string" }, 400);
  }

  const mySenderCol = user.role === "JOB_SEEKER" ? "senderJobSeekerId" : "senderRecruiterId";
  const myReceiverCol = user.role === "JOB_SEEKER" ? "receiverJobSeekerId" : "receiverRecruiterId";
  const otherSenderCol = otherRole === "JOB_SEEKER" ? "senderJobSeekerId" : "senderRecruiterId";
  const otherReceiverCol = otherRole === "JOB_SEEKER" ? "receiverJobSeekerId" : "receiverRecruiterId";

  const messages = await getPrisma().messages.findMany({
    where: {
      OR: [
        { [mySenderCol]: user.id, [otherReceiverCol]: otherId },
        { [otherSenderCol]: otherId, [myReceiverCol]: user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  return json({ status: "success", results: messages.length, data: { messages } });
}

export async function getAllConversationsList(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "JOB_SEEKER", "COMPANY_RECRUITER");

  const receiverCol = user.role === "JOB_SEEKER" ? "receiverJobSeekerId" : "receiverRecruiterId";

  const messages = await getPrisma().messages.findMany({
    where: { [receiverCol]: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      senderRecruiter: { select: { id: true, companyName: true, logoUrl: true } },
      senderJobSeeker: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
    },
  });

  return json({ status: "success", results: messages.length, data: { messages } });
}
