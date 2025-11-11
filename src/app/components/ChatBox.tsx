"use client";

import { MessageType } from "@/app/modules/message/domain/entities/message.entity";
import { useMessagesContext } from "@/contexts/MessageContext";
import { useUser } from "@/contexts/UserContext";
import { useConversation, useMessages } from "@/hooks";
import { ChevronDown, MessageCircle, MinusCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatBox() {
  const { user } = useUser();
  const { unreadCount, refreshUnreadCount } = useMessagesContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get or find admin conversation
  const {
    conversations,
    loading: conversationsLoading,
    refresh: refreshConversations,
  } = useMessages();

  // Get the admin user ID from conversations (assuming first admin conversation)
  const adminConversation = conversations?.[0];
  const adminUserId = adminConversation?.otherUser?.id;

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    markAsRead,
  } = useConversation(adminUserId, isOpen && !!adminUserId);

  console.log(messages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
      // Mark unread messages as read
      const unreadMessages = messages.filter(
        (msg) => !msg.isRead && msg.senderId !== user?.clientUserId
      );
      unreadMessages.forEach((msg) => {
        markAsRead(msg.id);
      });
    }
  }, [messages, isOpen, user?.clientUserId, markAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      // Don't specify receiverId - backend will handle conversation routing
      await sendMessage({
        content: newMessage.trim(),
        type: MessageType.TEXT,
      });
      setNewMessage("");
      await refreshConversations();
      await refreshUnreadCount();
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

  const groupMessagesByDate = (msgs: typeof messages) => {
    const groups: { [key: string]: typeof messages } = {};

    msgs.forEach((message) => {
      const dateKey = formatDate(message.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    if (!isOpen) {
      refreshConversations();
      refreshUnreadCount();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 group"
          aria-label="Ouvrir le chat support"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-2 shadow-lg animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 ${
            isMinimized ? "h-16" : "h-[600px]"
          } w-[380px] max-w-[calc(100vw-48px)]`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Support Client</h3>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-blue-100">En ligne</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMinimize}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label={isMinimized ? "Agrandir" : "Réduire"}
              >
                {isMinimized ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <MinusCircle className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={toggleOpen}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Fermer le chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {conversationsLoading || messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">
                        Chargement...
                      </p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-xs">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-blue-500" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 mb-2">
                        Besoin d&apos;aide ?
                      </h4>
                      <p className="text-sm text-gray-600">
                        Envoyez-nous un message et notre équipe vous répondra
                        rapidement.
                      </p>
                    </div>
                  </div>
                ) : (
                  Object.entries(groupMessagesByDate(messages)).map(
                    ([date, dateMessages]) => (
                      <div key={date}>
                        <div className="text-center mb-3">
                          <span className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm border border-gray-200">
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
                              } mb-3`}
                            >
                              <div
                                className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                                  isOwnMessage
                                    ? "bg-blue-500 text-white rounded-br-sm"
                                    : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
                                }`}
                              >
                                <p className="text-sm leading-relaxed break-words">
                                  {message.content}
                                </p>
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

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl text-black">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    aria-label="Envoyer le message"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Nous répondons généralement en quelques minutes
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
