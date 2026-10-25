import { getChatReply } from "../services/chatBot.js";

export const chatController = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const reply = getChatReply(message);

    return res.status(200).json({
      reply,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Chat failed",
    });
  }
};
