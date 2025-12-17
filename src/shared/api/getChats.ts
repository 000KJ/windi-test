import { Chat } from "@/entities/chat/model/types";
import { generateMockChats, delay } from "@/shared/utils";

export const getChats = async (): Promise<Chat[]> => {
  await delay(500);
  return generateMockChats();
};
