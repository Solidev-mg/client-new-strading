"use client";

import {
  Message,
  MessageType,
} from "@/app/modules/message/domain/entities/message.entity";
import { useMessagesContext } from "@/contexts/MessageContext";
import { useUser } from "@/contexts/UserContext";
import { useConversation, useMessages } from "@/hooks";
import { ChevronLeft, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function MessagesPage() {
  const { user } = useUser();
  const { unreadCount } = useMessagesContext();
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    loading: conversationsLoading,
    refresh: refreshConversations,
  } = useMessages();

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
  } = useConversation(selectedConversation || undefined);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      await sendMessage({
        content: newMessage.trim(),
        type: MessageType.TEXT,
        receiverId: selectedConversation,
      });
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
    (conv) => conv.otherUser.id === selectedConversation
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
            selectedConversation ? "hidden md:block" : ""
          } w-full md:w-1/3 border-r border-gray-200 flex flex-col`}
        >
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Conversations
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h2>
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
                  onClick={() =>
                    setSelectedConversation(conversation.otherUser.id)
                  }
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation.otherUser.id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {conversation.otherUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.otherUser.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <div className="mt-1">
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unreadCount} non lu
                            {conversation.unreadCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
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
            selectedConversation ? "" : "hidden md:block"
          } flex-1 flex flex-col`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedConversationData?.otherUser.name
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedConversationData?.otherUser.name}
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
                          const isOwnMessage =
                            message.senderId === user.clientUserId;
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
