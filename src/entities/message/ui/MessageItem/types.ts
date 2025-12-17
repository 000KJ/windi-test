export interface Message {
  id: string;
  chatId: string;
  text: string;
  authorId: string;
  authorName: string;
  timestamp: number;
  isOwn: boolean;
}
