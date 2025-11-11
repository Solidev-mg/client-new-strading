"use client";

import {
  Message,
  MessageType,
} from "@/app/modules/message/domain/entities/message.entity";
import { useMessagesContext } from "@/contexts/MessageContext";
import { useUser } from "@/contexts/UserContext";
import { useConversation, useMessages } from "@/hooks";
import { webSocketMessagesService } from "@/services/websocket-messages.service";
import { ChevronLeft, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function MessagesPage() {
  const { user, isAdmin } = useUser();
  const { unreadCount } = useMessagesContext();
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [assigning, setAssigning] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    loading: conversationsLoading,
    refresh: refreshConversations,
    assignConversation,
  } = useMessages();

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    refresh: refreshMessages,
  } = useConversation(selectedConversationId || undefined);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket setup for real-time messages
  useEffect(() => {
    if (!user?.id) {
      console.warn("⚠️ WebSocket not connecting: user not available yet");
      return;
    }

    console.log("🔌 Setting up WebSocket for messages page", {
      userId: user.id,
      userType: typeof user.id,
      userRole: user.role,
      userEmail: user.email,
    });

    // Connect to WebSocket with explicit user ID
    webSocketMessagesService.connect(Number(user.id));

    // Listen for new messages
    const handleNewMessage = (newMessage: Message) => {
      // If we're viewing a conversation, check if this message belongs to it
      if (selectedConversationId) {
        // A message belongs to the conversation if its conversationId matches
        if (newMessage.conversationId === selectedConversationId) {
          // Convert to numbers for proper comparison
          const currentUserId = Number(user.id);
          const messageSenderId = Number(newMessage.senderId);

          // Only refresh if message is FROM another user (not from me)
          // This prevents duplicate messages when we send
          if (messageSenderId !== currentUserId) {
            refreshMessages();
          }
        }
      }

      // Always refresh conversations list to update last message and unread count
      refreshConversations();
    };

    webSocketMessagesService.onNewMessage(handleNewMessage);

    // Listen for conversation updates
    webSocketMessagesService.onConversationUpdate(() => {
      refreshConversations();
    });

    // Cleanup on unmount
    return () => {
      webSocketMessagesService.removeAllListeners();
      webSocketMessagesService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId, user?.id, refreshConversations, refreshMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || sending) return;

    try {
      setSending(true);

      // Prepare message data
      const messageData: any = {
        content: newMessage.trim(),
        type: MessageType.TEXT,
      };

      // For admins: we need to specify the receiverId (the client we're talking to)
      // For clients: receiverId is optional - backend handles routing automatically
      if (isAdmin && selectedConversationData?.clientId) {
        messageData.receiverId = selectedConversationData.clientId;
      }

      await sendMessage(messageData);

      setNewMessage("");
      await refreshConversations();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAssignConversation = async (conversationId: number) => {
    try {
      setAssigning(conversationId);
      await assignConversation(conversationId);
      // Refresh conversations after assignment
      await refreshConversations();
    } catch (error) {
      console.error("Erreur lors de l'assignation:", error);
    } finally {
      setAssigning(null);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Hier";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(messageDate);
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const dateKey = formatDate(message.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const selectedConversationData = conversations.find(
    (conv) => Number(conv.id) === selectedConversationId
  );

  if (!user) {
    return (
      <DashboardLayout title="Messages" description="Contactez le support">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Messages" description="Contactez le support client">
      <div className="h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm border flex">
        {/* Conversations List */}
        <div
          className={`${
            selectedConversationId ? "hidden md:block" : ""
          } w-full md:w-1/3 border-r border-gray-200 flex flex-col`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Conversations
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <button
                onClick={refreshConversations}
                disabled={conversationsLoading}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                title="Actualiser"
              >
                <svg
                  className={`h-4 w-4 ${
                    conversationsLoading ? "animate-spin" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Chargement...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">Aucune conversation</p>
                <p className="text-sm text-gray-400">
                  Envoyez un message pour contacter le support
                </p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b border-gray-100 transition-colors ${
                    selectedConversationId === Number(conversation.id)
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : conversation.unreadCount > 0
                      ? "bg-yellow-50 border-l-4 border-l-yellow-400"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {conversation.otherUser?.name.charAt(0).toUpperCase() ||
                        "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.otherUser?.name || "Unknown"}
                          {isAdmin &&
                            conversation.otherUser?.role === "CLIENT" && (
                              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                Client
                              </span>
                            )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conversation.lastMessage
                            ? formatTime(conversation.lastMessage.createdAt)
                            : ""}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage?.content || "Pas de messages"}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unreadCount} non lu
                              {conversation.unreadCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedConversationId(
                                Number(conversation.id)
                              );
                            }}
                            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            Ouvrir
                          </button>
                          {isAdmin && conversation.unreadCount > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignConversation(
                                  Number(conversation.id)
                                );
                              }}
                              disabled={assigning === Number(conversation.id)}
                              className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              {assigning === Number(conversation.id)
                                ? "..."
                                : "M'assigner"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`${
            selectedConversationId ? "" : "hidden md:block"
          } flex-1 flex flex-col`}
        >
          {selectedConversationId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                <button
                  onClick={() => {
                    setSelectedConversationId(null);
                  }}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedConversationData?.otherUser?.name
                    ?.charAt(0)
                    .toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedConversationData?.otherUser?.name || "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-500">Support client</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      Chargement des messages...
                    </p>
                  </div>
                ) : (
                  Object.entries(groupMessagesByDate(messages)).map(
                    ([date, dateMessages]) => (
                      <div key={date}>
                        <div className="text-center mb-4">
                          <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                            {date}
                          </span>
                        </div>
                        {dateMessages.map((message) => {
                          // For clients: compare with senderId (the actual logged-in user's ID)
                          // Convert both to numbers to ensure proper comparison
                          const currentUserId = Number(user.id);
                          const messageSenderId = Number(message.senderId);

                          // IMPORTANT: Client sees their OWN messages on the right
                          // Messages FROM the admin appear on the left
                          const isOwnMessage =
                            messageSenderId === currentUserId;

                          // DEBUG: Log pour identifier le problème
                          if (
                            !isOwnMessage &&
                            messageSenderId &&
                            currentUserId
                          ) {
                            console.log("⚠️ Message affiché à gauche:", {
                              messageId: message.id,
                              messageSenderId,
                              currentUserId,
                              isEqual: messageSenderId === currentUserId,
                              senderEmail: message.sender?.email,
                              content: message.content.substring(0, 20),
                            });
                          }

                          return (
                            <div
                              key={message.id}
                              className={`flex ${
                                isOwnMessage ? "justify-end" : "justify-start"
                              } mb-4`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  isOwnMessage
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-900"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isOwnMessage
                                      ? "text-blue-100"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {formatTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Sélectionnez une conversation
                </h3>
                <p className="mt-2 text-gray-500">
                  Choisissez une conversation pour commencer à discuter avec le
                  support
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
